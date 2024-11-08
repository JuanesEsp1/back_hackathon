const generateInvoicePDF = require("../services/generateInvoicePDF");
const uploadFile = require("../services/uploadPDF");
const connect = require("./dbFacturasConfig");

const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    // Generar el PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Verificar que el buffer es válido
    if (!Buffer.isBuffer(pdfBuffer)) {
      throw new Error("Error generando el PDF: Buffer inválido");
    }
    // Subir a Cloudinary
    const filename = `${invoiceData.numeroFactura}.pdf`;
    const uploadResult = await uploadFile(pdfBuffer, "facturas", filename);

    // Insertar la factura principal
    const [facturaResult] = await connect.execute(
      `INSERT INTO facturas (
                numero_factura, 
                fecha_emision, 
                cliente_id, 
                subtotal,
                impuestos,
                total,
                pdf_url,
                notas,
                estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceData.numeroFactura,
        invoiceData.fecha,
        invoiceData.cliente.id,
        invoiceData.total,
        invoiceData.impuestos,
        invoiceData.total + invoiceData.impuestos,
        uploadResult.secure_url,
        invoiceData.notas,
        "EMITIDA",
      ]
    );


    // Insertar los items
    for (const item of invoiceData.items) {
      await connect.execute(
        `INSERT INTO factura_items (
                    factura_id,
                    producto_id,
                    descripcion,
                    cantidad,
                    precio_unitario,
                    subtotal,
                    impuesto,
                    total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          facturaResult.insertId,
          item.producto_id,
          item.descripcion,
          item.cantidad,
          item.precioUnitario,
          item.precio,
          item.impuesto,
          item.precio + item.impuesto,
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: "Factura creada exitosamente",
      data: {
        facturaId: facturaResult.insertId,
        pdfUrl: uploadResult.secure_url,
      },
    });
  } catch (error) {
    console.error("Error al crear la factura:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la factura",
      error: error.message,
    });
  }
};

module.exports = createInvoice; // Exportar la función directamente
