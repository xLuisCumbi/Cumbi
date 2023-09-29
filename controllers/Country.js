
const CountryModel = require('../models/Country');

const create = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = await CountryModel.create(data);
      resolve({ status: 'success', country: query });
    } catch (e) {
      console.error('Error during creation:', e);
      reject({ status: 'failed', message: 'server error' });
    }
  });
};

const fetch = () => {
  return new Promise(async (resolve) => {
    try {
      const countries = await CountryModel.find().limit(250)
      resolve({ status: 'success', countries });
    } catch (error) {
      console.error('Error while fetching country:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

/**
 * 
 * @param {*} id Id of country
 * @returns the country with the id
 */
const fetchByID = (id) => {
  return new Promise(async (resolve) => {
    try {
      const country = await CountryModel.findById(id)
      resolve({ status: 'success', country });
    } catch (error) {
      console.error('Error while fetching country:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

const update = (country) => {
  return new Promise(async (resolve) => {
    try {
      await CountryModel.updateOne(
        { _id: country._id },
        country
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
