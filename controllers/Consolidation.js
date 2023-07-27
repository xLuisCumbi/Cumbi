/**
 * This module exports a function called consolidateAddressBalance which consolidates
 * the balance of a particular address, for a given coin, in a specific network.
 * It makes use of several helper functions to consolidate balances for different
 * coins on different networks (Ethereum and Tron).
 */
const ethers = require("ethers");
const TronWeb = require("tronweb");
const { verifyToken, getProvider } = require("../utils");
const getDepositAddress = require("./Address");

/**
 * Consolidates the balance of an address on a specific network and coin to a main address.
 * The balance is transferred from the address to the main address if the balance is not zero.
 * If the consolidation is successful, the status is set to 'success'.
 * If the consolidation fails, the status is set to 'unconsolidated'.
 * The main address is generated using the getDepositAddress function.
 * The private key for the address is retrieved by verifying the private key token.
 * @param {string} address - The address to consolidate the balance from.
 * @param {number} balance - The balance of the address.
 * @param {string} privateKeyToken - The private key token for authentication.
 * @param {string} network - The network to consolidate the balance on.
 * @param {string} coin - The coin to consolidate the balance for.
 * @return {Promise<string>} - The consolidation status.
 */
module.exports = consolidateAddressBalance = async (
    address,
    balance,
    privateKeyToken,
    network,
    coin
) => {
    return new Promise(async (resolve) => {
        let status = "unconsolidated";

        try {
            console.log(" consolidation started for address", address);
            const mainAddrObj = await getDepositAddress(network, coin, 0);

            privateKeyToken = await verifyToken(
                privateKeyToken,
                process.env.PRIVATEKEY_JWT_SECRET
            );
            const privateKey = privateKeyToken.privateKey;

            console.log('privateKey', privateKey);
            if (network === "ETHEREUM") {
                if (coin === "USDT") {
                    status = await consolidateErc20UsdtBalance(
                        privateKey,
                        balance,
                        mainAddrObj,
                        address
                    );
                }

                if (coin === "USDC") {
                    status = await consolidateErc20UsdcBalance(
                        privateKey,
                        balance,
                        mainAddrObj,
                        address
                    );
                }
            } else if (network === "TRON") {
                if (coin === "USDT") {
                    status = await consolidateTrc20UsdtBalance(
                        privateKey,
                        balance,
                        mainAddrObj,
                        address
                    );
                }

                if (coin === "USDC") {
                    status = await consolidateTrc20UsdcBalance(
                        privateKey,
                        balance,
                        mainAddrObj,
                        address
                    );
                }
            }

            resolve(status);
        } catch (error) {
            console.log(error);
            resolve(status);
        }
    });
};

/**
 * @function consolidateTrc20UsdtBalance
 * @param {string} privateKey - The private key.
 * @param {number} balance - The balance to consolidate.
 * @param {object} mainAddrObj - The main address object.
 * @param {string} address - The address to consolidate balance from.
 * @returns {Promise<string>} The consolidation status.
 *
 * This function consolidates the balance of a USDT (TRC20) token from the `address` to the main address (`mainAddrObj`) on the Tron network.
 */
const consolidateTrc20UsdtBalance = (
    privateKey,
    balance,
    mainAddrObj,
    address
) => {
    return new Promise(async (resolve) => {
        try {
            const activateAddress = await activateTronAddress(mainAddrObj, address);

            if (activateAddress) {
                const tronWeb = new TronWeb({
                    fullHost: getProvider("tron"),
                    privateKey,
                });
                balance = balance * 1000000;
                const usdtContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
                const usdtContract = await tronWeb.contract().at(usdtContractAddress);
                const transferTransaction = await usdtContract
                    .transfer(mainAddrObj.address, balance)
                    .send();

                console.log("Consolidation transaction sent for address:", address);

                const status = await confirmTronTransaction(
                    transferTransaction,
                    tronWeb
                );

                resolve(status);
            } else {
                resolve("unconsolidated");
                console.log("TRC20 USDT activation failed: kinldy check main wallet balance");
            }
        } catch (error) {
            resolve("unconsolidated");
            console.log(
                "Error processing transaction, account inactive issue predicted: marked as unconsolidated"
            );
        }
    });
};

