const express = require("express");
const Router = express.Router();
const Deposit = require("../controllers/Deposit");
const { sendErrorMsg } = require("../utils");
const {
    apiAuthMiddleware,
    sessionAuthMiddleware,
} = require("../middleware/auth");

Router.post("/create", apiAuthMiddleware, (req, res) => {

    console.log('req.user', req.user);
    const depositData = {
        ...req.body,
        user: req.user._id, // add the user's ID to the deposit data
    };
    Deposit.create(depositData).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.post("/status", sessionAuthMiddleware, (req, res) => {
    Deposit.status(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.post("/set-network", sessionAuthMiddleware, (req, res) => {
    Deposit.setNetwork(req.body).then(
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
