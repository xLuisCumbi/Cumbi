const ethers = require("ethers");
const TronWeb = require("tronweb");
const Mnemonic = require("bitcore-mnemonic");
const DepositModel = require("../models/Deposit");
const AdminModel = require("../models/Admin");
const { verifyToken, getProvider } = require("../utils");

module.exports = getDepositAddress = (network, coin, index) => {

    return new Promise(async (resolve, reject) => {
        try {
            const mnemonic = await getMnemonic();
            const addressIndex = index === undefined ? await getAddressIndex(network, coin) : index; 
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
            console.log(error);
            reject({ status: "failed", message: "Error generating address" });
        }
    });
};


const getErc20Address = (privateKey) => {
    return new Promise(async (resolve, reject) => {
        try {
            const provider = getProvider('ethereum');
            const wallet = new ethers.Wallet(privateKey).connect(provider);
            resolve(wallet.address);
        } catch (error) {
            reject();
        }
    });
};

const getTrc20Address = (privateKey) => {
    return new Promise((resolve, reject) => {
        try {
            const tronWeb = new TronWeb({
                fullHost: getProvider('tron'),
                privateKey,
            });

            const address = tronWeb.address.fromPrivateKey(privateKey);
            resolve(address);
        } catch (error) {
            reject();
        }
    });
};

const getAddressIndex = (network, coin) => {
    
    return new Promise((resolve, reject) => {
        DepositModel.findOne({
            where: { network, coin },
            order: [["id", "DESC"]],
        })
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

const getMnemonic = () => {
    return new Promise((resolve, reject) => {
        AdminModel.findOne({
            order: [["id", "DESC"]],
        })
            .then((admin) => {
                const phraseToken = admin.passphrase;
                verifyToken(phraseToken, process.env.MNEMONIC_JWT_SECRET).then(
                    (phraseObj) => {
                        resolve(phraseObj.mnemonic);
                    }
                );
            })
            .catch((error) => {
                reject(error);
            });
    });
};
