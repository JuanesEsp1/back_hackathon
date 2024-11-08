const { generarPDF } = require("../services/pdfGenerator");
const { generarXMLUBL } = require("../services/generarXmlConfig");
const fs = require('fs');

// Controlador para generar factura
async function generarFactura(req, res) {
  try {
    // Generación del XML
    const xmlString = await generarXMLUBL(req);
    fs.writeFileSync(`factura_${req.body.numeroFactura}.xml`, xmlString);

    // Generación del PDF
    await generarPDF(req, res);

    res.send({ message: "Factura generada exitosamente." });
  } catch (error) {
    console.error("Error al generar factura:", error);
    res.status(500).send({ error: "Error al generar la factura" });const { generarPDF } = require("../services/pdfGenerator");
    const { generarXMLUBL } = require("../services/generarXmlConfig");
    const uploadFile = require("../services/uploadPDF");
    const QRCode = require('qrcode');
    const db = require("../controller/db");
    
    async function generarFactura(req, res) {
        try {
            const { numeroFactura, fecha, cliente, items, total, impuestos, notas } = req.body;
    
            // Validaciones básicas
            if (!numeroFactura || !cliente || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    error: "Datos incompletos",
                    mensaje: "Se requieren todos los campos obligatorios"
                });
            }
    
            // 1. Generar XML
            const xmlString = await generarXMLUBL(req);
    
            // 2. Generar QR con el XML
            const qrBuffer = await QRCode.toBuffer(xmlString);
            
            // 3. Subir QR a Cloudinary
            const qrResult = await uploadFile(
                qrBuffer,
                'facturas/qr',
                `qr-${numeroFactura}.png`
            );
    
            // 4. Generar PDF
            const pdfBuffer = await generarPDF({
                numeroFactura,
                fecha,
                cliente,
                items,
                total,
                impuestos,
                notas,
                qrUrl: qrResult.secure_url
            });
    
            // 5. Subir PDF a Cloudinary
            const pdfResult = await uploadFile(
                pdfBuffer,
                'facturas/pdf',
                `factura-${numeroFactura}.pdf`
            );
    
            // 6. Guardar en base de datos
            const facturaDB = await db.query(
                `INSERT INTO facturas (
                    numero_factura, fecha_emision, cliente_id,
                    subtotal, impuestos, total, pdf_url, qr_url,
                    notas, estado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    numeroFactura,
                    fecha,
                    cliente.id,
                    total,
                    impuestos,
                    parseFloat(total) + parseFloat(impuestos),
                    pdfResult.secure_url,
                    qrResult.secure_url,
                    notas,
                    'EMITIDA'
                ]
            );
    
            // 7. Guardar items en la base de datos
            for (const item of items) {
                await db.query(
                    `INSERT INTO factura_items (
                        factura_id, producto_id, descripcion,
                        cantidad, precio_unitario, subtotal,
                        impuesto, total
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        facturaDB.insertId,
                        item.producto_id,
                        item.descripcion,
                        item.cantidad,
                        item.precioUnitario,
                        item.precio,
                        item.impuesto || 0,
                        item.precio
                    ]
                );
            }
    
            // 8. Responder con éxito
            res.json({
                mensaje: "Factura generada exitosamente",
                factura: {
                    id: facturaDB.insertId,
                    numero: numeroFactura,
                    pdf_url: pdfResult.secure_url,
                    qr_url: qrResult.secure_url
                }
            });
    
        } catch (error) {
            console.error("Error al generar factura:", error);
            res.status(500).json({
                error: "Error al generar la factura",
                detalles: error.message
            });
        }
    }
    
    // Método para obtener una factura
    async function obtenerFactura(req, res) {
        try {
            const { id } = req.params;
            
            const [factura] = await db.query(
                `SELECT f.*, 
                        c.nombre as cliente_nombre,
                        c.documento as cliente_documento
                 FROM facturas f
                 LEFT JOIN clientes c ON f.cliente_id = c.id
                 WHERE f.id = ?`,
                [id]
            );
    
            if (!factura) {
                return res.status(404).json({
                    error: "Factura no encontrada"
                });
            }
    
            const items = await db.query(
                `SELECT * FROM factura_items WHERE factura_id = ?`,
                [id]
            );
    
            res.json({
                factura: {
                    ...factura,
                    items
                }
            });
    
        } catch (error) {
            console.error("Error al obtener factura:", error);
            res.status(500).json({
                error: "Error al obtener la factura",
                detalles: error.message
            });
        }
    }
    
    module.exports = {
        generarFactura,
        obtenerFactura
    };
  }
}

module.exports = { generarFactura };
