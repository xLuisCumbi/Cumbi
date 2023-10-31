const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ethers = require("ethers");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require('@aws-sdk/lib-storage');
const { SESv2Client, SendEmailCommand, SESv2 } = require('@aws-sdk/client-sesv2');
const nodemailer = require('nodemailer');
const fs = require('fs');
require("dotenv").config();
const emails = require('./emails')

const sendErrorMsg = (res, err) => {
    console.log('err', err);
    console.log('Error Stack Trace:', err.stack);

    let message = "Server Error Kindly Try Again Later";
    message = err.message ? err.message : message;

    let statusCode = 504;
    statusCode = err.statusCode ? err.statusCode : 504;

    let status = "failed";
    status = err.status ? err.status : status;

    res.status(statusCode).json({ status, message });
};

const checkSupportedAddress = (network, coin) => {
    network = network.toUpperCase();
    coin = coin.toUpperCase();

    if (network === "ETHEREUM") {
        if (coin === "USDT") {
            return { status: true };
        } else if (coin === "USDC") {
            return { status: true };
        } else return { status: false, message: "Unsupported crypto coin" };
    } else if (network === "TRON") {
        if (coin === "USDT") {
            return { status: true };
        } else if (coin === "USDC") {
            return { status: true };
        } else return { status: false, message: "Unsupported crypto coin" };
    } else return { status: false, message: "Unsupported crypto network" };
};

const genHash = (str) => {
    return new Promise(async (resolve, reject) => {
        try {
            const saltRounds = parseInt(process.env.SALT_ROUNDS);
            bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                    reject({ status: "failed", statusCode: 500, message: err.message });
                }
                bcrypt.hash(String(str), salt, function (err, hash) {
                    if (err) {
                        reject({ status: "failed", statusCode: 500, message: err.message });
                    }
                    resolve(hash);
                });
            });
        } catch (error) {
            reject({ status: "failed", statusCode: 500, message: error.message });
        }
    });
};

const bcryptCompare = (str1, str2) => {
    return bcrypt.compareSync(str1, str2);
};

const validateField = (reject, field) => {
    let fieldValidated = true;
    for (let i in field) {
        if (!field[i] || field[i] == "") {
            fieldValidated = false;
        }
    }

    if (!fieldValidated) {
        reject({
            status: "failed",
            statusCode: 400,
            message: "BAD REQUEST : INCOMPLETE PAYLOAD",
        });
    }

    return fieldValidated;
};

const signToken = (tokenData, secret, lifetime) => {
    const token = jwt.sign({ ...tokenData }, secret, {
        expiresIn: lifetime,
    });

    return token;
};

const verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, async function (err, tokenData) {
            if (err) {
                console.log(err);
                reject({ status: "failed", statusCode: 504 });
            }

            resolve(tokenData);
        });
    });
};

const getProvider = (network) => {
    const APP_MODE = process.env.APP_MODE || "TESTNET";

    if (APP_MODE === "TESTNET") {
        if (network == "ethereum") {
            return new ethers.InfuraProvider(
                "goerli",
                "f134b5932f8f4a0d86f99600140f5c42"
            );
        } else if (network == "tron") {
            return "https://api.shasta.trongrid.io";
        } else {
            return undefined;
        }
    } else {
        if (network == "ethereum") {
            return new ethers.getDefaultProvider();
        } else if (network == "tron") {
            return "https://api.trongrid.io";
        } else {
            return undefined;
        }
    }
};

// TODO Obtener el valor desde una API y guardarla en la BD
const getTRM = () => {
    return 3955.23
};

const timestamp2date = (timestamp) => {
    if (!timestamp)
        return
    timestamp = parseInt(timestamp, 10);
    const fecha = new Date(timestamp * 1000);

    // Obtiene los componentes de fecha (día, mes, año, hora, minutos, segundos)
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses se indexan desde 0
    const anno = fecha.getFullYear();
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();

    // Formatea la fecha en un formato legible por humanos
    const fechaLegible = `${anno}/${mes}/${dia} ${hora}:${minutos}:${segundos}`;
    return fechaLegible;
}

const uploadToS3 = async (file) => {
    const client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    const fileStream = file.path ? fs.createReadStream(file.path) : file.buffer;
    const fileName = generateS3FileName(file.originalname); // Llama a la función para generar el nombre

    const bucketName = process.env.AWS_BUCKET;

    const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileStream,
    };

    const upload = new Upload({
        client: client,
        params: uploadParams,
    });

    try {
        const result = await upload.done();
        return result;
    } catch (error) {
        console.log(error);
        throw error; // Lanza el error para que pueda ser capturado en la función signUp
    }
};

// Función para generar el nombre del archivo en S3
const generateS3FileName = (originalFileName) => {
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    // Reemplaza espacios por guiones bajos y agrega el ID de usuario
    const sanitizedFileName = originalFileName.replace(/ /g, '_');
    return `${uniqueFileName}_${sanitizedFileName}`;
};


