const express = require("express");
const Router = express.Router();
const Country = require("../controllers/Country");
const { sendErrorMsg } = require("../utils");
const { adminAuthMiddleware, sessionAuthMiddleware } = require("../middleware/auth");



Router.post("/create", adminAuthMiddleware, (req, res) => {
    Country.create(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.get("", (req, res) => {
    Country.fetch().then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.get("/init", (req, res) => {
    Country.init().then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.get("/:id",sessionAuthMiddleware, (req, res) => {
    Country.fetchByID(req.params.id).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.put("/:id", adminAuthMiddleware, (req, res) => {
    Country.update(req.body).then(
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
