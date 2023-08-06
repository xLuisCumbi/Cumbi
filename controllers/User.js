const DepositModel = require('../models/Deposit');
const UserModel = require('../models/User');
const { signToken, bcryptCompare, verifyToken, genHash } = require('../utils');
const { create, updateDepositObj } = require('./Deposit');
const ApiTokenModel = require('../models/ApiToken');
const consolidateAddressBalance = require('./Consolidation');
const bcrypt = require('bcryptjs');

// UserModel.sync({ alter: true});

// ApiTokenModel.sync({ alter: true});

/**
 * Validates a JWT token and returns the admin ID if the token is valid.
 * @param {string} token - The JWT token to validate.
 * @return {Promise<Object>} - The validation result.
 */
const validateToken = async (token) => {
  try {
    const adminObj = await verifyToken(token, process.env.JWT_SECRET);
    const admin_id = adminObj.admin_id;
    const query = await UserModel.findOne({ admin_id, token });

    if (query) {
      return { status: 'success', admin_id };
    } else {
      return { status: 'auth_failed', message: 'invalid token' };
    }
  } catch (e) {
    console.error('Error during token validation:', e);
    return { status: 'auth_failed', message: 'invalid token' };
  }
};

/**
 * Handles admin login. Verifies email and password, and if correct, returns a JWT token.
 * @param {Object} params - The login parameters.
 * @param {string} params.email - The admin's email.
 * @param {string} params.password - The admin's password.
 * @return {Promise<Object>} - The login result.
 */
const login = ({ email, password }) => {
  return new Promise(async (resolve) => {
    try {
      // ToDo no valida password?
      const query = await UserModel.findOne({ email });
      if (query) {
        const checkPassword = bcryptCompare(password, query.password);

        if (checkPassword) {
          if (query.admin_id) {
            const admin_id = query.admin_id;
            const token = signToken(
              { admin_id, type: 'admin_token' },
              process.env.JWT_SECRET,
              '5d'
            );
            await UserModel.findOneAndUpdate({ admin_id }, { token });
            resolve({
              status: 'success',
              user: { authToken: token, email, username: query.username },
            });
          } else {
            const token = signToken(
              { id: query._id, type: 'business_token' },
              process.env.JWT_SECRET,
              '5d'
            );
            resolve({
              status: 'success',
              user: { authToken: token, email, username: query.username },
            });
          }
        } else {
          resolve({
            status: 'auth_failed',
            message: 'Incorrect username or password',
          });
        }
      } else {
        resolve({
          status: 'auth_failed',
          message: 'Incorrect username or password',
        });
      }
    } catch (e) {
      console.error('Error during login:', e);

      resolve({ status: 'auth_failed', message: 'server error' });
    }
  });
};

/**
 * Handles user signUp.
 * @param {Object} params - The login parameters.
 * @param {string} params.email - The user's email.
 * @param {string} params.password - The user's password.
 * @param {string} params.business - The user's business.
 * @param {string} params.domain - The user's user.
 * @return {Promise<Object>} - The signup result.
 */
const signUp = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      userData.password = await bcrypt.hash(userData.password, 10);
      const query = await UserModel.create(userData);
      resolve({ status: 'signUp_success', user: query });
    } catch (e) {
      console.error('Error during login:', e);
      reject({ status: 'signUp_failed', message: 'server error' });
    }
  });
};

/**
 * Returns all deposits from the database.
 * @param {Object} params - The parameters.
 * @param {string} params.token - The JWT token for authentication.
 * @return {Promise<Object>} - The fetch result.
 */