/**
 * @function consolidateTrc20UsdcBalance
 * @param {string} privateKey - The private key.
 * @param {number} balance - The balance to consolidate.
 * @param {object} mainAddrObj - The main address object.
 * @param {string} address - The address to consolidate balance from.
 * @returns {Promise<string>} The consolidation status.
 *
 * This function consolidates the balance of a USDC (TRC20) token from the `address` to the main address (`mainAddrObj`) on the Tron network.
 */
const consolidateTrc20UsdcBalance = (
    privateKey,
    balance,
    mainAddrObj,
    address
) => {
    return new Promise(async (resolve) => {
        try {
            const activateAddress = await activateTronAddress(mainAddrObj, address);

            if (activateAddress) {
                const tronWeb = new TronWeb({
                    fullHost: getProvider("tron"),
                    privateKey,
                });
                balance = balance * 1000000;
                const usdtContractAddress = "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8";
                const usdtContract = await tronWeb.contract().at(usdtContractAddress);
                const transferTransaction = await usdtContract
                    .transfer(mainAddrObj.address, balance)
                    .send();

                console.log("Consolidation transaction sent for address:", address);

                const status = await confirmTronTransaction(
                    transferTransaction,
                    tronWeb
                );

                resolve(status);
            } else {
                resolve("unconsolidated");
                console.log("TRC20 USDC activation failed: kinldy check main wallet balance");
            }
        } catch (error) {
            resolve("unconsolidated");
            console.log(
                "Error processing transaction, account inactive issue predicted: marked as unconsolidated"
            );
        }
    });
};

/**
 * @function consolidateErc20UsdtBalance
 * @param {string} privateKey - The private key.
 * @param {number} balance - The balance to consolidate.
 * @param {object} mainAddrObj - The main address object.
 * @param {string} address - The address to consolidate balance from.
 * @returns {Promise<string>} The consolidation status.
 *
 * This function consolidates the balance of a USDT (ERC20) token from the `address` to the main address (`mainAddrObj`) on the Ethereum network.
 */
const consolidateErc20UsdtBalance = (
    privateKey,
    balance,
    mainAddrObj,
    address
) => {
    return new Promise(async (resolve) => {
        try {
            const activateAddress = await activateEthAddress(mainAddrObj, address);

            if (activateAddress) {
                const provider = getProvider("ethereum");
                const wallet = new ethers.Wallet(privateKey).connect(provider);

                const usdtContractAddress =
                    "0xdAC17F958D2ee523a2206206994597C13D831ec7";

                const erc20Abi = ["function transfer(address to, uint amount)"];

                const contract = new ethers.Contract(
                    usdtContractAddress,
                    erc20Abi,
                    wallet
                );
                const amount = ethers.parseUnits(String(balance), 6);
                const transactionResp = await contract.transfer(
                    mainAddrObj.address,
                    amount
                );
                const txReciept = await transactionResp.wait(1);
                if (txReciept.status === 1) {
                    console.log("consolidation successful");
                    resolve("success");
                } else {
                    resolve("unconsolidated");
                }
            } else {
                resolve("unconsolidated");
                console.log("ERC20 USDT activation failed: kinldy check main wallet balance");
            }
        } catch (error) {
            resolve("unconsolidated");
            console.log(
                "Error processing transaction, account inactive issue predicted: marked as unconsolidated"
            );
        }
    });
};

/**
 * @function consolidateErc20UsdcBalance
 * @param {string} privateKey - The private key.
 * @param {number} balance - The balance to consolidate.
 * @param {object} mainAddrObj - The main address object.
 * @param {string} address - The address to consolidate balance from.
 * @returns {Promise<string>} The consolidation status.
 *
 * This function consolidates the balance of a USDC (ERC20) token from the `address` to the main address (`mainAddrObj`) on the Ethereum network.
 */
