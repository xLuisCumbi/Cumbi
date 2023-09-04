const ethers = require("ethers");
const TronWeb = require("tronweb");
const Mnemonic = require("bitcore-mnemonic");
const DepositModel = require("../models/Deposit");
const SettingModel = require('../models/Setting'); // Reemplaza la ruta con la correcta
const { verifyToken, getProvider, checkSupportedAddress } = require("../utils");
require("dotenv").config();

/**
 * Generates and returns a deposit address for a specific network and coin using a mnemonic phrase and an address index.
 * Uses different derivation paths for Ethereum and Tron.
 * @param {string} network - The network to generate the address for (Ethereum or Tron).
 * @param {string} coin - The coin to generate the address for.
 * @param {number} index - The index to use for generating the address.
 * @return {Promise<Object>} - The generated address, address index, and private key.
 */
module.exports = getDepositAddress = (network, coin, index) => {
    return new Promise(async (resolve, reject) => {
        try {
            const supported = checkSupportedAddress(network, coin);
            if (supported.status === false) {
                reject({
                    status: "failed",
                    message: supported.message,
                    statusCode: 400,
                });
            }
            const mnemonic = await getMnemonic();
            const addressIndex =
                index === undefined ? await getAddressIndex(network, coin) : index;
            const code = new Mnemonic(mnemonic);
            const hdPrivateKey = code.toHDPrivateKey();
            let derivationPath;
            let derivedHDPrivateKey;
            let privateKey;

            network = network.toUpperCase();
            coin = coin.toUpperCase();

            if (network === "ETHEREUM") {
                derivationPath = `m/44'/60'/0'/0/${addressIndex}`;
                derivedHDPrivateKey = hdPrivateKey.derive(derivationPath);
                privateKey = derivedHDPrivateKey.privateKey.toString();
                address = await getErc20Address(privateKey);
            } else if (network === "TRON") {
                derivationPath = `m/44'/195'/0'/0/${addressIndex}`;
                derivedHDPrivateKey = hdPrivateKey.derive(derivationPath);
                privateKey = derivedHDPrivateKey.privateKey.toString();
                address = await getTrc20Address(privateKey);
            }

            resolve({ address, addressIndex, privateKey });
        } catch (error) {
            console.log('Error in getDepositAddress:', error);
            console.log('Error stack in getDepositAddress:', error.stack);
            reject({ status: "failed", message: "Error generating address" });
        }
    });
};

/**
 * Gets and returns an ERC20 address on the Ethereum network using a private key.
 * @param {string} privateKey - The private key to use for generating the address.
 * @return {Promise<string>} - The generated address.
 */
const getErc20Address = (privateKey) => {
    return new Promise(async (resolve, reject) => {
        try {
            const provider = getProvider("ethereum");
            const wallet = new ethers.Wallet(privateKey).connect(provider);
            resolve(wallet.address);
        } catch (error) {
            reject();
        }
    });
};

/**
 * Gets and returns a TRC20 address on the Tron network using a private key.
 * @param {string} privateKey - The private key to use for generating the address.
 * @return {Promise<string>} - The generated address.
 */
const getTrc20Address = (privateKey) => {
    return new Promise((resolve, reject) => {
        try {
            const tronWeb = new TronWeb({
                fullHost: getProvider("tron"),
                privateKey,
            });

            const address = tronWeb.address.fromPrivateKey(privateKey);
            resolve(address);
        } catch (error) {
            reject();
        }
    });
};

/**
 * Gets and returns the index of the last generated address for a specific network and coin from the database.
 * @param {string} network - The network to get the address index for.
 * @param {string} coin - The coin to get the address index for.
 * @return {Promise<number>} - The address index.
 */
const getAddressIndex = (network, coin) => {
    return new Promise((resolve, reject) => {
        DepositModel.findOne({ network, coin }).sort({ id: -1 })
            .then((lastInsertedRow) => {
                if (!lastInsertedRow) {
                    resolve(1);
                } else {
                    resolve(lastInsertedRow.address_index + 1);
                }
            })
            .catch((error) => {
                console.log(error);
                reject({ status: "failed", message: "error generating address index" });
            });
    });
};

/**
 * Gets and returns the admin's mnemonic phrase from the database.
 * @return {Promise<string>} - The mnemonic phrase.
 */
const getMnemonic = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const setting = await SettingModel.findOne({});

            if (!setting || !setting.passphrase) {
                return reject({ status: 'failed', message: 'Mnemonic passphrase not found in settings' });
            }

            const phraseToken = setting.passphrase;
            verifyToken(phraseToken, process.env.MNEMONIC_JWT_SECRET).then(
                (phraseObj) => {
                    resolve(phraseObj.mnemonic);
                }
            ).catch((error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};
