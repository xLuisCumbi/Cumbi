
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const sendErrorMsg = (res, err) => {

    let message = 'Server Error Kinldy Try Again Later';
    message = err.message ? err.message : message;

    let statusCode = 504;
    statusCode = err.statusCode ? err.statusCode : 504;

    let status = "failed";
    status = err.status ? err.status : status;
    
    res.status(statusCode).json({ status, message});

}

const genHash = (str) => {
    return new Promise(async (resolve, reject) => {
        try {
            const saltRounds = parseInt(process.env.LOGIN_SECRET);
            bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                    reject({ status: 'failed', statusCode: 500, message: err.message });
                }
                bcrypt.hash(String(str), salt, function (err, hash) {
                    if (err) {
                        reject({ status: 'failed', statusCode: 500, message: err.message });
                    }
                    resolve(hash);
                });
            });
        } catch (error) {
            reject({ status: 'failed', statusCode: 500, message: error.message });
        }

    })
}

const bcryptCompare = (str1, str2)=>{
    return bcrypt.compareSync(str1, str2);
}

const validateField = (reject, field) => { 

    let fieldValidated = true;
    for (let i in field) {

        if (!field[i] || field[i] == "") {
            fieldValidated = false
        }

    }

    if (!fieldValidated) {

        reject({status: "failed", statusCode: 400, message: "BAD REQUEST : INCOMPLETE PAYLOAD"});

    }

    return fieldValidated;
         
}

const signToken = (tokenData, secret, lifetime) => {
    const token = jwt.sign({ ...tokenData },  secret, {
        expiresIn: lifetime,
    });

    return token;
};

const verifyToken = (token, secret) => {

    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, async function(err, tokenData){

            if(err){
                reject({ status: failed, statusCode: 504});
            }

            resolve(tokenData);
        });
    })
   
}

module.exports = {
    sendErrorMsg,
    validateField,
    signToken,
    verifyToken,
    genHash,
    bcryptCompare
}
