/**
 * This file is a module that exports a function for handling payment UI requests.
 * It checks the status of a deposit and renders the corresponding view based on the deposit
 * status and the network and coin of the deposit.
 */const { signToken } = require("../utils");
const depositController = require("./Deposit");

/**
 * Handles payment UI requests.
 * Checks the status of a deposit.
 * If the deposit does not exist, a 404 error is returned.
 * If the deposit exists and does not have an address, the 'select-network' view is rendered.
 * If the deposit exists and has an address, the 'pay' view is rendered.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
module.exports = async (req, res) => {
    const deposit_id = req.params.depositID;
    const resp = await depositController.status({ deposit_id });
    if (resp.status != "success") {
        res.status(404).json({ message: "PAYMENT NOT FOUND" });
        return;
    }

    const sessionToken = signToken(
        { deposit_id },
        process.env.SESSION_SECRET,
        "7h"
    );
    req.session.token = sessionToken;
    req.session.deposit_id = deposit_id;
    const depositObj = resp.depositObj;

    if (depositObj.address == null || depositObj.address == "") {
        res.render("select-network", depositObj);
    } else {
        depositObj.icon =
            depositObj.coin === "USDT" ? "/images/usdt.png" : "/images/usdc.png";
        depositObj.network_short =
            depositObj.network === "TRON" ? "TRC20" : "ERC20";
        depositObj.is_invoice = depositObj.type === "invoice" ? true : false;
        //depositObj.amount += 3;
        res.render("pay", depositObj);
    }
};