const consolidateErc20UsdcBalance = (
    privateKey,
    balance,
    mainAddrObj,
    address
) => {
    return new Promise(async (resolve) => {
        try {
            const activateAddress = await activateEthAddress(mainAddrObj, address);

            if (activateAddress) {
                const provider = getProvider("ethereum");
                const wallet = new ethers.Wallet(privateKey).connect(provider);

                const usdtContractAddress =
                    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

                const erc20Abi = ["function transfer(address to, uint amount)"];

                const contract = new ethers.Contract(
                    usdtContractAddress,
                    erc20Abi,
                    wallet
                );
                const amount = ethers.parseUnits(String(balance), 6);
                const transactionResp = await contract.transfer(
                    mainAddrObj.address,
                    amount
                );
                const txReciept = await transactionResp.wait(1);
                if (txReciept.status === 1) {
                    console.log("consolidation successful");
                    resolve("success");
                } else {
                    resolve("unconsolidated");
                }
            } else {
                resolve("unconsolidated");
                console.log("ERC20 USDC activation failed: kinldy check main wallet balance");
            }
        } catch (error) {
            resolve("unconsolidated");
            console.log(
                "Error processing transaction, account inactive issue predicted: marked as unconsolidated"
            );
        }
    });
};

/**
 * @function activateEthAddress
 * @param {object} mainAddrObj - The main Ethereum address object.
 * @param {string} address - The address to activate.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the address was activated successfully.
 *
 * This function activates an Ethereum address by sending a small amount of Ether from the main address to the target address.
 */
const activateEthAddress = (mainAddrObj, address) => {
    return new Promise(async (resolve) => {
        console.log("eth address activation process started");

        try {
            const provider = getProvider("ethereum");
            const wallet = new ethers.Wallet(mainAddrObj.privateKey).connect(
                provider
            );

            const tx = {
                from: mainAddrObj.address,
                to: address,
                value: ethers.parseEther("0.0004"),
                gasPrice: ethers.toBigInt(1200),
            };

            const transactionResp = await wallet.sendTransaction(tx);
            const txReciept = await transactionResp.wait(1);
            if (txReciept.status === 1) {
                console.log("address activation process completed");
                resolve(true);
            } else {
                resolve(undefined);
            }
        } catch (error) {
            console.log("error is", error);
        }
    });
};

/**
 * @function activateTronAddress
 * @param {object} mainAddrObj - The main Tron address object.
 * @param {string} address - The address to activate.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the address was activated successfully.
 *
 * This function activates a Tron address by sending a small amount of TRX from the main address to the target address.
 */
const activateTronAddress = (mainAddrObj, address) => {
    return new Promise(async (resolve) => {
        console.log("TRC address activation process started");

        const tronWeb = new TronWeb({
            fullHost: getProvider("tron"),
            privateKey: mainAddrObj.privateKey,
        });
        const amount = 20 * 1000000;
        const txObj = await tronWeb.trx.sendTransaction(
            address,
            amount,
            mainAddrObj.privateKey
        );

        if (txObj.result === true) {
            setTimeout(() => {
                console.log("address activation process completed");
                resolve(true);
            }, 30000);
        } else {
            resolve(undefined);
        }
    });
};

/**
 * @function confirmTronTransaction
 * @param {string} transferTransactionId - The ID of the transfer transaction to confirm.
 * @param {object} tronWeb - The TronWeb instance.
 * @returns {Promise<string>} A promise that resolves to the consolidation status.
 *
 * This function confirms a Tron transaction by checking the transaction receipt.
 * If the transaction was successful, it resolves to 'success'.
 * If not, it resolves to 'unconsolidated'.
 */
const confirmTronTransaction = (transferTransactionId, tronWeb) => {
    return new Promise(async (resolve) => {
        console.log("waiting for transaction receipt");
        setTimeout(async () => {
            try {
                const confirmedTransaction = await tronWeb.trx.getTransaction(
                    transferTransactionId
                );

                if (confirmedTransaction.ret[0].contractRet === "SUCCESS") {
                    console.log("consolidation successful");
                    resolve("success");
                } else {
                    console.log("consolidation failed: transaction failed");
                    resolve("unconsolidated");
                }
            } catch (error) {
                resolve("unconsolidated");
                console.log(
                    "transaction receipt not available yet",
                    error,
                    "re-checking transaction"
                );
            }
        }, 3000);
    });
};
