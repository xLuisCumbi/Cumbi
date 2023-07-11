const { checkPendingDeposits } = require('./Deposit');
const cron = require('node-cron');

const start = () => {

    console.log('deposit detection job successfully started');
    cron.schedule('*/2 * * * *', () => {

        checkPendingDeposits();

    });

}

module.exports = {
    start
}

