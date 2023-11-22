/**
 * @file This file is a module that exports several functions for handling deposits.
 * It includes functions for creating deposits, checking deposit status, and updating deposits.
 */
const moment = require('moment');
const cron = require('node-cron');
const DepositModel = require('../models/Deposit');
const { validateField, signToken } = require('../utils');
const { TYPE_EMAIL, sendEmail } = require('../services/emails/emailService');

const { getAddressBalance } = require('./Balance');
const consolidateAddressBalance = require('./Consolidation');
const getDepositAddress = require('./Address');
const UserController = require('./User');
const SettingController = require('./Setting');
const BusinessController = require('./Business');
const { updateAdminStats } = require('./Stats');
const User = require('../models/User');

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
 * @param {string} params.order_received_url - The URL for the order received page of the deposit.
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
  url,
  order_received_url,
  user,
  trm,
  trm_house,
  amount_fiat,
  coin_fiat,
  payment_fee,
  type_payment_fee,
  gmf,
  iva,
  commission_cumbi,
  amount_to_receive_in_bank,
  kyc
}) => new Promise(async (resolve, reject) => {
  try {
    if (!type) {
      reject({ status: 'failed', message: 'Incorrect type' });
      return;
    }
    const userObj = await User.findById(user); // Usa el método findById con el ObjectId

    // ToDo: agregar todos los calculos al backend de forma que no se pueda enviar datos malos desde el front
    if (type === 'api-payment') {
      const validate = validateField(reject, {
        amount,
        deposit_id,
        order_received_url,
        network,
        coin,
        user,
      });
      if (!validate) return;
    } else if (type === 'app-payment') {

      if (!await hasKYC(userObj.kyc)) {
        reject({ status: 'failed', message: 'Usuario pendiente por validación' });
        return;
      }

      const validate = validateField(reject, {
        trm,
        amount,
        network,
        coin,
        user,
      });
      if (!validate) return;
    } else {
      reject({ status: 'failed', message: 'Incorrect type' });
      return;
    }

    if (!isValidAmount(amount, reject) || !isValidNetwork(network, reject) || !isValidCoin(coin, reject)) return;

    if (type === 'api-payment') {
      if (!isValidURL(url, reject) || !isValidURL(order_received_url, reject)) return;

      getDepositAddress(network, coin).then(
        async ({ address, addressIndex, privateKey }) => {
          privateKey = signToken(
            { privateKey },
            process.env.PRIVATEKEY_JWT_SECRET,
            '1y',
          );

          const {
            trm,
            trm_house,
            amount_fiat,
            coin_fiat,
            payment_fee,
            type_payment_fee,
            commission_cumbi,
            iva,
            gmf,
            amount_to_receive_in_bank
          } = await getExtraData(user, amount);

          const depositObj = {
            address,
            address_index: addressIndex,
            privateKey,
            deposit_id,
            balance: 0,
            amount_usd: amount,
            status: 'pending',
            type: 'api-payment',
            amount,
            coin,
            network,
            url,
            order_received_url,
            user,
            trm,
            trm_house,
            amount_fiat,
            coin_fiat,
            payment_fee,
            type_payment_fee,
            commission_cumbi,
            iva,
            gmf,
            amount_to_receive_in_bank,
          };

          const save = await saveDepositObj(depositObj);

          if (save.success) {
            delete depositObj.address_index;
            delete depositObj.privateKey;
            const {
              _id, deposit_id, amount,
            } = save.deposit;
            // URL where we need to redirect the user to make the payment generated.
            const url = process.env.APPURL + '/invoice/' + _id;
            const email = await getEmailByUser(user);
            sendEmail(email, TYPE_EMAIL.INVOICE_CREATED, { url });
            resolve({
              status: 'success',
              object: {
                _id, deposit_id, url, amount,
              },
            });
          } else {
            console.log('Error in Deposit', save.error);
            reject({
              status: 'failed',
              // message: "Server Error: could not fetch deposit address",
              message: save.error,
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
        },
      ).catch((error) => {
        console.error(error);
        reject({ status: 'failed', message: 'Server Error' });
      });
    } else if (type === 'app-payment') {
      getDepositAddress(network, coin).then(
        async ({ address, addressIndex, privateKey }) => {
          privateKey = signToken(
            { privateKey },
            process.env.PRIVATEKEY_JWT_SECRET,
            '1y',
          );
          const coinPriceDouble = await getAmountCrypto();
          const coin_price = Number(coinPriceDouble).toFixed(2);
          const amount_crypto = Number((amount / coin_price).toFixed(6));
          const deposit_id = Date.now();

          const depositObj = {
            address,
            coin_price,
            deposit_id,
            privateKey,
            balance: 0,
            amount_usd: amount,
            status: 'pending',
            type: type || 'deposit',
            description: description || '',
            title: title || '',
            amount: amount_crypto,
            address_index: addressIndex,
            coin: coin.toUpperCase(),
            network: network.toUpperCase(),
            user,
            trm,
            trm_house,
            amount_fiat,
            coin_fiat: coin_fiat.toUpperCase(),
            payment_fee,
            type_payment_fee,
            gmf,
            iva,
            commission_cumbi,
            amount_to_receive_in_bank,
          };

          const save = await saveDepositObj(depositObj);

          if (save.success) {
            delete depositObj.address_index;
            delete depositObj.privateKey;

            const invoice_url = `${process.env.APPURL}/invoice/${save.deposit._id}`;
            const invoiceObj = {
              status: 'success',
              invoiceObj: { ...save.deposit, invoice_url },
            };
            // Send email invoice created
            const email = await getEmailByUser(user);
            sendEmail(email, TYPE_EMAIL.INVOICE_CREATED, { url: invoice_url });

            resolve(invoiceObj);
            // const { _id, deposit_id, url, amount } = save.deposit
            // resolve({ status: "success", object: { _id, deposit_id, url, amount } });
          } else {
            console.log('error in: getDepositAddress');
            reject({
              status: 'failed',
              // message: "Server Error: could not fetch deposit address",
              message: save.error,
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
        },
      ).catch((error) => {
        console.error(error);
        reject({ status: 'failed', message: 'Server Error' });
      });
    } else {
      reject({ status: 'failed', message: 'Incorrect type' });
    }
  } catch (error) {
    console.error(error);
    reject({ status: 'failed', message: 'Server Error' });
  }
});

/**
 * @function checkDepositExist
 * @description Checks if a deposit with the given ID exists in the database
 * @param {string} deposit_id - The ID of the deposit to check
 * @returns {Promise<Object>} - The deposit object if found, undefined otherwise
 */
const checkDepositExist = (deposit_id) => new Promise(async (resolve, reject) => {
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
    },
  );
});

/**
 * @function getAmountCrypto
 * @description Gets the amount of crypto. This function seems to be a placeholder as it currently returns 1.
 * @returns {Promise<number>} - A promise that resolves to the amount of crypto
 */
const getAmountCrypto = () => new Promise((resolve, reject) => {
  resolve(1);
});

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
  console.log(deposit_id);
  return new Promise((resolve, reject) => {
    getDepositAddress(network, coin).then(
      async ({ address, addressIndex, privateKey }) => {
        privateKey = signToken(
          { privateKey },
          process.env.PRIVATEKEY_JWT_SECRET,
          '1y',
        );
        await DepositModel.updateOne(
          { deposit_id, status: 'inactive' },
          {
            address,
            address_index: addressIndex,
            privateKey,
            network,
            coin,
            status: 'pending',
          },
        );
        resolve({ status: 'success' });
      },
      (err) => {
        reject({ status: 'failed', message: 'Server Error' });
      },
    ).catch((error) => {
      reject({ status: 'failed', message: 'Server Error' });
    });
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
const status = (_id) => new Promise((resolve) => {
  DepositModel.findById(_id)
    .then((d) => {
      if (d) {
        resolve({
          status: 'success',
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
            createdAt: d.createdAt,
            order_received_url: d.order_received_url,
            coin: d.coin == null ? d.coin : d.coin.toUpperCase(),
            network: d.network == null ? d.network : d.network.toUpperCase(),
          },
        });
      } else {
        resolve({
          status: 'failed',
          message: 'Could not find deposit',
        });
      }
    })
    .catch((err) => {
      console.log('error in status:', err.stack);
      resolve({
        status: 'failed',
        message: 'Server Error: kindly try again later',
      });
    });
});

/**
 * @function saveDepositObj
 * @description Saves a deposit object to the database
 * @param {Object} depositObj - The deposit object to save
 * @returns {Promise<boolean>} - A promise that resolves to true if the save was successful, false otherwise
 */
const saveDepositObj = (depositObj) => DepositModel.create(depositObj)
  .then((deposit) => {
    startCron();
    return { success: true, deposit };
  })
  .catch((error) => ({ success: false, error }));

/**
 * @function fetchPendingDeposits
 * @description Fetches pending deposits that were created in the last 1 hour
 * @returns {Promise<Array>} - A promise that resolves to an array of pending deposits
 */
const fetchPendingDeposits = () => new Promise(async (resolve, reject) => {
  try {
    const expiryTime = moment().subtract(1, 'hour').toDate();
    const pendingDeposits = await DepositModel.find({
      status: 'pending',
      createdAt: { $gte: expiryTime },
    }).lean();

    resolve(pendingDeposits);
  } catch (error) {
    resolve([]);
    console.log(error);
  }
});

/**
 * @function expireTimedOutDeposits
 * @description Expires deposits that were created more than 1 hour ago
 * @returns {Promise<void>} - A promise that resolves when the operation is complete
 */
const expireTimedOutDeposits = () => new Promise(async (resolve, reject) => {
  try {
    const expiryTime = moment().subtract(1, 'hour').toDate();
    // Change the Sequelize update to Mongoose updateMany
    await DepositModel.updateMany(
      { createdAt: { $lt: expiryTime }, status: 'pending' },
      { status: 'expired' },
    );

    resolve();
  } catch (error) {
    reject(error);
  }
});

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
      console.log('No pending Deposits detected');
      expireTimedOutDeposits();
      return false;
    }

    pendingDeposits.map(async (deposit) => {
      const {
        _id, address, privateKey, network, coin,
      } = deposit;
      let { consolidation_status, status } = deposit;
      let balance = await getAddressBalance(address, privateKey, network, coin);
      balance = balance || 0;

      if (balance >= deposit.amount) {
        status = 'success';
        console.log('successful deposit detected');
        const email = await getEmailByUser(user);
        sendEmail(email, TYPE_EMAIL.INVOICE_PAID, { _id });
        consolidation_status = await consolidateAddressBalance(
          address,
          balance,
          privateKey,
          network,
          coin,
        );
      } else {
        if (status === 'pending' && consolidation_status === 'unconsolidated') return true;
        status = 'pending';
        consolidation_status = 'unconsolidated';
      }

      updateDepositObj({
        _id, address, status, balance, consolidation_status,
      });
    });

    return true;
  } catch (error) {
    expireTimedOutDeposits();
    console.error(error);
    return true;
  }
};

/**
 * @function updateDepositObj
 * @description Updates a deposit object in the database
 * @param {Object} depositObj - The deposit object to update
 * @returns {Promise<Object>} - A promise that resolves to the updated deposit object
 */
const updateDepositObj = (depositObj) => new Promise(async (resolve) => {
  try {
    // Change the Sequelize update to Mongoose updateOne
    const query = await DepositModel.updateOne(
      { _id: depositObj._id },
      { ...depositObj },
    );

    resolve(query);
  } catch (error) {
    console.log(error);
  }
});

const consolidatePayment = ({ token, deposit_id }) => new Promise(async (resolve) => {
  try {
    const verify = await validateToken(token);
    if (verify.status === 'success') {
      const deposit = await DepositModel.findOne({ deposit_id }).exec();
      if (deposit) {
        resolve({ status: 'success' });
        // process continues resolve doesnt stop script
        // so admin wont have to wait for entire process of consolidation
        // when done db is auto updated
      }

      const {
        _id, address, balance, privateKey, network, coin,
      } = deposit;
      const consolidation_status = await consolidateAddressBalance(
        address,
        balance,
        privateKey,
        network,
        coin,
      );

      updateDepositObj({ _id, consolidation_status });
    } else resolve(verify);
  } catch (error) {
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

/**
 *
 * @param {*} _id  id del usuario obtenido por el token
 * @param {*} amount cantidad de dinero en USD
 * @returns
 */
const getExtraData = async (_id, amount) => {
  const { setting } = await SettingController.fetchOne();
  const { user } = await UserController.fetchByID(_id);
  let business_payment_fee = 0;
  if (user.business) {
    const { business } = await BusinessController.fetchByID(user.business);
    business_payment_fee = business.payment_fee;
  }

  const trm = setting.trm;
  const trm_house = trm * (((100 - setting.perc_buy_house) / 100));

  let payment_fee = 0;
  let type_payment_fee = '';
  if (user.payment_fee && user.payment_fee > 0) {
    payment_fee = user.payment_fee;
    type_payment_fee = 'person';
  } else if (business_payment_fee && business_payment_fee > 0) {
    payment_fee = business_payment_fee;
    type_payment_fee = 'business';
  } else {
    payment_fee = setting.perc_cumbi;
    type_payment_fee = 'cumbi';
  }

  const amountConvertedToFiat = parseFloat((trm_house * amount).toFixed(2));
  const commissionCumbi = parseFloat((amountConvertedToFiat * (payment_fee / 100)).toFixed(2));
  const iva = parseFloat((commissionCumbi * 0.19).toFixed(2)); // IVA del 19% sobre la comisión Cumbi
  const gmf = parseFloat(((amountConvertedToFiat - commissionCumbi - iva) * 0.004).toFixed(2)); // GMF (4x1000)
  const amountToReceiveInBank = parseFloat((amountConvertedToFiat - (iva + gmf + commissionCumbi)).toFixed(2));

  return {
    trm,
    trm_house,
    amount_fiat: amountConvertedToFiat, // Monto en fiat antes de la comisión
    coin_fiat: 'COP',
    payment_fee,
    type_payment_fee,
    commission_cumbi: commissionCumbi,
    iva: iva,
    gmf: gmf,
    amount_to_receive_in_bank: amountToReceiveInBank
  };
};

const isValidAmount = (amount, reject) => {
  if (Number.isNaN(amount)) {
    reject({
      status: 'failed',
      message: 'Amount must be a correct number',
      statusCode: 400,
    });
    return false;
  }

  if (amount <= 0) {
    reject({
      status: 'failed',
      message: 'Amount must be greater than zero',
      statusCode: 400,
    });
    return false;
  }

  return true;
};

const isValidURL = (url, reject) => {
  if (url.length > 2000) {
    reject({
      status: 'failed',
      message: 'URL is too large',
      statusCode: 400,
    });
    return false;
  }

  const urlPattern = /^(https?):\/\/[^\s/$.?#].[^\s]*$/;
  if (!urlPattern.test(url)) {
    reject({
      status: 'failed',
      message: 'URL has not a correct format',
      statusCode: 400,
    });
    return false;
  }

  return true;
};

const isValidNetwork = (network, reject) => {
  if (network !== 'TRON') {
    reject({
      status: 'failed',
      message: 'Network incorrect',
      statusCode: 400,
    });
    return false;
  }
  return true;
};

const isValidCoin = (coin, reject) => {
  if (coin !== 'USDT' && coin !== 'USDC') {
    reject({
      status: 'failed',
      message: 'Coin incorrect',
      statusCode: 400,
    });
    return false;
  }
  return true;
};

/**
 * The cron jobs run every 1 minutes and call the runCronJobs function.
 */
const cronJob = cron.schedule('*/1 * * * *', () => {
  runCronJobs();
});

/**
 * Starts the cron jobs.
 */
const startCron = () => {
  console.log('Cron Job Fired');
  cronJob.start();
};

const stopCron = () => {
  console.log('Cron Job Stoped');
  cronJob.stop();
};

/**
 * Runs the cron jobs.
 * The cron jobs check for pending deposits and update admin stats.
 */
async function runCronJobs() {
  if (!await checkPendingDeposits()) {
    stopCron();
  }
  updateAdminStats();
}

async function hasKYC(kyc) {
  if (kyc === 'accepted') return true;
  return false;
}

async function getEmailByUser(_id) {
  const user = await User.findById(_id).exec();
  return user.email;
}

module.exports = {
  create,
  status,
  checkPendingDeposits,
  getDepositAddress,
  setNetwork,
  updateDepositObj,
  consolidatePayment,
  startCron,
};
