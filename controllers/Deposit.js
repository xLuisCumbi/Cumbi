/**
 * @file This file is a module that exports several functions for handling deposits.
 * It includes functions for creating deposits, checking deposit status, and updating deposits.
 */
const DepositModel = require("../models/Deposit");
const { validateField, signToken } = require("../utils");
const { getAddressBalance } = require("./Balance");
const consolidateAddressBalance = require("./Consolidation");
const getDepositAddress = require("./Address");
const moment = require("moment");
const Sequelize = require("sequelize");

// DepositModel.sync({ alter: true });

/**
 * Creates a new deposit.
 * The deposit is saved to the database.
 * If the deposit is successfully created, the status is set to 'success'.
 * If the deposit fails to be created, the status is set to 'failed'.
 * @param {Object} params - The parameters for the deposit.
 * @param {number} params.amount - The amount of the deposit.
 * @param {string} params.deposit_id - The ID of the deposit.
 * @param {string} params.network - The network for the deposit.
 * @param {string} params.coin - The coin for the deposit.
 * @param {string} params.type - The type of the deposit.
 * @param {string} params.description - The description of the deposit.
 * @param {string} params.title - The title of the deposit.
 * @param {string} params.wp_order_received_url - The URL for the order received page of the deposit.
 * @return {Promise<Object>} - The creation result.
 */
const create = ({
    amount,
    deposit_id,
    network,
    coin,
    type,
    description,
    title,
    wp_order_received_url,
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (type == "wp-payment") {
                const validate = validateField(reject, {
                    amount,
                    deposit_id,
                    wp_order_received_url,
                });
                if (!validate) return;
            } else {
                const validate = validateField(reject, {
                    amount,
                    deposit_id,
                    network,
                    coin,
                });
                if (!validate) return;
            }

            const d = await checkDepositExist(deposit_id);

            if (d) {
                reject({ status: "failed", message: "Duplicate deposit id" });
            } else if (type === "wp-payment") {
                const depositObj = {
                    coin_price: 1,
                    deposit_id,
                    balance: 0,
                    amount_usd: amount,
                    status: "inactive",
                    type: "deposit",
                    amount,
                    wp_order_received_url,
                };

                const save = await saveDepositObj(depositObj);

                if (save) {
                    delete depositObj["address_index"];
                    delete depositObj["privateKey"];
                    resolve({ status: "success", depositObj });
                } else {
                    console.log('error in Deposit.js');
                    reject({
                        status: "failed",
                        message: "Server Error: could not fetch deposit address",
                        statusCode: 504,
                    });
                }
            } else {
                getDepositAddress(network, coin).then(
                    async ({ address, addressIndex, privateKey }) => {
                        privateKey = signToken(
                            { privateKey },
                            process.env.PRIVATEKEY_JWT_SECRET,
                            "100y"
                        );
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
                            type: type ? type : "deposit",
                            description: description ? description : "",
                            title: title ? title : "",
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
                            console.log('error in: getDepositAddress', );
                            reject({
                                status: "failed",
                                message: "Server Error: could not fetch deposit address",
                                statusCode: 504,
                            });
                        }
                    },
                    (err) => {
                        reject({
                            status: err.status,
                            message: err.message,
                            statusCode: err.statusCode,
                        });
                    }
                );
            }
        } catch (error) {
            reject({ status: "failed", message: "Server Error" });
        }
    });
};

/**
 * @function checkDepositExist
 * @description Checks if a deposit with the given ID exists in the database
 * @param {string} deposit_id - The ID of the deposit to check
 * @returns {Promise<Object>} - The deposit object if found, undefined otherwise
 */
