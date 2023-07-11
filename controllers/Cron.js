const { checkPendingDeposits } = require('./Deposit');
const cron = require('node-cron');

const start = () => {

    cron.schedule('*/5 * * * *', () => {

        console.log('deposit detection cron job started')
        checkPendingDeposits();

    });

}

module.exports = {
    start
}

