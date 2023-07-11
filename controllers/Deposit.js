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
            const depositObj = {
                address: d.address,
                coin_price: d.coin_price,
                deposit_id: d.deposit_id,
                balance: d.balance,
                amount_usd: d.amount_usd,
                status: d.status,
                amount: d.amount,
                coin: coin.toUpperCase(),
                network: network.toUpperCase(),
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
            async (d) => {
                if (d) {
                    
                    resolve({
                        status: "success",
                        depositObj: {
                            address: d.address,
                            coin_price: d.coin_price,
                            deposit_id: d.deposit_id,
                            balance: d.balance,
                            amount_usd: d.amount_usd,
                            status: d.status,
                            amount: d.amount,
                            coin: coin.toUpperCase(),
                            network: network.toUpperCase(),
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

        if(pendingDeposits.length == 0) {
            console.log('no pendingDeposits detected');
            return;
        }

        pendingDeposits.map(async (deposit) => {
            const address = deposit.address;
            const id = deposit.id;
            const network = deposit.network;
            const coin = deposit.coin;
            const privateKey = deposit.privateKey;
            let balance = await getAddressBalance(address, privateKey, network, coin);
            balance = !balance ? 0 : balance;
            let status = "pending";
            consolidation_status = 'unconsolidated';

            if(balance >= deposit.amount){
               
                status =  "success";
                console.log('successful deposit detected');
                consolidation_status = await consolidateAddressBalance(address, balance, privateKey, network, coin);

            }
            updateDepositObj({ id, address, status, balance, consolidation_status });
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

            const query = await DepositModel.update({ ...depositObj },
                { where: { id: depositObj.id } }
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
