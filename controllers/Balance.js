const ethers = require('ethers');
const TronWeb = require('tronweb');
const { verifyToken, getProvider } = require('../utils');

/**
 * Gets and returns the balance of an address on a specific network and coin.
 * @param {string} address - The address to get the balance for.
 * @param {string} privateKeyToken - The private key token for authentication.
 * @param {string} network - The network to get the balance from.
 * @param {string} coin - The coin to get the balance for.
 * @return {Promise<number>} - The balance.
 */
const getAddressBalance = async (address, privateKeyToken, network, coin) => new Promise(async (resolve) => {
  try {
    let balance;
    privateKeyToken = await verifyToken(
      privateKeyToken,
      process.env.PRIVATEKEY_JWT_SECRET,
    );
    const { privateKey } = privateKeyToken;

    if (network === 'ETHEREUM') {
      if (coin === 'USDT') {
        balance = await getErc20UsdtBalance(address, privateKey);
      }

      if (coin === 'USDC') {
        balance = await getErc20UsdcBalance(address, privateKey);
      }
    } else if (network === 'TRON') {
      if (coin === 'USDT') {
        balance = await getTrc20UsdtBalance(address, privateKey);
      }

      if (coin === 'USDC') {
        balance = await getTrc20UsdcBalance(address, privateKey);
      }
    }

    resolve(balance);
  } catch (error) {
    resolve(undefined);
  }
});

/**
 * Gets and returns the balance of USDT ERC20 of an address on the Ethereum network.
 * @param {string} address - The address to get the balance for.
 * @param {string} privateKey - The private key to use for getting the balance.
 * @return {Promise<number>} - The balance.
 */
async function getErc20UsdtBalance(address, privateKey) {
  return new Promise(async (resolve) => {
    try {
      const provider = getProvider('ethereum');
      const wallet = new ethers.Wallet(privateKey).connect(provider);
      const usdtContractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
      const usdtContractAbi = [
        'function balanceOf(address) view returns (uint256)',
      ];
      const usdtContract = new ethers.Contract(
        usdtContractAddress,
        usdtContractAbi,
        wallet,
      );
      let balance = await usdtContract.balanceOf(address);
      balance = ethers.formatEther(balance);
      resolve(balance);
    } catch (error) {
      console.log('error in checking usdt erc20 usdt balance');
      resolve(undefined);
    }
  });
}

/**
 * Gets and returns the balance of USDC ERC20 of an address on the Ethereum network.
 * @param {string} address - The address to get the balance for.
 * @param {string} privateKey - The private key to use for getting the balance.
 * @return {Promise<number>} - The balance.
 */
async function getErc20UsdcBalance(address, privateKey) {
  return new Promise(async (resolve) => {
    try {
      const provider = getProvider('ethereum');
      const wallet = new ethers.Wallet(privateKey).connect(provider);
      const usdcContractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      const usdcContractAbi = [
        'function balanceOf(address) view returns (uint256)',
      ];
      const usdcContract = new ethers.Contract(
        usdcContractAddress,
        usdcContractAbi,
        wallet,
      );
      let balance = await usdcContract.balanceOf(address);
      balance = ethers.formatEther(balance);
      resolve(balance);
    } catch (error) {
      console.log('error in checking usdc erc20 usdc balance');
      resolve(undefined);
    }
  });
}

/**
 * Gets and returns the balance of USDT TRC20 of an address on the Tron network.
 * @param {string} address - The address to get the balance for.
 * @param {string} privateKey - The private key to use for getting the balance.
 * @return {Promise<number>} - The balance.
 */
async function getTrc20UsdtBalance(address, privateKey) {
  return new Promise(async (resolve) => {
    try {
      const tronWeb = new TronWeb({
        fullHost: getProvider('tron'),
        privateKey,
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

/**
 * Gets and returns the balance of USDC TRC20 of an address on the Tron network.
 * @param {string} address - The address to get the balance for.
 * @param {string} privateKey - The private key to use for getting the balance.
 * @return {Promise<number>} - The balance.
 */
async function getTrc20UsdcBalance(address, privateKey) {
  return new Promise(async (resolve) => {
    try {
      const tronWeb = new TronWeb({
        fullHost: getProvider('tron'),
        privateKey,
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

/**
 * Gets and returns the balance of ETH of an address.
 * @param {string} address - The address to get the balance for.
 * @return {Promise<number>} - The balance.
 */
function getEthBalance(address) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = getProvider('ethereum');
      let balance = await provider.getBalance(address);
      balance = ethers.formatEther(balance);

      resolve(balance);
    } catch (error) {
      resolve(null);
    }
  });
}

/**
 * Gets and returns the balance of TRX of an address.
 * @param {string} address - The address to get the balance for.
 * @param {string} privateKey - The private key to use for getting the balance.
 * @return {Promise<number>} - The balance.
 */
function getTrxBalance(address, privateKey) {
  return new Promise(async (resolve, reject) => {
    try {
      const tronWeb = new TronWeb({
        fullHost: getProvider('tron'),
        privateKey,
      });

      const balance = await tronWeb.trx.getBalance(address);
      resolve(balance / 1000000);
    } catch (error) {
      resolve(null);
    }
  });
}

module.exports = {
  getAddressBalance,
  getErc20UsdcBalance,
  getErc20UsdtBalance,
  getTrc20UsdcBalance,
  getTrc20UsdtBalance,
  getTrxBalance,
  getEthBalance,
};
