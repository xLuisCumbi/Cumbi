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

    // // Agregar direcciones de correo electrónico adicionales.
    // const additionalEmails = ['luis@cumbi.co', 'daniel@cumbi.co', 'digital@cumbi.co'];
    // toEmailArray = toEmailArray.concat(additionalEmails);

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
                    // Text: {
                    //     Data: 'Este es el contenido del correo electrónico.',
                    // },
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
    let subject = 'Correo de Cumbi';

    if (typeEmail === TYPE_EMAIL.REGISTER) {
        subject = 'Registro exitoso en Cumbi';
    } else if (typeEmail === TYPE_EMAIL.INVOICE_CREATED) {
        subject = 'Nueva Factura en Cumbi';
    } else if (typeEmail === TYPE_EMAIL.INVOICE_PAID) {
        subject = 'Factura pagada en Cumbi';
    } else if (typeEmail === TYPE_EMAIL.VALIDATION) {
        subject = 'Validación en Cumbi';
    }

    return subject;
};

const getBCC = (typeEmail) => {
    const bcc = ['digital@cumbi.co', 'daniel@cumbi.co', 'luis@cumbi.co'];

    // if (typeEmail === TYPE_EMAIL.REGISTER) {
    //     const bccEmails = ['daniel@cumbi.co', 'luis@cumbi.co'];
    //     bcc.push(...bccEmails);
    // }

    return bcc;
};

const getBodyHTML = (typeEmail, options = {}) => {
    let bodyHtml = '';

    if (typeEmail === TYPE_EMAIL.REGISTER) {
        bodyHtml = emails.register();
    } else if (typeEmail === TYPE_EMAIL.INVOICE_CREATED) {
        bodyHtml = emails.invoiceCreated(options);
    } else if (typeEmail === TYPE_EMAIL.INVOICE_PAID) {
        bodyHtml = emails.invoicePaid(options);
    } else if (typeEmail === TYPE_EMAIL.VALIDATION) {
        bodyHtml = emails.validation();
    }
    return bodyHtml;
};

const TYPE_EMAIL = {
    REGISTER: 1,
    INVOICE_CREATED: 2,
    INVOICE_PAID: 3,
    VALIDATION: 4,
    KYC_STATUS: 5,
};

module.exports = {
    sendEmailSES,
    sendEmail,
    getSubject,
    getBCC,
    getBodyHTML,
    TYPE_EMAIL,
};
