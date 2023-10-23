const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ethers = require("ethers");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
require("dotenv").config();

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
    console.log('file', file);
    const client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    console.log('file', file.path);

    const fileStream = fs.createReadStream(file.path); // Utiliza file.path para obtener la ruta al archivo
    const fileName = generateS3FileName(file.name); // Llama a la función para generar el nombre

    console.log('fileName', fileName);

    const bucketName = 'documents-cumbi';

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
        console.log(result);
    } catch (error) {
        console.log(error);
    }
};

// Función para generar el nombre del archivo en S3
const generateS3FileName = (originalFileName) => {
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    // Reemplaza espacios por guiones bajos y agrega el ID de usuario
    const sanitizedFileName = originalFileName.replace(/ /g, '_');
    return `${uniqueFileName}_${sanitizedFileName}`;
};

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
    uploadToS3
};
