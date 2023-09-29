const express = require("express");
const Router = express.Router();
const Coin = require("../controllers/Coin");
const { sendErrorMsg } = require("../utils");
const { adminAuthMiddleware, sessionAuthMiddleware } = require("../middleware/auth");



Router.post("/create", adminAuthMiddleware, (req, res) => {
    Coin.create(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});


Router.get("", sessionAuthMiddleware, (req, res) => {
    Coin.fetch().then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.get("/:id",sessionAuthMiddleware, (req, res) => {
    Coin.fetchByID(req.params.id).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.put("/:id", adminAuthMiddleware, (req, res) => {
    Coin.update(req.body).then(
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