/**
 * Envía un mensaje de correo electrónico
 * @param {*} toEmail Correo al que se envía el mensaje
 * @param {*} typeEmail Tipo de mensaje a enviar
 */
const sendEmail = (toEmail, typeEmail, options) => {
    sendEmailSMTP(toEmail, typeEmail, options)
}

const sendEmailSES = () => {
    const sesv2Client = new SESv2Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.SES_SMTP_USERNAME,
            secretAccessKey: process.env.SES_SMTP_PASSWORD
        }
    });

    const params = {
        FromEmailAddress: process.env.SES_EMAIL,
        Destination: {
            ToAddresses: ['anfehernandez94@gmail.com', 'info@secuenciauno.co'],
            BccAddresses: ['secuenciaunop@gmail.com']
        },
        Content: {
            Simple: {
                Subject: {
                    Data: 'Asunto del correo electrónico',
                },
                Body: {
                    Html: {
                        Data: emails.register(),
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
}

/**
 * Envía un mensaje de correo electrónico a través de SMTP
 * @param {*} toEmail Correo al que se envía el mensaje
 * @param {*} typeEmail Tipo de mensaje a enviar
 */
const sendEmailSMTP = (toEmail, typeEmail, options) => {
    // Configura el transporte con los datos del servidor SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // Reemplaza con la dirección del servidor SMTP
        port: process.env.SMTP_PORT, // Reemplaza con el puerto del servidor SMTP (el valor puede variar según el servidor)
        secure: true, // En caso de que utilices una conexión segura (TLS/SSL)
        auth: {
            user: process.env.SMTP_USERNAME,     // Reemplaza con tu dirección de correo electrónico
            pass: process.env.SMTP_PASSWORD,     // Reemplaza con tu contraseña de correo electrónico o contraseña de aplicación
        },
    });

    const subject = getSubject(typeEmail)
    const bcc = getBCC(typeEmail)
    const bodyHtml = getBodyHTML(typeEmail, options)
    const bodyText = "El mensaje no se visualiza correctamente."

    // Define el contenido del correo y otras opciones
    const mailOptions = {
        from: process.env.SES_EMAIL,   // Dirección de correo electrónico del remitente
        to: [toEmail],  // Dirección de correo electrónico del destinatario principal
        bcc: bcc,  // Direcciones de correo electrónico con copia oculta (BCC)
        subject: subject,
        text: bodyText,
        html: bodyHtml, // Contenido del correo en formato HTML
    };

    // Envía el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo electrónico:', error);
        } else {
            console.log('Correo electrónico enviado:', info.response);
        }
    });
}

const getSubject = (typeEmail) => {
    let subject = "Correo de Cumbi"

    if (typeEmail === TYPE_EMAIL.REGISTER) {
        subject = "Registro exitoso en Cumbi"
    } else if (typeEmail === TYPE_EMAIL.INVOICE_CREATED) {
        subject = "Nueva Factura en Cumbi"
    } else if (typeEmail === TYPE_EMAIL.INVOICE_PAID) {
        subject = "Factura pagada en Cumbi"
    } else if (typeEmail === TYPE_EMAIL.VALIDATION) {
        subject = "Validación en Cumbi"
    }

    return subject
}

const getBCC = (typeEmail) => {
    let bcc = ['secuenciaunop@gmail.com', 'digital@cumbi.co']

    if (typeEmail === TYPE_EMAIL.REGISTER) {
        const bccEmails = ['daniel@cumbi.co', 'luis@cumbi.co'];
        bcc.push(...bccEmails);
    }

    return bcc
}

const getBodyHTML = (typeEmail, options = {}) => {
    let bodyHtml = ""

    if (typeEmail === TYPE_EMAIL.REGISTER) {
        bodyHtml = emails.register()
    } else if (typeEmail === TYPE_EMAIL.INVOICE_CREATED) {
        bodyHtml = emails.invoiceCreated(options)
    } else if (typeEmail === TYPE_EMAIL.INVOICE_PAID) {
        bodyHtml = emails.invoicePaid(options)
    } else if (typeEmail === TYPE_EMAIL.VALIDATION) {
        bodyHtml = emails.validation()
    }
    return bodyHtml
}


const TYPE_EMAIL = {
    REGISTER: 1,
    INVOICE_CREATED: 2,
    INVOICE_PAID: 3,
    VALIDATION: 4,
}


module.exports = {
    sendErrorMsg,
    validateField,
    signToken,
    verifyToken,
    genHash,
    bcryptCompare,
    getProvider,
    checkSupportedAddress,
    getTRM,
    timestamp2date,
    uploadToS3,
    sendEmail,
    TYPE_EMAIL
};
