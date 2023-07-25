const { checkPendingDeposits } = require('./Deposit');
const { updateAdminStats } = require("./Stats");
const cron = require('node-cron');

const start = () => {

    cron.schedule('*/5 * * * *', () => {

        runCronJobs();

    });
}

function runCronJobs() {

    console.log('Cron Job Fired');
    checkPendingDeposits();
    updateAdminStats();

}


runCronJobs();

module.exports = {
    start
}