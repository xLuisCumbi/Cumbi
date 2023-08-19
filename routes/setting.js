const express = require("express");
const Router = express.Router();
const Setting = require("../controllers/Setting");
const { sendErrorMsg } = require("../utils");
const {
    apiAuthMiddleware,
    sessionAuthMiddleware,
} = require("../middleware/auth");

Router.post("/update-setting", apiAuthMiddleware, (req, res) => {

    Setting.update(req.body).then(
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
