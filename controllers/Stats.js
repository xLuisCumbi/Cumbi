const AdminModel = require("../models/Admin");
const DepositModel = require("../models/Deposit");
const bal = require('./Balance');
const getDepositAddress = require('./Address');

const updateAdminStats = async () => {

    console.log('Updating admin stats in process');
    const successful_deposit = await DepositModel.count({ where: { status: 'success' } });
    const total_paid = Number(await DepositModel.sum('amount', { where: { status: 'success' }, raw: true }) ?? 0).toFixed(6);
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

    const admin = await AdminModel.findOne();
    const last_stats_update = new Date();

    AdminModel.update({ stats, last_stats_update }, { where: { admin_id: admin.admin_id } });

}


module.exports = { updateAdminStats }