const checkDepositExist = (deposit_id) => {
    return new Promise(async (resolve, reject) => {
        // Change the Sequelize findOne to Mongoose findOne
        DepositModel.findOne({ deposit_id }).then(
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

/**
 * @function getAmountCrypto
 * @description Gets the amount of crypto. This function seems to be a placeholder as it currently returns 1.
 * @returns {Promise<number>} - A promise that resolves to the amount of crypto
 */
const getAmountCrypto = () => {
    return new Promise((resolve, reject) => {
        resolve(1);
    });
};

/**
 * @function setNetwork
 * @description Updates the network, coin, address, address index, and private key for a deposit with the given ID.
 * @param {Object} params - The parameters for the network update.
 * @param {string} params.deposit_id - The ID of the deposit to update.
 * @param {string} params.network - The network to set.
 * @param {string} params.coin - The coin to set.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status of the operation.
 */
const setNetwork = ({ deposit_id, network, coin }) => {
    return new Promise((resolve, reject) => {
        getDepositAddress(network, coin).then(
            async ({ address, addressIndex, privateKey }) => {
                await DepositModel.updateOne(
                    { deposit_id, status: "inactive" },
                    {
                        address,
                        address_index: addressIndex,
                        privateKey,
                        network,
                        coin,
                        status: "pending",
                    }
                );
                resolve({ status: "success" });
            },
            (err) => {
                reject({ status: "failed", message: "Server Error" });
            }
        );
    });
};

/**
 * Checks the status of a deposit.
 * If the deposit exists, the status of the deposit is returned.
 * If the deposit does not exist, the status is set to 'failed'.
 * @param {Object} params - The parameters for the deposit.
 * @param {string} params.deposit_id - The ID of the deposit.
 * @return {Promise<Object>} - The status result.
 */
const status = ({ deposit_id }) => {
    return new Promise((resolve) => {
        DepositModel.findOne({ deposit_id })
            .then(d => {
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
                            description: d.description,
                            title: d.title,
                            type: d.type,
                            coin_price: 1,
                            createdAt: d.createdAt,
                            wp_order_received_url: d.wp_order_received_url,
                            coin: d.coin == null ? d.coin : d.coin.toUpperCase(),
                            network: d.network == null ? d.network : d.network.toUpperCase(),
                        },
                    });
                } else {
                    resolve({
                        status: "failed",
                        message: "Could not find deposit",
                    });
                }
            })
            .catch(err => {
                console.log('error:', err.stack);
                resolve({
                    status: "failed",
                    message: "Server Error: kindly try again later",
                });
            });
    });
};

/**
 * @function saveDepositObj
 * @description Saves a deposit object to the database
 * @param {Object} depositObj - The deposit object to save
 * @returns {Promise<boolean>} - A promise that resolves to true if the save was successful, false otherwise
 */
const saveDepositObj = (depositObj) => {
    return new Promise((resolve, reject) => {
        // Change the Sequelize create to Mongoose create
        DepositModel.create(depositObj).then(
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

/**
 * @function fetchPendingDeposits
 * @description Fetches pending deposits that were created in the last 24 hours
 * @returns {Promise<Array>} - A promise that resolves to an array of pending deposits
 */
const fetchPendingDeposits = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const expiryTime = moment().subtract(24, "hours").toDate();
            let pendingDeposits = await DepositModel.find({
                status: "pending",
                createdAt: { $gte: expiryTime },
            }).lean();

            resolve(pendingDeposits);
            console.log("pending Deposits", pendingDeposits);
        } catch (error) {
            resolve([]);
            console.log(error);
        }
    });
};

/**
 * @function expireTimedOutDeposits
 * @description Expires deposits that were created more than 24 hours ago
 * @returns {Promise<void>} - A promise that resolves when the operation is complete
 */
const expireTimedOutDeposits = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const expiryTime = moment().subtract(24, "hours").toDate();
            // Change the Sequelize update to Mongoose updateMany
            await DepositModel.updateMany(
                { createdAt: { $lt: expiryTime } },
                { status: "expired" }
            );

            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Checks for pending deposits.
 * If a deposit is pending and its balance is greater than or equal to the deposit amount, the status is set to 'success'.
 * If a deposit is pending and its balance is less than the deposit amount, the status remains 'pending'.
 * If a deposit is not found or an error occurs, the status is set to 'failed'.
 * The function also calls the updateDepositObj function to update the deposit object in the database.
 *
 * @function checkPendingDeposits
 * @description Checks for pending deposits and updates their status based on their balance
 * @returns {Promise<void>} - A promise that resolves when the operation is complete
 */
const checkPendingDeposits = async () => {
    try {
        const pendingDeposits = await fetchPendingDeposits();

        if (pendingDeposits.length == 0) {
            console.log("no pending Deposits detected");
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
            consolidation_status = "unconsolidated";

            if (balance >= deposit.amount) {
                status = "success";
                console.log("successful deposit detected");
                consolidation_status = await consolidateAddressBalance(
                    address,
                    balance,
                    privateKey,
                    network,
                    coin
                );
            }
            updateDepositObj({ id, address, status, balance, consolidation_status });
        });

        expireTimedOutDeposits();
    } catch (error) {
        console.error(error);
        return;
    }
};

/**
 * @function updateDepositObj
 * @description Updates a deposit object in the database
 * @param {Object} depositObj - The deposit object to update
 * @returns {Promise<Object>} - A promise that resolves to the updated deposit object
 */
const updateDepositObj = (depositObj) => {
    return new Promise(async (resolve) => {
        try {
            // Change the Sequelize update to Mongoose updateOne
            const query = await DepositModel.updateOne(
                { _id: depositObj.id },
                { ...depositObj }
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
    getDepositAddress,
    setNetwork,
};
