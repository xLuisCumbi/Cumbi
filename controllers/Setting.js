// Import required modules
const SettingModel = require('../models/Setting');
const mongoose = require('mongoose');
const { signToken, bcryptCompare, verifyToken, genHash } = require('../utils');

/**
 * Update or create a setting document in the database.
 *
 * @param {Object} settingData - The data to update or create the setting document.
 * @returns {Promise<Object>} A Promise that resolves to an object indicating the status of the update or create operation.
 * @throws {Object} An object indicating the failure status and error message if the operation fails.
 */
const update = (settingData) => {
    return new Promise(async (resolve, reject) => {
        try {
            // If _id is provided in settingData, update the existing document, otherwise create a new one
            if (settingData._id) {
                await SettingModel.findOneAndUpdate({ _id: settingData._id }, settingData);
            } else {
                await SettingModel.create(settingData);
            }
            resolve({ status: 'success' });
        } catch (e) {
            console.error('Error during update:', e);
            reject({ status: 'failed', message: 'server error' });
        }
    });
};

/**
 * Fetch the latest setting document from the database.
 *
 * @returns {Promise<Object>} A Promise that resolves to an object containing the status and the fetched setting data.
 * @throws {Object} An object indicating the failure status and error message if the operation fails.
 */
const fetchOne = () => {
    return new Promise(async (resolve) => {
        try {
            // Find the latest setting document using the sort method
            const setting = await SettingModel.findOne({}).sort({ id: -1 });
            if (setting) {
                resolve({
                    status: 'success',
                    setting,
                });
            }
        } catch (e) {
            console.error('Error during fetch:', e);
            resolve({ status: 'failed', message: 'server error' });
        }
    });
};

/**
 * Update the passphrase in the setting document for users with the role 'superadmin'.
 *
 * @param {string} passphrase - The new passphrase to update.
 * @param {string} userRole - The role of the user initiating the update.
 * @returns {Promise<Object>} A Promise that resolves to an object indicating the status of the update operation.
 * @throws {Object} An object indicating the failure status and error message if the operation fails.
 */
const updateMnemonic = (passphrase, userRole) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Only 'superadmin' users are allowed to update the passphrase
            if (userRole !== 'superadmin') {
                return reject({ status: 'failed', message: 'Only super admins can update mnemonic' });
            }

            // Sign the mnemonic token if passphrase is provided
            if (passphrase) {
                const mnemonicToken = signToken(
                    { mnemonic: passphrase, type: 'mnemonic-token' },
                    process.env.MNEMONIC_JWT_SECRET,
                    '100y'
                );
                // Update the passphrase in the setting document
                await SettingModel.findOneAndUpdate({}, { passphrase: mnemonicToken });
            } else {
                // No passphrase provided, reject with an appropriate message
                return reject({ status: 'failed', message: 'Passphrase is required' });
            }

            resolve({ status: 'success' });
        } catch (e) {
            console.error('Error during updating mnemonic:', e);
            reject({ status: 'failed', message: 'Server error' });
        }
    });
};

// Export the functions
module.exports = {
    update,
    fetchOne,
    updateMnemonic,
};
