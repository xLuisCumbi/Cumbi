const DepositModel = require("../models/Deposit");
const { validateField, signToken } = require("../utils");
const getAddressBalance = require('./Balance');
const consolidateAddressBalance = require('./Consolidation')
const getDepositAddress = require('./Address');
const moment = require('moment');
const Sequelize = require('sequelize');

// DepositModel.sync({ alter: true });

const create = ({ amount, deposit_id, network, coin }) => {
    return new Promise(async (resolve, reject) => {
        validateField(reject, { amount, deposit_id, network, coin });

        const d = await checkDepositExist(deposit_id);
        if (d) {
            const balance = await getAddressBalance(d.address, d.privateKey, d.network, d.coin);
            const depositObj = {
                address: d.address,
                amount_usd: d.amount_usd,
                amount: d.amount,
                coin: d.coin,
                network: d.network,
                balance,
                deposit_id,
                coin_price: d.coin_price,
                status: d.status
            };
            resolve({ status: "success", depositObj });
        } else {
            getDepositAddress(network, coin).then(
                async ({ address, addressIndex, privateKey }) => {

                    privateKey = signToken({ privateKey }, process.env.PRIVATEKEY_JWT_SECRET, '100y');
                    const coinPriceDouble = await getAmountCrypto();
                    const coin_price = Number(coinPriceDouble).toFixed(2);
                    const amount_crypto = Number((amount / coin_price).toFixed(6));

                    const depositObj = {
                        address,
                        coin_price,
                        deposit_id,
                        privateKey,
                        balance: 0,
                        amount_usd: amount,
                        status: "pending",
                        amount: amount_crypto,
                        address_index: addressIndex,
                        coin: coin.toUpperCase(),
                        network: network.toUpperCase(),
                    };

                    const save = await saveDepositObj(depositObj);

                    if (save) {
                        delete depositObj["address_index"];
                        delete depositObj["privateKey"];
                        resolve({ status: "success", depositObj });
                    } else {
                        reject({
                            status: "failed",
                            message: "Server Error: could not fetch deposit address",
                            statusCode: 504,
                        });
                    }
                },
                (err) => {
                    reject({
                        status: "failed",
                        message: "Server Error: could not fetch deposit address",
                        statusCode: 504,
                    });
                }
            );
        }
    });
};

const checkDepositExist = (deposit_id) => {
    return new Promise(async (resolve, reject) => {
        DepositModel.findOne({ where: { deposit_id }, raw: true }).then(
            async (query) => {
                if (query) {
                    resolve(query);
                } else {
                    resolve(undefined);
                }
            },
            (err) => {
                resolve(undefined);
            }
        );
    });
};


const getAmountCrypto = () => {
    return new Promise((resolve, reject) => {
        resolve(1);
    });
};

const status = ({ deposit_id }) => {
    return new Promise((resolve) => {
        DepositModel.findOne({ where: { deposit_id }, raw: true }).then(
            async (query) => {
                if (query) {

                    let balance = await getAddressBalance(query.address, query.privateKey, query.network, query.coin);
                    balance = !balance ? 0 : balance;

                    let status = query.status;
                    if (balance >= query.amount) {
                        status = "success";
                        await DepositModel.update(
                            { status: "success" },
                            { where: { deposit_id } }
                        );
                    }

                    resolve({
                        status: "success",
                        depositObj: {
                            status,
                            amount_paid: balance,
                            amount_to_pay: query.amount,
                            deposit_id,
                            address: query.address,
                        },
                    });
                } else {
                    resolve({
                        status: "failed",
                        message: "Could not find deposit",
                    });
                }
            },
            (err) => {
                resolve({
                    status: "failed",
                    message: "Server Error: kindly try again later",
                });
            }
        );
    });
};

const saveDepositObj = (depositObj) => {
    return new Promise((resolve, reject) => {
        DepositModel.create({ ...depositObj }, { raw: true }).then(
            (query) => {
                query ? resolve(true) : resolve(false);
            },
            (error) => {
                console.log(error);
                resolve(false);
            }
        );
    });
};

const fetchPendingDeposits = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const expiryTime = moment().subtract(24, "hours").toDate();
            const pendingDeposits = await DepositModel.findAll({
                where: {
                    status: "pending",
                    createdAt: { [Sequelize.Op.gte]: expiryTime },
                },
                raw: true,
            });
            resolve(pendingDeposits);
        } catch (error) {

            resolve([]);
            console.log(error);

        }
    });
};

const expireTimedOutDeposits = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const expiryTime = moment().subtract(24, "hours").toDate();
            await DepositModel.update(
                { status: "expired" },
                {
                    where: {
                        createdAt: { [Sequelize.Op.lt]: expiryTime },
                    },
                }
            );

            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

const checkPendingDeposits = async () => {

    try {
    
        const pendingDeposits = await fetchPendingDeposits();

        pendingDeposits.map(async (deposit) => {
            const address = deposit.address;
            const id = deposit.id;
            const network = deposit.network;
            const coin = deposit.coin;
            const privateKey = deposit.privateKey;
            let balance = await getAddressBalance(address, privateKey, network, coin);
            balance = !balance ? 0 : balance;
            let status = "pending";

            if(balance >= deposit.amount){
               
                status =  "success";
               
                await consolidateAddressBalance(address, balance, privateKey, network, coin);

            }
           // updateDepositObj({ id, address, status, balance });
        });

        expireTimedOutDeposits();

    } catch (error) {

        console.error(error);
        return;
    }

};

const updateDepositObj = (depositObj) => {

    return new Promise(async (resolve) => {

        try {

            const { id, status, balance } = depositObj;
            const query = await DepositModel.update(
                { status, balance },
                { where: { id } }
            );

            resolve(query);

        } catch (error) {

            console.log(error);

        }

    });
};

module.exports = {
    create,
    status,
    checkPendingDeposits,
    getDepositAddress
};
