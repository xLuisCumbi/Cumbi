const BankModel = require('../models/Bank');

const create = (data) => {
  console.log(data);
  return new Promise(async (resolve, reject) => {
    try {
      const query = await BankModel.create(data);
      resolve({ status: 'success', bank: query });
    } catch (e) {
      console.error('Error during creation:', e);
      reject({ status: 'failed', message: 'server error' });
    }
  });
};

const fetch = () => new Promise(async (resolve) => {
  try {
    const banks = await BankModel.find().populate('country').sort({ name: 'asc' }).limit(250);
    resolve({ status: 'success', banks });
  } catch (error) {
    console.error('Error while fetching bank:', error);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

/**
 *
 * @param {*} id Id of bank
 * @returns the bank with the id
 */
const fetchByID = (id) => new Promise(async (resolve) => {
  try {
    const bank = await BankModel.findById(id);
    resolve({ status: 'success', bank });
  } catch (error) {
    console.error('Error while fetching bank:', error);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

const update = (bank) => new Promise(async (resolve) => {
  try {
    await BankModel.updateOne(
      { _id: bank._id },
      bank,
    ).exec();
    resolve({ status: 'success' });
  } catch (error) {
    console.log('error', error.stack);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

const init = () => new Promise(async (resolve, reject) => {
  try {
    BankModel.insertMany(
      [
        { name: 'USDT', abbr: 'USDT' },
        { name: 'USDC', abbr: 'USDC' },
      ],
    );
    resolve({ status: 'success' });
  } catch (e) {
    console.error('Error during creation:', e);
    reject({ status: 'failed', message: 'server error' });
  }
});

module.exports = {
  create,
  fetch,
  fetchByID,
  update,
  // init
};
