const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

async function generarPDF(datos) {
    try {
        const { numeroFactura, fecha, cliente, items, total, impuestos } = datos;

        const pdfDoc = await PDFDocument.create();
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const { width } = page.getSize();

        const styles = {
            title: { size: 24, font: helveticaBold },
            subtitle: { size: 16, font: helveticaBold },
            heading: { size: 12, font: helveticaBold },
            normal: { size: 10, font: helvetica },
            small: { size: 8, font: helvetica }
        };

        // Encabezado
        page.drawText("FACTURA ELECTRÓNICA", {
            x: (width - helveticaBold.widthOfTextAtSize("FACTURA ELECTRÓNICA", styles.title.size)) / 2,
            y: 750,
            ...styles.title,
            color: rgb(0, 0, 0),
        });

        // Información de la empresa
        const empresaInfo = [
            "TU EMPRESA S.A.",
            "NIT: 900.XXX.XXX-X",
            "Resolución DIAN: 18760000001",
            "Régimen Común",
            "Dirección: Calle Principal #123",
        ];

        empresaInfo.forEach((text, index) => {
            page.drawText(text, {
                x: 50,
                y: 720 - index * 15,
                ...styles.normal,
                color: rgb(0, 0, 0),
            });
        });

        // Información del Cliente
        const clienteInfo = [
            { label: "Cliente:", value: cliente.nombre },
            { label: "NIT/CC:", value: cliente.documento },
            { label: "Dirección:", value: cliente.direccion },
            { label: "Teléfono:", value: cliente.telefono },
            { label: "Email:", value: cliente.email },
        ];

        clienteInfo.forEach((info, index) => {
            page.drawText(info.label, {
                x: 50,
                y: 620 - index * 15,
                ...styles.heading,
                color: rgb(0, 0, 0),
            });

            page.drawText(info.value || '', {
                x: 150,
                y: 620 - index * 15,
                ...styles.normal,
                color: rgb(0, 0, 0),
            });
        });

        // Fecha y Número de Factura
        page.drawText(`Fecha: ${fecha}`, {
            x: 400,
            y: 620,
            ...styles.normal
        });
        
        page.drawText(`No. Factura: ${numeroFactura}`, {
            x: 400,
            y: 600,
            ...styles.normal
        });

        // Tabla de Items
        let yPos = 520;
        
        // Encabezados de la tabla
        const headers = ["Descripción", "Cantidad", "Precio Unit.", "Total"];
        const colWidths = [250, 70, 100, 100];
        let xPos = 50;
        
        headers.forEach((header, index) => {
            page.drawText(header, {
                x: xPos,
                y: yPos,
                ...styles.heading
            });
            xPos += colWidths[index];
        });

        yPos -= 20;

        // Items
        items.forEach((item) => {
            xPos = 50;
            
            page.drawText(item.descripcion, {
                x: xPos,
                y: yPos,
                ...styles.normal
            });
            
            page.drawText(item.cantidad.toString(), {
                x: xPos + colWidths[0],
                y: yPos,
                ...styles.normal
            });
            
            page.drawText(item.precioUnitario.toLocaleString('es-CO'), {
                x: xPos + colWidths[0] + colWidths[1],
                y: yPos,
                ...styles.normal
            });
            
            page.drawText((item.cantidad * item.precioUnitario).toLocaleString('es-CO'), {
                x: xPos + colWidths[0] + colWidths[1] + colWidths[2],
                y: yPos,
                ...styles.normal
            });
            
            yPos -= 20;
        });

        // Totales
        yPos -= 20;
        const totalesY = yPos;
        
        page.drawText("Subtotal:", {
            x: 400,
            y: totalesY,
            ...styles.heading
        });
        
        page.drawText(total.toLocaleString('es-CO'), {
            x: 480,
            y: totalesY,
            ...styles.normal
        });

        page.drawText("IVA (19%):", {
            x: 400,
            y: totalesY - 20,
            ...styles.heading
        });
        
        page.drawText(impuestos.toLocaleString('es-CO'), {
            x: 480,
            y: totalesY - 20,
            ...styles.normal
        });

        page.drawText("Total:", {
            x: 400,
            y: totalesY - 40,
            ...styles.heading
        });
        
        page.drawText((parseFloat(total) + parseFloat(impuestos)).toLocaleString('es-CO'), {
            x: 480,
            y: totalesY - 40,
            ...styles.heading
        });

        // Retornar el buffer del PDF
        return await pdfDoc.save();

    } catch (error) {
        console.error('Error generando PDF:', error);
        throw error;
    }
}

module.exports = { generarPDF };