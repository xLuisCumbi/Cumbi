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

const fetchByID = (id) => {
  return new Promise(async (resolve) => {
    try {
      const business = await BusinessModel.findById(id)
      resolve({ status: 'success', business });
    } catch (error) {
      console.error('Error while fetching business:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

// TODO posiblemente ya no sea necesario
const fetchPerson = () => {
  return new Promise(async (resolve) => {
    try {
      const person = await BusinessModel.findOne({ name: 'Person' })
      resolve({ status: 'success', person });
    } catch (error) {
      console.error('Error while fetching business:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

module.exports = {
  create,
  fetch,
  fetchByID,
  fetchPerson,
};
