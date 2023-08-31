const DepositModel = require('../models/Deposit');
const BusinessModel = require('../models/Business');
const { signToken, bcryptCompare, verifyToken, genHash } = require('../utils');
// const { create, updateDepositObj } = require('./Deposit');
const ApiTokenModel = require('../models/ApiToken');
const consolidateAddressBalance = require('./Consolidation');
const bcrypt = require('bcryptjs');
const ObjectId = require('mongoose').Types.ObjectId;


const create = (businessData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = await BusinessModel.create(businessData);
      resolve({ status: 'success', business: query });
    } catch (e) {
      console.error('Error during login:', e);
      reject({ status: 'failed', message: 'server error' });
    }
  });
};

const fetch = () => {
  return new Promise(async (resolve) => {
    try {
      const businesses = await BusinessModel.find().limit(250)
      resolve({ status: 'success', businesses });
    } catch (error) {
      console.error('Error while fetching business:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

// UserModel.sync({ alter: true});

// ApiTokenModel.sync({ alter: true});

/**
 * Validates a JWT token and returns the admin ID if the token is valid.
 * @async
 * @function validateToken
 * @param {string} token - The token to be validated.
 * @returns {Promise<Object>} The result of the validation.
 * @throws Will throw an error if the token verification fails.

 */
const validateToken = async (token) => {
  try {
    const decodedObj = await verifyToken(token, process.env.JWT_SECRET);

    // If it's a business_token, handle its validation
    if (decodedObj.type === "business_token") {
      // Here, you can add any specific logic for business tokens.
      // For now, I'm just returning success if it's a valid business_token.
      return { status: 'success', type: 'business' };
    }

    // If it's an admin_token, proceed with the current logic
    const id = decodedObj.id; // Use id instead of admin_id
    const query = await UserModel.findOne({ _id: id, token });

    if (query) {
      return { status: 'success', id, role: query.role };
    } else {
      return { status: 'auth_failed', message: 'invalid token query' };
    }
  } catch (e) {
    console.error('Error during token validation:', e);
    return { status: 'auth_failed', message: 'invalid token triggered catch' };
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
      const query = await UserModel.findOne({ email });
      if (query) {
        const checkPassword = bcryptCompare(password, query.password);

        if (checkPassword) {
          const token = signToken(
            { id: query._id, type: 'admin_token' }, // Use _id instead of admin_id
            process.env.JWT_SECRET,
            '5d'
          );
          await UserModel.findOneAndUpdate({ _id: query._id }, { token }); // Use _id instead of admin_id
          resolve({
            status: 'success',
            user: { id: query._id, authToken: token, email, username: query.username, role: query.role, business: query.business },
          });
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
const fetchDeposits = ({ token, user }) => {
  return new Promise(async (resolve) => {
    try {
      const verify = await validateToken(token);
      if (verify.status === 'success') {
        let query = {};

        if (user.role !== 'admin') {
          query.user = user.id;
        }

        const deposits = await DepositModel.find(query, { privateKey: 0, address_index: 0 })
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
 * @param {string} params.user - The id of the user.
 * @return {Promise<Object>} - The creation result.
 */
const createToken = ({ token, token_name, user }) => {
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
          user, // The user is associated with the token here
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

      if (verify.status === 'success' && verify.role === 'admin') {
        console.log(verify)
        const tokens = await ApiTokenModel.find({ user: new ObjectId(verify.id) }).limit(200).lean();
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
        if (passphrase) {
          adminObj.passphrase = signToken(
            { mnemonic: passphrase, type: 'mnemonic-token' },
            process.env.MNEMONIC_JWT_SECRET,
            '100y'
          );
        }
        if (password) adminObj.password = await genHash(password);
        if (email) adminObj.email = email;
        if (username) adminObj.username = username;
        adminObj.updatedAt = new Date();
        await UserModel.updateOne(
          { _id: verify.id }, // Use _id instead of admin_id
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
  user,
  trm
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const verify = await validateToken(token);

      if (amount / trm < 100) {
        reject({ message: 'error creating invoice' });
        return
      }

      if (verify.status == 'success') {
        const deposit_id = Date.now();

        // Fetch the user from the database
        const userObj = await UserModel.findById(user);
        if (!userObj) {
          reject({ message: 'User not found' });
          return;
        }

        const response = await create({
          amount,
          deposit_id,
          network,
          coin,
          type: 'invoice',
          description,
          title,
          user: userObj // Use the fetched user's _id
        });

        const invoice_url = process.env.APPURL + '/invoice/' + deposit_id;
        const invoiceObj = {
          status: 'success',
          invoiceObj: { ...response.depositObj, invoice_url },
        };
        resolve(invoiceObj);
      } else {
        resolve(verify);
      }
    } catch (error) {
      console.log('error create invoice ', error);
      console.error('Error Stack Trace: ', error.stack); // print the error stack trace
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
      console.log('verify stats id', verify);
      if (verify.status == 'success') {
        const query = await UserModel.findOne({
          _id: verify.id, // Use _id instead of admin_id
        });

        if (!query || query.stats === null) {
          resolve({ status: 'failed', message: 'Admin statistics not found' });
          return;
        }

        let s;
        if (query.stats) {
          try {
            s = JSON.parse(query.stats);
          } catch (error) {
            console.error('Error parsing stats:', error);
            resolve({ status: 'failed', message: 'Error parsing stats' });
            return;
          }
        } else {
          // Default values for stats
          s = {
            eth_balance: { value: 0 },
            trx_balance: { value: 0 },
            eth_usdt_balance: { value: 0 },
            trx_usdt_balance: { value: 0 },
            eth_usdc_balance: { value: 0 },
            trx_usdc_balance: { value: 0 },
            successful_deposits: { value: 0 },
            total_paid: { value: 0 }
          };
        }

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
      console.log('error stats', error);
      console.log('error stats', error.stack);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};


const getByBusiness = ({ id }) => {

  return new Promise(async (resolve) => {
    try {
      const { business } = await UserModel.findById(id)
      const users = await UserModel.find({ business: business })
      resolve({
        status: 'success',
        users,
      });
    } catch (e) {
      console.error('Error during login:', e);
      resolve({ status: 'auth_failed', message: 'server error' });
    }
    // const id = req.params.id_user;

  })

  return new Promise(async (resolve) => {
    try {
      const query = await UserModel.findOne({ email });
      if (query) {
        const checkPassword = bcryptCompare(password, query.password);

        if (checkPassword) {
          const token = signToken(
            { id: query._id, type: 'admin_token' }, // Use _id instead of admin_id
            process.env.JWT_SECRET,
            '5d'
          );
          await UserModel.findOneAndUpdate({ _id: query._id }, { token }); // Use _id instead of admin_id
          resolve({
            status: 'success',
            user: { id: query._id, authToken: token, email, username: query.username, role: query.role },
          });
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

module.exports = {
  create,
  fetch,
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
  getByBusiness,
};
