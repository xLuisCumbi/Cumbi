/**
 * This file is a module that exports a function called start. It sets up cron jobs that run every 5 minutes to perform certain tasks.
 */
const cron = require('node-cron');
const { checkPendingDeposits } = require('./Deposit');
const { updateAdminStats } = require('./Stats');

/**
 * Starts the cron jobs.
 * The cron jobs run every 5 minutes and call the runCronJobs function.
 */
const start = () => {
  cron.schedule('*/1 * * * *', () => {
    runCronJobs();
  });
};

const stop = () => {
  console.log('Cron Job Stoped');
  cron.stop();
};

/**
 * Runs the cron jobs.
 * The cron jobs check for pending deposits and update admin stats.
 */
function runCronJobs() {
  console.log('Cron Job Fired');
  if (!checkPendingDeposits()) stop();
  updateAdminStats();
}

// runCronJobs();

module.exports = {
  // start,
  // stop
};
