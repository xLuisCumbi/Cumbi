const BankAccountModel = require('../models/BankAccount');

const create = (data) => new Promise(async (resolve, reject) => {
  try {
    const bankAccount = await BankAccountModel.create(data);
    if (bankAccount.active) updateActiveAll(bankAccount._id, data.user);
    resolve({ status: 'success', bankAccount });
  } catch (e) {
    console.error('Error during creation:', e);
    reject({ status: 'failed', message: 'server error' });
  }
});

/**
 *
 * @returns Bank Account list of user, if the user is superadmin return all
 */
const fetch = (user) => {
  const { _id, business, role } = user;
  return new Promise(async (resolve) => {
    try {
      // let query = {}
      // if (role === "person" || role === "admin")
      //   query = { "user": _id }
      if (role === 'business') resolve({ status: 'failed', message: 'Don\'t have access' });

      const bankAccounts = await BankAccountModel.find({ user: _id })
        .populate('bank').sort({ name: 'asc' })
        .limit(250);
      resolve({ status: 'success', bankAccounts });
    } catch (error) {
      console.error('Error while fetching bankAccount:', error);
      resolve({ status: 'failed', message: 'server error: kindly try again' });
    }
  });
};

/**
 * Get the active bank of the user
 */
const fetchActive = (user) => {
  const { _id } = user;
  return new Promise(async (resolve) => {
    try {
      const bankAccount = await BankAccountModel.findOne({ user: _id, active: true })
        .populate('bank');
      resolve({ status: 'success', bankAccount });
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
const fetchByID = (id) => new Promise(async (resolve) => {
  try {
    const bankAccount = await BankAccountModel.findById(id);
    resolve({ status: 'success', bankAccount });
  } catch (error) {
    console.error('Error while fetching Bank Account:', error);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

const update = (bankAccount) => new Promise(async (resolve) => {
  try {
    await BankAccountModel.updateOne(
      { _id: bankAccount._id },
      bankAccount,
    ).exec();

    console.log('bankAccount', bankAccount);
    if (bankAccount.active) updateActiveAll(bankAccount._id, bankAccount.user);

    resolve({ status: 'success' });
  } catch (error) {
    console.log('error', error.stack);
    resolve({ status: 'failed', message: 'server error: kindly try again' });
  }
});

const updateActiveAll = async (bankAccount_id, user_id) => {
  try {
    await BankAccountModel.updateMany(
      { _id: { $ne: bankAccount_id }, user: user_id },
      { $set: { active: false } },
    ).exec();
  } catch (error) {
    console.log('error', error.stack);
  }
};

module.exports = {
  create,
  fetch,
  fetchActive,
  fetchByID,
  update,
};
