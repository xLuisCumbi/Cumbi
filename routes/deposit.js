const express = require("express");
const Router = express.Router();
const Deposit = require("../controllers/Deposit");
const { sendErrorMsg } = require("../utils");
const {
    apiAuthMiddleware,
    adminAuthMiddleware,    
    sessionAuthMiddleware,
    sessionAuthDepositMiddleware,
} = require("../middleware/auth");

Router.post("/create", apiAuthMiddleware, (req, res) => {
    Deposit.create(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.post("/create-app", sessionAuthMiddleware, (req, res) => {
    Deposit.create(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.post("/status",  (req, res) => {
    Deposit.status(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.post("/set-network", sessionAuthDepositMiddleware, (req, res) => {
    Deposit.setNetwork(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.post("/consolidate-payment", adminAuthMiddleware, (req, res) => {
    Deposit.consolidatePayment(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.use("**", (req, res) => {
    res.status(404).json({ status: "failed", messsage: "404 not found" });
});

module.exports = Router;
