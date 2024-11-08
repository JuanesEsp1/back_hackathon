const PDFDocument = require('pdfkit');

const generateInvoicePDF = async (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const buffers = [];

            // Capturar el contenido del PDF en buffers
            doc.on('data', buffer => buffers.push(buffer));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Diseño del PDF
            doc.fontSize(20).text('FACTURA ELECTRÓNICA', { align: 'center' });
            doc.moveDown();
            
            // Información de la factura
            doc.fontSize(12).text(`Factura N°: ${invoiceData.numeroFactura}`);
            doc.text(`Fecha: ${invoiceData.fecha}`);
            doc.moveDown();

            // Información del cliente
            doc.text('DATOS DEL CLIENTE');
            doc.text(`Nombre: ${invoiceData.cliente.nombre}`);
            doc.text(`Documento: ${invoiceData.cliente.documento}`);
            doc.text(`Dirección: ${invoiceData.cliente.direccion}`);
            doc.text(`Teléfono: ${invoiceData.cliente.telefono}`);
            doc.text(`Email: ${invoiceData.cliente.email}`);
            doc.moveDown();

            // Tabla de productos
            doc.text('DETALLE DE PRODUCTOS', { underline: true });
            doc.moveDown();

            // Encabezados de la tabla
            const startX = 50;
            let currentY = doc.y;
            
            doc.text('Descripción', startX, currentY);
            doc.text('Cant.', 300, currentY);
            doc.text('Precio', 370, currentY);
            doc.text('Total', 450, currentY);
            
            doc.moveDown();

            // Productos
            invoiceData.items.forEach(item => {
                currentY = doc.y;
                doc.text(item.descripcion, startX, currentY);
                doc.text(item.cantidad.toString(), 300, currentY);
                doc.text(`$${item.precioUnitario}`, 370, currentY);
                doc.text(`$${item.precio}`, 450, currentY);
                doc.moveDown();
            });

            doc.moveDown();

            // Totales
            const totalY = doc.y + 20;
            doc.text('Subtotal:', 350, totalY);
            doc.text(`$${invoiceData.total}`, 450, totalY);
            
            doc.text('IVA:', 350, totalY + 20);
            doc.text(`$${invoiceData.impuestos}`, 450, totalY + 20);
            
            doc.text('Total:', 350, totalY + 40);
            doc.text(`$${invoiceData.total + invoiceData.impuestos}`, 450, totalY + 40);

            // Notas
            doc.moveDown();
            doc.moveDown();
            doc.text('Notas:', { underline: true });
            doc.text(invoiceData.notas);

            // Finalizar el PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateInvoicePDF;