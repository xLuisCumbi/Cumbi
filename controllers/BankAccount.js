const BankAccountModel = require('../models/Bank');

const create = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = await BankAccountModel.create(data);
      resolve({ status: 'success', bankAccount: query });
    } catch (e) {
      console.error('Error during creation:', e);
      reject({ status: 'failed', message: 'server error' });
    }
  });
};

const fetch = () => {
  return new Promise(async (resolve) => {
    try {
      const bankAccountAccounts = await BankAccountModel.find().limit(250)
      resolve({ status: 'success', bankAccountAccounts });
    } catch (error) {
      console.error('Error while fetching bankAccount:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

/**
 * 
 * @param {*} id Id of bankAccount
 * @returns the bankAccount with the id
 */
const fetchByID = (id) => {
  return new Promise(async (resolve) => {
    try {
      const bankAccount = await BankAccountModel.findById(id)
      resolve({ status: 'success', bankAccount });
    } catch (error) {
      console.error('Error while fetching Bank Account:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

const update = (bankAccount) => {
  return new Promise(async (resolve) => {
    try {
      await BankAccountModel.updateOne(
        { _id: bankAccount._id },
        bankAccount
      ).exec();
      resolve({ status: 'success' });
    } catch (error) {
      console.log('error', error.stack);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

module.exports = {
  create,
  fetch,
  fetchByID,
  update,
};
