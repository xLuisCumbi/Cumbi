const express = require("express");
const Router = express.Router();
const Setting = require("../controllers/Setting");
const { sendErrorMsg } = require("../utils");
const {
    apiAuthMiddleware,
    adminAuthMiddleware,
    sessionAuthMiddleware,
} = require("../middleware/auth");

Router.get("", adminAuthMiddleware, (req, res) => {
    Setting.fetchOne().then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.post("/update", adminAuthMiddleware, (req, res) => {
    Setting.update(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});


Router.post("/update-mnemonic", adminAuthMiddleware, (req, res) => {
    const { passphrase } = req.body;
    const userRole = req.user.role; // Assuming the user role is available in req.user

    Setting.updateMnemonic(passphrase, userRole).then(
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
