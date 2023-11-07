const bcrypt = require('bcryptjs');
const DepositModel = require('../models/Deposit');
const BusinessModel = require('../models/Business');
const {
  signToken, bcryptCompare, verifyToken, genHash,
} = require('../utils');
// const { create, updateDepositObj } = require('./Deposit');
const ApiTokenModel = require('../models/ApiToken');
const consolidateAddressBalance = require('./Consolidation');
const { ObjectId } = require('mongoose').Types;

const create = (businessData) => new Promise(async (resolve, reject) => {
  try {
    const business = await BusinessModel.create(businessData);
    resolve({ status: 'success', business });
  } catch (e) {
    console.error('Error during login:', e);
    reject({ status: 'failed', message: 'server error' });
  }
});

/**
 *
 * @returns All business
 */
const fetch = () => new Promise(async (resolve) => {
  try {
    const businesses = await BusinessModel.find().limit(250);
    resolve({ status: 'success', businesses });
  } catch (error) {
    console.error('Error while fetching business:', error);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

/**
 *
 * @param {*} id Id of business
 * @returns the business with the id
 */
const fetchByID = (id) => new Promise(async (resolve) => {
  try {
    const business = await BusinessModel.findById(id);
    resolve({ status: 'success', business });
  } catch (error) {
    console.error('Error while fetching business:', error);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

// TODO posiblemente ya no sea necesario
const fetchPerson = () => new Promise(async (resolve) => {
  try {
    const person = await BusinessModel.findOne({ name: 'Person' });
    resolve({ status: 'success', person });
  } catch (error) {
    console.error('Error while fetching business:', error);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

const update = (business) => new Promise(async (resolve) => {
  try {
    await BusinessModel.updateOne(
      { _id: business._id },
      business,
    ).exec();
    resolve({ status: 'success' });
  } catch (error) {
    console.log('error', error.stack);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

module.exports = {
  create,
  fetch,
  fetchByID,
  fetchPerson,
  update,
};
