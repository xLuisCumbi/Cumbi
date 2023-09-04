/**
 * This file is a module that exports a function called start. It sets up cron jobs that run every 5 minutes to perform certain tasks.
 */
const { checkPendingDeposits } = require("./Deposit");
const { updateAdminStats } = require("./Stats");
const cron = require("node-cron");

/**
 * Starts the cron jobs.
 * The cron jobs run every 5 minutes and call the runCronJobs function.
 */
const start = () => {
    cron.schedule("*/2 * * * *", () => {
    //cron.schedule("0 0 * * *", () => {
        runCronJobs();
    });
};

/**
 * Runs the cron jobs.
 * The cron jobs check for pending deposits and update admin stats.
 */
function runCronJobs() {

    console.log("Cron Job Fired");
    checkPendingDeposits();
    updateAdminStats();
}

runCronJobs();

module.exports = {
    start,
};
