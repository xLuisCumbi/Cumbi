const { checkPendingDeposits } = require('./Deposit');
const cron = require('node-cron');

const start = () => {

    console.log('deposit detection job successfully started');
    cron.schedule('*/5 * * * *', () => {

        checkPendingDeposits();

    });
}

module.exports = {
    start
}