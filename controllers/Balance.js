

const ethers = require("ethers");
const TronWeb = require("tronweb");
const { verifyToken } = require("../utils");
const FULL_NODE_API = "https://api.trongrid.io";


module.exports = getAddressBalance = async (address, privateKeyToken, network, coin) => {
  
    return new Promise(async (resolve) => {

        try {

            let balance = undefined;
            privateKeyToken = await verifyToken(privateKeyToken, process.env.PRIVATEKEY_JWT_SECRET);
            const privateKey = privateKeyToken.privateKey;

            if (network === "ETHEREUM") {

                if (coin === "USDT") {

                    balance = await getErc20UsdtBalance(address, privateKey);
                    
                }

                if (coin === "USDC") {

                    balance = await getErc20UsdcBalance(address, privateKey);
                }

            } else if (network === "TRON") {
    
                if (coin === "USDT") {

                    balance = await getTrc20UsdtBalance(address, privateKey);

                }

                if (coin === "USDC") {

                    balance = await getTrc20UsdcBalance(address, privateKey);
                }

            }

            resolve(balance);


        } catch (error) {

            resolve(undefined);

        }

    })

}

async function getErc20UsdtBalance(address, privateKey) {

    return new Promise(async (resolve) => {

        try {

            const provider = new ethers.getDefaultProvider();
            const wallet = new ethers.Wallet(privateKey).connect(provider);
            const usdtContractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
            const usdtContractAbi = [
                'function balanceOf(address) view returns (uint256)'
            ];
            const usdtContract = new ethers.Contract(usdtContractAddress, usdtContractAbi, wallet);
            let balance = await usdtContract.balanceOf(address);
            balance = ethers.formatEther(balance);
            resolve(balance);

        } catch (error) {

            console.log('error in checking usdt erc20 usdt balance');
            resolve(undefined);

        }
    });

}

async function getErc20UsdcBalance(address, privateKey) {

    return new Promise(async (resolve) => {

        try {

            const provider = new ethers.getDefaultProvider();
            const wallet = new ethers.Wallet(privateKey).connect(provider);
            const usdcContractAddress = '0x7EA2be2df7BA6E54B1A9C70676f668455E329d29';
            const usdcContractAbi = [
                'function balanceOf(address) view returns (uint256)'
            ];
            const usdcContract = new ethers.Contract(usdcContractAddress, usdcContractAbi, wallet);
            let balance = await usdcContract.balanceOf(address);
            balance = ethers.formatEther(balance);
            resolve(balance);

        } catch (error) {

            console.log('error in checking usdc erc20 usdc balance');
            resolve(undefined);

        }
        
    });

}

async function getTrc20UsdtBalance(address, privateKey) {
    return new Promise(async (resolve) => {

        try {

            const tronWeb = new TronWeb({
                fullHost: FULL_NODE_API,
                privateKey
            });

            const contractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
            const contract = await tronWeb.contract().at(contractAddress);
            let balance = await contract.balanceOf(address).call();
            balance = parseInt(balance.toString()) / 1000000;

            resolve(balance);

        } catch (error) {

            console.log('error in checking usdt trc20 usdt balance');
            resolve(undefined);

        }
    });

}

async function getTrc20UsdcBalance(address, privateKey) {

    return new Promise(async (resolve) => {

        try {

            const tronWeb = new TronWeb({
                fullHost: FULL_NODE_API,
                privateKey
            });

            const contractAddress = 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8';
            const contract = await tronWeb.contract().at(contractAddress);
            let balance = await contract.balanceOf(address).call();
            balance = parseInt(balance.toString()) / 1000000;

            resolve(balance);

        } catch (error) {

            console.log('error in checking usdt trc20 usdc balance');
            resolve(undefined);

        }
    });

}
