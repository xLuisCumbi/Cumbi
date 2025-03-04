const CoinModel = require('../models/Coin');

const create = (data) => new Promise(async (resolve, reject) => {
  try {
    const query = await CoinModel.create(data);
    resolve({ status: 'success', coin: query });
  } catch (e) {
    console.error('Error during creation:', e);
    reject({ status: 'failed', message: 'server error' });
  }
});

const fetch = () => new Promise(async (resolve) => {
  try {
    const coins = await CoinModel.find().limit(250);
    resolve({ status: 'success', coins });
  } catch (error) {
    console.error('Error while fetching coin:', error);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

/**
 *
 * @param {*} id Id of coin
 * @returns the coin with the id
 */
const fetchByID = (id) => new Promise(async (resolve) => {
  try {
    const coin = await CoinModel.findById(id);
    resolve({ status: 'success', coin });
  } catch (error) {
    console.error('Error while fetching coin:', error);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

const update = (coin) => new Promise(async (resolve) => {
  try {
    await CoinModel.updateOne(
      { _id: coin._id },
      coin,
    ).exec();
    resolve({ status: 'success' });
  } catch (error) {
    console.log('error', error.stack);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

const init = () => new Promise(async (resolve, reject) => {
  try {
    CoinModel.insertMany(
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
  init,
};
