



const ethers = require("ethers");
const TronWeb = require("tronweb");
const { verifyToken } = require("../utils");
const getDepositAddress = require('./Address');
const FULL_NODE_API = "https://api.trongrid.io";


module.exports = consolidateAddressBalance = async (address, balance, privateKeyToken, network, coin) => {

    return new Promise(async (resolve) => {

        let status = 'unconsolidated';

        try {

            console.log(' consolidation started for address', address);
            const mainAddrObj = await getDepositAddress(network, coin, 0);

            privateKeyToken = await verifyToken(privateKeyToken, process.env.PRIVATEKEY_JWT_SECRET);
            const privateKey = privateKeyToken.privateKey;

            if (network === "ETHEREUM") {

                if (coin === "USDT") {

                    status = await consolidateErc20UsdtBalance(privateKey, balance, mainAddrObj);

                }

                if (coin === "USDC") {

                    status = await consolidateErc20UsdcBalance(privateKey, balance, mainAddrObj);
                }

            } else if (network === "TRON") {

                if (coin === "USDT") {

                    status = await consolidateTrc20UsdtBalance(privateKey, balance, mainAddrObj, address);

                }

                if (coin === "USDC") {

                    status = await consolidateTrc20UsdcBalance(privateKey, balance, mainAddrObj);
                }

            }

            resolve(status);


        } catch (error) {

            console.log(error);
            resolve(status);

        }

    })

}

const consolidateTrc20UsdtBalance = (privateKey, balance, mainAddrObj, address) => {

    return new Promise(async (resolve) => {
        try {

            const activateAddrress = await activateTronAddress(mainAddrObj, address);

            if (activateAddrress) {

                const tronWeb = new TronWeb({
                    fullHost: FULL_NODE_API,
                    privateKey
                });
                balance = balance * 1000000;
                const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
                const usdtContract = await tronWeb.contract().at(usdtContractAddress);
                const transferTransaction = await usdtContract.transfer(mainAddrObj.address, balance).send();

                console.log('Consolidation transaction sent for address:', address);

                const status = await confirmTronTransaction(transferTransaction, tronWeb);

                resolve(status);

            } else {

                resolve('unconsolidated');
                console.log('activation failed: kinldy check main wallet balance');
            }

        } catch (error) {

            resolve('unconsolidated');
            console.log('Error processing transaction, account inactive issue predicted: marked as unconsolidated');

        }
    })

}

const consolidateTrc20UsdcBalance = () => {

    return new Promise(async (resolve) => {
        try {

            const activateAddrress = await activateTronAddress(mainAddrObj, address);

            if (activateAddrress) {

                const tronWeb = new TronWeb({
                    fullHost: FULL_NODE_API,
                    privateKey
                });
                balance = balance * 1000000;
                const usdtContractAddress = 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8';
                const usdtContract = await tronWeb.contract().at(usdtContractAddress);
                const transferTransaction = await usdtContract.transfer(mainAddrObj.address, balance).send();

                console.log('Consolidation transaction sent for address:', address);

                const status = await confirmTronTransaction(transferTransaction, tronWeb);

                resolve(status);

            } else {

                resolve('unconsolidated');
                console.log('activation failed: kinldy check main wallet balance');
            }

        } catch (error) {

            resolve('unconsolidated');
            console.log('Error processing transaction, account inactive issue predicted: marked as unconsolidated');

        }
    })

}


const activateTronAddress = (mainAddrObj, address) => {

    return new Promise(async (resolve) => {
        console.log('address activation process started');

        const tronWeb = new TronWeb({
            fullHost: FULL_NODE_API,
            privateKey: mainAddrObj.privateKey
        });
        const amount = 15 * 1000000;
        const txObj = await tronWeb.trx.sendTransaction(address, amount, mainAddrObj.privateKey);

        if (txObj.result === true) {

            setTimeout(() => {

                console.log('address activation process completed');
                resolve(true);

            }, 30000);

        } else {

            resolve(undefined);

        }



    })

}

const confirmTronTransaction = (transferTransactionId, tronWeb) => {

    return new Promise(async (resolve) => {

        console.log('waiting for transaction receipt');
        setTimeout(async () => {

            try {

                const confirmedTransaction = await tronWeb.trx.getTransaction(transferTransactionId);

                if (confirmedTransaction.ret[0].contractRet === 'SUCCESS') {

                    console.log('consolidation successful');
                    resolve('success');

                } else {

                    console.log('consolidation failed: transaction failed');
                    resolve('unconsolidated');
                }


            } catch (error) {
                console.log('transaction receipt not available yet', error, 're-checking transaction');
            }

        }, 3000);

    })
}