const fetchDeposits = ({ token }) => {
  return new Promise(async (resolve) => {
    try {
      const verify = await validateToken(token);
      if (verify.status === 'success') {
        const deposits = await DepositModel.find(
          {},
          { privateKey: 0, address_index: 0 }
        )
          .limit(250)
          .lean();
        resolve({ status: 'success', deposits });
      } else resolve(verify);
    } catch (error) {
      console.error('Error while fetching deposits:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

const consolidatePayment = ({ token, deposit_id }) => {
  return new Promise(async (resolve) => {
    try {
      const verify = await validateToken(token);
      if (verify.status === 'success') {
        const deposit = await DepositModel.findOne({ deposit_id }).exec();
        if (deposit) {
          resolve({ status: 'success' });
          //process continues resolve doesnt stop script
          //so admin wont have to wait for entire process of consolidation
          //when done db is auto updated
        }

        const { _id, address, balance, privateKey, network, coin } = deposit;
        const consolidation_status = await consolidateAddressBalance(
          address,
          balance,
          privateKey,
          network,
          coin
        );

        updateDepositObj({ _id, consolidation_status });
      } else resolve(verify);
    } catch (error) {
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

/**
 * Creates a new API token and stores it in the database.
 * @param {Object} params - The parameters.
 * @param {string} params.token - The JWT token for authentication.
 * @param {string} params.token_name - The name for the new API token.
 * @return {Promise<Object>} - The creation result.
 */
const createToken = ({ token, token_name }) => {
  return new Promise(async (resolve) => {
    try {
      const verify = await validateToken(token);

      if (verify.status == 'success') {
        const token = signToken(
          { type: 'api_token', token_name },
          process.env.API_JWT_SECRET,
          '100y'
        );

        const createdAt = new Date();
        const createToken = await ApiTokenModel.create({
          token_name,
          token,
          createdAt,
        });

        if (createToken) {
          resolve({ status: 'success' });
        } else {
          resolve({ status: 'failed', message: 'Error Creating Token' });
        }
      } else {
        resolve(verify);
      }
    } catch (error) {
      console.log('error stack', error.stack);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

/**
 * Returns all API tokens from the database.
 * @param {Object} params - The parameters.
 * @param {string} params.token - The JWT token for authentication.
 * @return {Promise<Object>} - The fetch result.
 */
const fetchTokens = ({ token }) => {
  return new Promise(async (resolve) => {
    try {
      const verify = await validateToken(token);

      if (verify.status === 'success') {
        const tokens = await ApiTokenModel.find({}).limit(200).lean();
        resolve({ status: 'success', tokens });
      } else {
        resolve(verify);
      }
    } catch (error) {
      console.error('Error while fetching tokens:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

/**
 * Deletes an API token from the database.
 * @param {Object} params - The parameters.
 * @param {string} params.token - The JWT token for authentication.
 * @param {string} params.token_id - The ID of the API token to delete.
 * @return {Promise<Object>} - The deletion result.
 */
const deleteToken = ({ token, token_id }) => {
  return new Promise(async (resolve) => {
    try {
      const verify = await validateToken(token);

      if (verify.status == 'success') {
        await ApiTokenModel.findByIdAndDelete(token_id);
        resolve({ status: 'success' });
      } else {
        resolve(verify);
      }
    } catch (error) {
      console.log('error', error.stack);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

/**
 * Updates the admin information in the database.
 * @param {Object} params - The parameters.
 * @param {string} params.passphrase - The new passphrase.
 * @param {string} params.email - The new email.
 * @param {string} params.username - The new username.
 * @param {string} params.password - The new password.
 * @param {string} params.token - The JWT token for authentication.
 * @return {Promise<Object>} - The update result.
 */
const update = ({ passphrase, email, username, password, token }) => {
  return new Promise(async (resolve) => {
    try {
      const verify = await validateToken(token);

      if (verify.status == 'success') {
        adminObj = {};
        if (passphrase)
          adminObj.passphrase = signToken(
            { mnemonic: passphrase, type: 'mnemonic-token' },
            process.env.MNEMONIC_JWT_SECRET,
            '100y'
          );
        if (password) adminObj.password = await genHash(password);
        if (email) adminObj.email = email;
        if (username) adminObj.username = username;
        adminObj.updatedAt = new Date();
        await UserModel.updateOne(
          { admin_id: verify.admin_id },
          adminObj
        ).exec();

        resolve({ status: 'success' });
      } else resolve(verify);
    } catch (error) {
      console.log('error', error.stack);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

/**
 * Creates a new invoice.
 * @param {Object} params - The parameters.
 * @param {string} params.title - The title of the invoice.
 * @param {string} params.description - The description of the invoice.
 * @param {number} params.amount - The amount of the invoice.
 * @param {string} params.network - The network for the invoice.
 * @param {string} params.coin - The coin for the invoice.
 * @param {string} params.token - The JWT token for authentication.
 * @return {Promise<Object>} - The creation result.
 */
const createInvoice = ({
  title,
  description,
  amount,
  network,
  coin,
  token,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const verify = await validateToken(token);

      if (verify.status == 'success') {
        const deposit_id = Date.now();
        const respoonse = await create({
          amount,
          deposit_id,
          network,
          coin,
          type: 'invoice',
          description,
          title,
        });
        const invoice_url = process.env.APPURL + '/invoice/' + deposit_id;
        const invoiceObj = {
          status: 'success',
          invoiceObj: { ...respoonse.depositObj, invoice_url },
        };
        resolve(invoiceObj);
      } else {
        resolve(verify);
      }
    } catch (error) {
      reject({ message: 'error creating invoice' });
    }
  });
};

/**
 * Returns the admin's statistics.
 * @param {Object} params - The parameters.
 * @param {string} params.token - The JWT token for authentication.
 * @return {Promise<Object>} - The statistics.
 */
const adminStats = ({ token }) => {
  return new Promise(async (resolve) => {
    try {
      const verify = await validateToken(token);
      if (verify.status == 'success') {
        const query = await UserModel.findOne({
          admin_id: verify.admin_id,
        });

        if (!query || query.stats === null) {
          resolve({ status: 'failed', message: 'Admin statistics not found' });
          return;
        }

        const s = JSON.parse(query.stats);
        const updated = query.last_stats_update;
        const stats = {
          eth_balance: {
            value: s.eth_balance.value,
            updated,
          },

          trx_balance: {
            value: s.trx_balance.value,
            updated,
          },

          eth_usdt_balance: {
            value: s.eth_usdt_balance.value,
            updated,
          },

          trx_usdt_balance: {
            value: s.trx_usdt_balance.value,
            updated,
          },

          eth_usdc_balance: {
            value: s.eth_usdc_balance.value,
            updated,
          },

          trx_usdc_balance: {
            value: s.trx_usdc_balance.value,
            updated,
          },

          successful_deposits: {
            value: s.successful_deposits.value,
            updated,
          },

          total_paid: {
            value: s.total_paid.value,
            updated,
          },
        };

        resolve({ status: 'success', stats });
      } else {
        resolve(verify);
      }
    } catch (error) {
      console.log('error', error.stack);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

module.exports = {
  fetchDeposits,
  login,
  validateToken,
  update,
  adminStats,
  createInvoice,
  createToken,
  fetchTokens,
  deleteToken,
  consolidatePayment,
  signUp,
};
