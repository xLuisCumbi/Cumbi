const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ethers = require("ethers");
// const AWS = require('aws-sdk');
// import { S3Client } from "@aws-sdk/client-s3"
// const { S3Client } = require("@aws-sdk/client-s3");
// const { Upload } = require('@aws-sdk/lib-storage');
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

const uploadToS3 = (file) => {
    // Configura AWS SDK con tus credenciales y región
    // AWS.config.update({
    //     accessKeyId: 'AKIAS3YIGB2GOB76O5YQ',
    //     secretAccessKey: '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',
    //     region: 'us-east-1', // Cambia la región según tus necesidades
    // });

    // const client = new S3Client({
    //     credentials: {
    //         accessKeyId: 'AKIAS3YIGB2GOB76O5YQ',
    //         secretAccessKey: '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',
    //     },
    //     region: 'us-east-1',
    // });

    // const fileStream = fs.createReadStream(file);

    // const filePath = 'ruta/al/archivo.pdf'; // Ruta local al archivo que deseas subir
    // const fileName = 'nombre-del-archivo.pdf'; // Nombre que tendrá el archivo en S3
    // const bucketName = 'documents-cumbi'; // Nombre del bucket en S3


    // const uploadParams = {
    //     Bucket: bucketName,
    //     Key: fileName,
    //     Body: fileStream,
    // };

    // const upload = new Upload({
    //     client: client,
    //     params: uploadParams,
    // });

    // upload.done().then((res, error) => {
    //     console.log(res);
    // });

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
    uploadToS3
};
