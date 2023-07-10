



const ethers = require("ethers");
const TronWeb = require("tronweb");
const { verifyToken } = require("../utils");
const getDepositAddress = require('./Address');
const FULL_NODE_API = "https://api.trongrid.io";


module.exports = consolidateAddressBalance = async (address, balance, privateKeyToken, network, coin) => {

    return new Promise(async (resolve) => {

        try {
            
            const  mainAddrObj = await getDepositAddress(network, coin, 0);
            const mainAddress = mainAddrObj.address;

            privateKeyToken = await verifyToken(privateKeyToken, process.env.PRIVATEKEY_JWT_SECRET);
            const privateKey = privateKeyToken.privateKey;

            if (network === "ETHEREUM") {

                if (coin === "USDT") {

                    balance = await consolidateErc20UsdtBalance(privateKey, balance, mainAddress);

                }

                if (coin === "USDC") {

                    balance = await consolidateErc20UsdcBalance(privateKey, balance, mainAddress);
                }

            } else if (network === "TRON") {

                if (coin === "USDT") {

                    balance = await consolidateTrc20UsdtBalance(privateKey, balance, mainAddress);

                }

                if (coin === "USDC") {

                    balance = await consolidateTrc20UsdcBalance(privateKey, balance, mainAddress);
                }

            }

            resolve(balance);


        } catch (error) {

            console.log(error);
            resolve(undefined);

        }

    })

}

const consolidateTrc20UsdtBalance = async (privateKey, balance, mainAddress) => {
    
    try {

        const tronWeb = new TronWeb({
            fullHost: FULL_NODE_API,
            privateKey
        });
        console.log(mainAddress);
        const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
        const usdtContract = await tronWeb.contract().at(usdtContractAddress);
        const transferTransaction = await usdtContract.transfer(mainAddress, balance).send();

        console.log('Consolidation transaction sent:');
        console.log(transferTransaction);

    } catch (error) {
        console.error('Error consolidating funds:', error);
    }

}