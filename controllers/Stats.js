/**
 * This file is a module that exports a function for updating admin stats.
 * It updates the number of successful deposits, total paid, and the balances
 * of different coins on different networks.
 */
const UserModel = require("../models/User");
const DepositModel = require("../models/Deposit");
const bal = require('./Balance');
const getDepositAddress = require('./Address');

/**
 * Updates the admin stats.
 * The stats include the number of successful deposits, total paid, and the balances of different coins on different networks.
 * The stats are stored in the database.
 */
const updateAdminStats = async () => {
    try {
    const successful_deposit = await DepositModel.countDocuments({ status: 'success' });
    let total_paid = await DepositModel.aggregate([
        {
            $match: {
                status: 'success'
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: '$amount'
                }
            }
        }
    ]);

    total_paid = total_paid.length > 0 ? Number(total_paid[0].total.toFixed(6)) : 0;
    const eth_address = await getDepositAddress('ETHEREUM', 'USDT', 0);
    const trx_address = await getDepositAddress('TRON', 'USDT', 0);
    const eth_usdt_balance = await bal.getErc20UsdtBalance(eth_address.address, eth_address.privateKey);
    const eth_usdc_balance = await bal.getErc20UsdcBalance(eth_address.address, eth_address.privateKey);
    const trx_usdt_balance = await bal.getTrc20UsdtBalance(trx_address.address, trx_address.privateKey);
    const trx_usdc_balance = await bal.getTrc20UsdcBalance(trx_address.address, trx_address.privateKey);

    const eth_balance = await bal.getEthBalance(eth_address.address);
    const trx_balance = await bal.getTrxBalance(trx_address.address, trx_address.privateKey);

    const stats = JSON.stringify({
        eth_balance: {
            value: eth_balance,
        },
        trx_balance: {
            value: trx_balance
        },
        eth_usdt_balance: {
            value: eth_usdt_balance
        },
        trx_usdt_balance: {
            value: trx_usdt_balance
        },
        eth_usdc_balance: {
            value: eth_usdc_balance
        },
        trx_usdc_balance: {
            value: trx_usdc_balance
        },
        successful_deposits: {
            value: successful_deposit
        },
        total_paid: {
            value: total_paid
        }
    });

    const admin = await UserModel.findOne({}).exec();
    const last_stats_update = new Date();

    UserModel.updateOne({ _id : admin._id }, { $set: { stats: stats, last_stats_update: last_stats_update }}).exec();
    } catch (error) {
        console.log(error);
    }
}

module.exports = { updateAdminStats }
