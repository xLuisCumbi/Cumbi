const { checkPendingDeposits } = require('./Deposit');
const cron = require('node-cron');

const start = () => {

    cron.schedule('*/3 * * * *', () => {

        console.log('deposit detection cron job started')
       // checkPendingDeposits();

    });

}
checkPendingDeposits();
module.exports = {
    start
}

