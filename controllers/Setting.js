const SettingModel = require('../models/Setting');
const mongoose = require('mongoose');


const update = (settingData) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(settingData)
            if (settingData._id)
                await SettingModel.findOneAndUpdate({ _id: settingData._id }, settingData)
            else
                await SettingModel.create(settingData)
            resolve({ status: 'success' });
        } catch (e) {
            console.error('Error during login:', e);
            reject({ status: 'failed', message: 'server error' });
        }
    });
};

const fetchOne = () => {
    return new Promise(async (resolve) => {
        try {
            const setting = await SettingModel.findOne({}).sort({ id: -1 })
            if (setting)
                resolve({
                    status: 'success',
                    setting,
                });
        } catch (e) {
            console.error('Error during login:', e);
            resolve({ status: 'auth_failed', message: 'server error' });
        }
        // const id = req.params.id_user;

    })
}

module.exports = {
    update,
    fetchOne
};