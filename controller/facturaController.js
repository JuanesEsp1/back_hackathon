const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const xml2js = require('xml2js');
const QRCode = require('qrcode');

class FacturaController {
    async generarFactura(req, res) {
        try {
            // Validación básica de la estructura
            if (!Array.isArray(req.body.items)) {
                throw new Error('Los items deben ser un array de productos');
            }

            const {
                numeroFactura,
                fecha,
                cliente,
                items,
                total,
                impuestos
            } = req.body;

            // Convertir strings a números si es necesario
            const totalNumerico = parseFloat(total);
            const impuestosNumericos = parseFloat(impuestos);

            if (isNaN(totalNumerico) || isNaN(impuestosNumericos)) {
                throw new Error('El total y los impuestos deben ser valores numéricos');
            }

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
            const page = pdfDoc.addPage([595.28, 841.89]); // Tamaño A4
            const { width, height } = page.getSize();
            
            // Configuración de fuentes
            const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontSize = 10;
            const titleSize = 16;
            const subtitleSize = 12;
            
            let yPosition = height - 50;
            
            // Título principal centrado
            const titleText = `FACTURA ELECTRÓNICA`;
            const titleWidth = helveticaBold.widthOfTextAtSize(titleText, titleSize);
            page.drawText(titleText, {
                x: (width - titleWidth) / 2,
                y: yPosition,
                size: titleSize,
                font: helveticaBold,
                color: rgb(0, 0, 0)
            });

            // Número de factura centrado
            yPosition -= 25;
            const numeroText = `N° ${numeroFactura}`;
            const numeroWidth = helveticaBold.widthOfTextAtSize(numeroText, subtitleSize);
            page.drawText(numeroText, {
                x: (width - numeroWidth) / 2,
                y: yPosition,
                size: subtitleSize,
                font: helveticaBold,
                color: rgb(0, 0, 0)
            });

            // Línea separadora
            yPosition -= 20;
            page.drawLine({
                start: { x: 50, y: yPosition },
                end: { x: width - 50, y: yPosition },
                thickness: 1,
                color: rgb(0.7, 0.7, 0.7),
            });

            // Información de la empresa (ejemplo)
            yPosition -= 25;
            page.drawText('EMPRESA EJEMPLO S.A.', {
                x: 50,
                y: yPosition,
                size: subtitleSize,
                font: helveticaBold,
                color: rgb(0, 0, 0)
            });

            yPosition -= 15;
            page.drawText('NIT: 900.XXX.XXX-X', {
                x: 50,
                y: yPosition,
                size: fontSize,
                font: helvetica,
                color: rgb(0, 0, 0)
            });

            yPosition -= 15;
            page.drawText('Dirección: Calle Principal #123', {
                x: 50,
                y: yPosition,
                size: fontSize,
                font: helvetica,
                color: rgb(0, 0, 0)
            });

            // Información del cliente y fecha en dos columnas
            yPosition -= 40;
            // Columna izquierda - Cliente
            page.drawText('INFORMACIÓN DEL CLIENTE', {
                x: 50,
                y: yPosition,
                size: subtitleSize,
                font: helveticaBold,
                color: rgb(0, 0, 0)
            });

            // Columna derecha - Fecha
            page.drawText('FECHA DE EMISIÓN', {
                x: width - 200,
                y: yPosition,
                size: subtitleSize,
                font: helveticaBold,
                color: rgb(0, 0, 0)
            });

            yPosition -= 20;
            page.drawText(`Cliente: ${typeof cliente === 'object' ? cliente.nombre : cliente}`, {
                x: 50,
                y: yPosition,
                size: fontSize,
                font: helvetica,
                color: rgb(0, 0, 0)
            });

            page.drawText(`${fecha}`, {
                x: width - 200,
                y: yPosition,
                size: fontSize,
                font: helvetica,
                color: rgb(0, 0, 0)
            });

            // Tabla de items
            yPosition -= 40;
            // Encabezados de la tabla
            const tableHeaders = ['Descripción', 'Cantidad', 'Precio Unit.', 'Total'];
            const columnWidths = [250, 80, 100, 100];
            let xPosition = 50;

            tableHeaders.forEach((header, index) => {
                page.drawText(header, {
                    x: xPosition,
                    y: yPosition,
                    size: fontSize,
                    font: helveticaBold,
                    color: rgb(0, 0, 0)
                });
                xPosition += columnWidths[index];
            });

            // Línea bajo los encabezados
            yPosition -= 5;
            page.drawLine({
                start: { x: 50, y: yPosition },
                end: { x: width - 50, y: yPosition },
                thickness: 1,
                color: rgb(0, 0, 0),
            });

            // Items
            yPosition -= 20;
            if (Array.isArray(items)) {
                items.forEach(item => {
                    xPosition = 50;
                    page.drawText(item.descripcion, {
                        x: xPosition,
                        y: yPosition,
                        size: fontSize,
                        font: helvetica,
                        color: rgb(0, 0, 0)
                    });
                    
                    xPosition += columnWidths[0];
                    page.drawText(item.cantidad.toString(), {
                        x: xPosition,
                        y: yPosition,
                        size: fontSize,
                        font: helvetica,
                        color: rgb(0, 0, 0)
                    });
                    
                    xPosition += columnWidths[1];
                    page.drawText(`$${item.precioUnitario}`, {
                        x: xPosition,
                        y: yPosition,
                        size: fontSize,
                        font: helvetica,
                        color: rgb(0, 0, 0)
                    });
                    
                    xPosition += columnWidths[2];
                    page.drawText(`$${item.precio}`, {
                        x: xPosition,
                        y: yPosition,
                        size: fontSize,
                        font: helvetica,
                        color: rgb(0, 0, 0)
                    });
                    
                    yPosition -= 20;
                });
            } else {
                page.drawText(items, {
                    x: 50,
                    y: yPosition,
                    size: fontSize,
                    font: helvetica,
                    color: rgb(0, 0, 0)
                });
                yPosition -= 20;
            }

            // Totales alineados a la derecha
            yPosition -= 20;
            const totalesX = width - 200;
            
            page.drawText('Subtotal:', {
                x: totalesX,
                y: yPosition,
                size: fontSize,
                font: helveticaBold,
                color: rgb(0, 0, 0)
            });
            
            page.drawText(`$${total}`, {
                x: totalesX + 100,
                y: yPosition,
                size: fontSize,
                font: helvetica,
                color: rgb(0, 0, 0)
            });

            yPosition -= 20;
            page.drawText('Impuestos:', {
                x: totalesX,
                y: yPosition,
                size: fontSize,
                font: helveticaBold,
                color: rgb(0, 0, 0)
            });
            
            page.drawText(`$${impuestos}`, {
                x: totalesX + 100,
                y: yPosition,
                size: fontSize,
                font: helvetica,
                color: rgb(0, 0, 0)
            });

            yPosition -= 20;
            page.drawLine({
                start: { x: totalesX, y: yPosition + 15 },
                end: { x: width - 50, y: yPosition + 15 },
                thickness: 1,
                color: rgb(0, 0, 0),
            });

            page.drawText('TOTAL:', {
                x: totalesX,
                y: yPosition,
                size: subtitleSize,
                font: helveticaBold,
                color: rgb(0, 0, 0)
            });
            
            page.drawText(`$${parseFloat(total) + parseFloat(impuestos)}`, {
                x: totalesX + 100,
                y: yPosition,
                size: subtitleSize,
                font: helveticaBold,
                color: rgb(0, 0, 0)
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