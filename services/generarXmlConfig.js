const xml2js = require('xml2js');

async function generarXMLUBL(req) {
    try {
        const { 
            numeroFactura, 
            fecha, 
            cliente, 
            items, 
            total, 
            impuestos 
        } = req.body;

        const builder = new xml2js.Builder({
            rootName: 'Invoice',
            headless: true,
            renderOpts: { pretty: true, indent: ' ', newline: '\n' }
        });

        const xmlData = {
            $: {
                xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
                'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
                'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
            },
            'cbc:UBLVersionID': '2.1',
            'cbc:CustomizationID': '01',
            'cbc:ID': numeroFactura,
            'cbc:IssueDate': fecha,
            'cbc:InvoiceTypeCode': '01',
            'cbc:DocumentCurrencyCode': 'COP',
            'cac:AccountingSupplierParty': {
                'cac:Party': {
                    'cac:PartyName': {
                        'cbc:Name': 'TU EMPRESA S.A.'
                    },
                    'cac:PartyTaxScheme': {
                        'cbc:CompanyID': '900.XXX.XXX-X',
                        'cbc:TaxLevelCode': '01'
                    },
                    'cac:PartyLegalEntity': {
                        'cbc:RegistrationName': 'TU EMPRESA S.A.',
                        'cbc:CompanyID': '900.XXX.XXX-X'
                    }
                }
            },
            'cac:AccountingCustomerParty': {
                'cac:Party': {
                    'cac:PartyName': {
                        'cbc:Name': cliente.nombre
                    },
                    'cac:PartyTaxScheme': {
                        'cbc:CompanyID': cliente.documento,
                        'cbc:TaxLevelCode': '01'
                    }
                }
            },
            'cac:InvoiceLine': items.map((item, index) => ({
                'cbc:ID': index + 1,
                'cbc:InvoicedQuantity': item.cantidad,
                'cbc:LineExtensionAmount': {
                    _: item.precio,
                    $: { currencyID: 'COP' }
                },
                'cac:Item': {
                    'cbc:Description': item.descripcion
                },
                'cac:Price': {
                    'cbc:PriceAmount': {
                        _: item.precioUnitario,
                        $: { currencyID: 'COP' }
                    }
                }
            })),
            'cac:TaxTotal': {
                'cbc:TaxAmount': {
                    _: impuestos,
                    $: { currencyID: 'COP' }
                }
            },
            'cac:LegalMonetaryTotal': {
                'cbc:LineExtensionAmount': {
                    _: total,
                    $: { currencyID: 'COP' }
                },
                'cbc:TaxInclusiveAmount': {
                    _: (parseFloat(total) + parseFloat(impuestos)).toFixed(2),
                    $: { currencyID: 'COP' }
                },
                'cbc:PayableAmount': {
                    _: (parseFloat(total) + parseFloat(impuestos)).toFixed(2),
                    $: { currencyID: 'COP' }
                }
            }
        };

        return builder.buildObject(xmlData);
    } catch (error) {
        console.error('Error generando XML:', error);
        throw error;
    }
}

// Exportar usando CommonJS
module.exports = {
    generarXMLUBL
};