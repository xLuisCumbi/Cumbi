const { checkPendingDeposits } = require('./Deposit');
const cron = require('node-cron');

const start = () => {

    cron.schedule('*/5 * * * *', () => {

        console.log('checkPendingDeposits cron job started');
        checkPendingDeposits();

    });

}
checkPendingDeposits();
module.exports = {
    start
}

