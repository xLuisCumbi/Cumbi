
const DepositModel = require("../models/Deposit");
const AdminModel = require("../models/Admin");
const { signToken, bcryptCompare, verifyToken, genHash } = require("../utils");
const { create } = require("./Deposit");
const ApiTokenModel = require("../models/ApiToken");

// AdminModel.sync({ alter: true});

// ApiTokenModel.sync({ alter: true});

const validateToken = (token) => {
    return new Promise(async resolve => {
        try {

            const adminObj = await verifyToken(token, process.env.JWT_SECRET);
            const admin_id = adminObj.admin_id;
            const query = await AdminModel.findOne({ where: { admin_id, token } }).catch();
            if (query) {

                resolve({ "status": "success", admin_id });

            } else {
                resolve({ "status": "auth_failed", "message": "invalid token" });
            }

        } catch (e) {

            resolve({ "status": "auth_failed", "message": "invalid token" });

        }
    })
}

const login = ({ email, password }) => {

    return new Promise(async resolve => {
        try {

            const query = await AdminModel.findOne({ where: { email } });

            if (query) {

                const checkPassword = bcryptCompare(password, query.password);

                if (checkPassword) {

                    const admin_id = query.admin_id;
                    const token = signToken({ admin_id, type: 'admin_token' }, process.env.JWT_SECRET, '5d');
                    await AdminModel.update({ token }, { where: { admin_id } });
                    resolve({ "status": "success", user: { authToken: token, email, username: query.username } });

                } else {

                    resolve({ "status": "auth_failed", "message": "Incorrect username or password" });
                }

            } else {
                resolve({ "status": "auth_failed", "message": "Incorrect username or password" });
            }
            
        } catch (e) {
     
            resolve({ "status": "auth_failed", "message": "server error" });
        }
    })
}


const fetchDeposits = ({ token }) => {
    return new Promise(async (resolve) => {
        try {
            const verify = await validateToken(token);
            if (verify.status == 'success') {
                const deposits = await DepositModel.findAll({ raw: true, limit: 250, attributes: { exclude: ['privateKey', 'address_index'] } });
                resolve({ status: "success", deposits });
            } else resolve(verify);
        } catch (error) {
            resolve({ status: "failed", message: "server error: kindly try again" });
        }
    });
}

const createToken = ({ token, token_name }) => {

    return new Promise(async (resolve) => {
        try {

            const verify = await validateToken(token);

            if (verify.status == 'success') {

                const token = signToken({type: 'api_token', token_name}, process.env.API_JWT_SECRET, '100y');
                const createdAt = new Date();

                const createToken = await ApiTokenModel.create({ token_name, token, createdAt },{ raw: true, limit: 200 });

                if(createToken){

                    resolve({ status: "success" });

                }else{
                    resolve({ status: "failed", message: "Error Creating Token" });
                }

            } else {
                resolve(verify);
            }
        } catch (error) {

            resolve({ status: "failed", message: "server error: kindly try again" });
        }
    });
}

const fetchTokens = ({ token }) => {

    return new Promise(async (resolve) => {
        try {
            const verify = await validateToken(token);

            if (verify.status == 'success') {

                const tokens = await ApiTokenModel.findAll({ raw: true, limit: 200 });
                resolve({ status: "success", tokens });

            } else {

                resolve(verify);
            }
        } catch (error) {
          
            resolve({ status: "failed", message: "server error: kindly try again" });
        }
    });
}

const deleteToken = ({token,  token_id }) => {

    return new Promise(async (resolve) => {
        try {
            const verify = await validateToken(token);

            if (verify.status == 'success') {
                    
                await ApiTokenModel.destroy({where: {id: token_id}});
                resolve({ status: "success" });

            } else {

                resolve(verify);
            }
        } catch (error) {
  
            resolve({ status: "failed", message: "server error: kindly try again" });
        }
    });
}


const update = ({ passphrase, email, username, password, token }) => {
    return new Promise(async (resolve) => {
        try {

            const verify = await validateToken(token);

            if (verify.status == 'success') {

                adminObj = {};
                if (passphrase) adminObj.passphrase = signToken({ mnemonic: passphrase, type: 'mnemonic-token' }, process.env.MNEMONIC_JWT_SECRET, '100y');
                if (password) adminObj.password = await genHash(password);
                if (email) adminObj.email = email;
                if (username) adminObj.username = username;
                adminObj.updatedAt = new Date();
                await AdminModel.update(adminObj, { where: { admin_id: verify.admin_id } });
                resolve({ status: "success" });

            } else resolve(verify);

        } catch (error) {

            console.log(error);
            resolve({ status: "failed", message: "server error: kindly try again" });
        }
    });
}

const createInvoice = ({ title, description, amount, network, coin, token }) => {

    return new Promise(async (resolve, reject) => {

        try {

            const verify = await validateToken(token);

            if (verify.status == 'success') {

                const deposit_id = Date.now();
                const respoonse = await create({ amount, deposit_id, network, coin, type: 'invoice', description, title });
                const invoice_url = process.env.appUrl + '/invoice/' + deposit_id;
                const invoiceObj = { status: 'success', invoiceObj: { ...respoonse.depositObj, invoice_url } };
                resolve(invoiceObj);

            } else {
                resolve(verify);
            }

        } catch (error) {

            reject({ message: 'error creating invoice' });

        }


    });

}


const adminStats = ({ token }) => {

    return new Promise(async (resolve) => {

        try {

            const verify = await validateToken(token);

            if (verify.status == 'success') {

                const query = await AdminModel.findOne({ where: { admin_id: verify.admin_id } });
                const s = JSON.parse(query.stats);
                const updated = query.last_stats_update;
                const stats = {

                    eth_balance: {
                        value: s.eth_balance.value,
                        updated
                    },

                    trx_balance: {
                        value: s.trx_balance.value,
                        updated
                    },

                    eth_usdt_balance: {
                        value: s.eth_usdt_balance.value,
                        updated
                    },

                    trx_usdt_balance: {
                        value: s.trx_usdt_balance.value,
                        updated
                    },

                    eth_usdc_balance: {
                        value: s.eth_usdc_balance.value,
                        updated
                    },

                    trx_usdc_balance: {
                        value: s.trx_usdc_balance.value,
                        updated
                    },

                    successful_deposits: {
                        value: s.successful_deposits.value,
                        updated,
                    },

                    total_paid: {
                        value: s.total_paid.value,
                        updated
                    }
                }

                resolve({ status: "success", stats });

            } else {

                resolve(verify);

            }

        } catch (error) {

            resolve({ status: "failed", message: "server error: kindly try again" });

        }
    });
}



module.exports = {

    fetchDeposits,
    login,
    validateToken,
    update,
    adminStats,
    createInvoice,
    createToken,
    fetchTokens,
    deleteToken
}
