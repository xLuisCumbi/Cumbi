const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');
require('dotenv').config();
const emails = require('./emails');

/**
 * Envía un mensaje de correo electrónico
 * @param {*} toEmail Correo al que se envía el mensaje
 * @param {*} typeEmail Tipo de mensaje a enviar
 */
const sendEmail = (toEmail, typeEmail, options) => {
    sendEmailSES(toEmail, typeEmail, options);
};

const sendEmailSES = (toEmail, typeEmail, options) => {
    const sesv2Client = new SESv2Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.SES_ACCESS_KEY,
            secretAccessKey: process.env.SES_SECRET_KEY,
        },
    });

    // Convertir toEmail en un array si no lo es.
    const toEmailArray = Array.isArray(toEmail) ? toEmail : [toEmail];

    const bodyHtml = getBodyHTML(typeEmail, options);
    const subject = getSubject(typeEmail);
    const bcc = getBCC(typeEmail);

    const params = {
        FromEmailAddress: process.env.SES_EMAIL,
        Destination: {
            ToAddresses: toEmailArray,
            BccAddresses: bcc,
        },
        Content: {
            Simple: {
                Subject: {
                    Data: subject,
                },
                Body: {
                    Html: {
                        Data: bodyHtml,
                    },
                },
            },
        },
    };

    const command = new SendEmailCommand(params);

    sesv2Client.send(command)
        .then((data) => {
            console.log('Correo electrónico enviado:', data);
        })
        .catch((error) => {
            console.error('Error al enviar el correo electrónico:', error);
        });
};

const getSubject = (typeEmail) => {
    switch (typeEmail) {
        case TYPE_EMAIL.REGISTER:
            return 'Registro exitoso en Cumbi';
        case TYPE_EMAIL.INVOICE_CREATED:
            return 'Nueva Factura en Cumbi';
        case TYPE_EMAIL.INVOICE_PAID:
            return 'Factura pagada en Cumbi';
        case TYPE_EMAIL.VALIDATION:
            return 'Validación en Cumbi';
        case TYPE_EMAIL.KYC_STATUS_UPDATE:
            return 'Actualización del estado KYC'; // Nuevo caso añadido
        default:
            return 'Notificación de Cumbi'; // Un valor predeterminado para los casos no manejados
    }
};

const getBCC = (typeEmail) => {
    const bcc = ['digital@cumbi.co'];

    // if (typeEmail === TYPE_EMAIL.REGISTER) {
    //     const bccEmails = ['daniel@cumbi.co', 'luis@cumbi.co'];
    //     bcc.push(...bccEmails);
    // }

    return bcc;
};


const getBodyHTML = (typeEmail, options = {}) => {
    let bodyHtml = '';
    switch (typeEmail) {
        case TYPE_EMAIL.REGISTER:
            bodyHtml = emails.register();
            break;
        case TYPE_EMAIL.INVOICE_CREATED:
            bodyHtml = emails.invoiceCreated(options);
            break;
        case TYPE_EMAIL.INVOICE_PAID:
            bodyHtml = emails.invoicePaid(options);
            break;
        case TYPE_EMAIL.VALIDATION:
            bodyHtml = emails.validation();
            break;
        case TYPE_EMAIL.KYC_STATUS_UPDATE:
            bodyHtml = emails.kycStatusUpdate(options);
            break;
        default:
            bodyHtml = '';
    }
    return bodyHtml;
};

const sendKycStatusEmail = (userEmail, kycStatus) => {
    const options = { kycStatus }; // Opciones que se pasarán al template del email
    sendEmail(userEmail, TYPE_EMAIL.KYC_STATUS_UPDATE, options);
};


const TYPE_EMAIL = {
    REGISTER: 1,
    INVOICE_CREATED: 2,
    INVOICE_PAID: 3,
    VALIDATION: 4,
    KYC_STATUS_UPDATE: 5,
};

module.exports = {
    sendEmailSES,
    sendEmail,
    getSubject,
    getBCC,
    getBodyHTML,
    sendKycStatusEmail,
    TYPE_EMAIL,
};
