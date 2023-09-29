const express = require("express");
const Router = express.Router();
const BankAccount = require("../controllers/BankAccount");
const { sendErrorMsg } = require("../utils");
const { adminAuthMiddleware, sessionAuthMiddleware } = require("../middleware/auth");



Router.post("/create", adminAuthMiddleware, (req, res) => {
    BankAccount.create(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});


Router.get("", sessionAuthMiddleware, (req, res) => {
    BankAccount.fetch().then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.get("/:id",sessionAuthMiddleware, (req, res) => {
    BankAccount.fetchByID(req.params.id).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.put("/:id", adminAuthMiddleware, (req, res) => {
    BankAccount.update(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Handles requests to nonexistent admin routes.
 * Returns a 404 response.
 */
Router.use("**", (req, res) => {
    res.status(404).json({ status: "failed", message: "404 not found" });
});

module.exports = Router;
