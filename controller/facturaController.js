const { PDFDocument, StandardFonts } = require('pdf-lib');
const xml2js = require('xml2js');
const QRCode = require('qrcode');

class FacturaController {
    async generarFactura(req, res) {
        try {
            const {
                numeroFactura,
                fecha,
                cliente,
                items,
                total,
                impuestos
            } = req.body;

            // 1. Generar XML (requerido por muchas autoridades fiscales)
            const xmlFactura = {
                Factura: {
                    $: {
                        version: '1.0',
                        numeroFactura: numeroFactura
                    },
                    Encabezado: {
                        Fecha: fecha,
                        Cliente: cliente
                    },
                    Items: {
                        Item: items
                    },
                    Totales: {
                        Total: total,
                        Impuestos: impuestos
                    }
                }
            };

            // Convertir a string XML
            const builder = new xml2js.Builder();
            const xmlString = builder.buildObject(xmlFactura);

            // 2. Generar PDF
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            
            // Agregar contenido al PDF
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            page.drawText(`Factura Electrónica N°: ${numeroFactura}`, {
                x: 50,
                y: height - 50,
                size: 20,
                font
            });

            // 3. Generar código QR (muchos países lo requieren)
            const qrCode = await QRCode.toDataURL(xmlString);

            // 4. Guardar documentos
            const pdfBytes = await pdfDoc.save();

            // 5. Enviar respuesta
            res.setHeader('Content-Type', 'application/pdf');
            res.send(Buffer.from(pdfBytes));

        } catch (error) {
            res.status(500).json({
                error: 'Error al generar la factura',
                detalles: error.message
            });
        }
    }
}

module.exports = new FacturaController();