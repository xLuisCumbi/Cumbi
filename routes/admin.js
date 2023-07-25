const express = require("express");
const Router = express.Router();
const Admin = require("../controllers/Admin");
const { sendErrorMsg } = require("../utils");
const { adminAuthMiddleware } = require("../middleware/auth");

/**
 * Handles admin login requests.
 * If successful, returns a response containing the admin's information and a JWT token.
 */
Router.post("/login", (req, res) => {
    Admin.login(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Retrieves deposit information for the admin.
 * Returns a response containing the requested deposit data.
 */
Router.post("/fetch-deposits", adminAuthMiddleware, (req, res) => {
    Admin.fetchDeposits(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Handles admin requests to create a new invoice.
 * Returns a response containing the details of the new invoice.
 */
Router.post("/create-invoice", adminAuthMiddleware, (req, res) => {
    Admin.createInvoice(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Updates admin information.
 * Returns a response containing the updated admin data.
 */
Router.post("/update", adminAuthMiddleware, (req, res) => {
    Admin.update(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Validates an admin's JWT token.
 * Returns a response containing the admin's data if the token is valid.
 */
Router.post("/auth-token", adminAuthMiddleware, (req, res) => {
    Admin.validateToken(req.body.token).then(
        (resp) => {
            delete resp["admin_id"];
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Retrieves admin stats.
 * Returns a response containing the admin's statistics.
 */
Router.post("/stats", adminAuthMiddleware, (req, res) => {
    Admin.adminStats(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Handles admin requests to create a new API token.
 * Returns a response containing the details of the new API token.
 */
Router.post("/create-token", adminAuthMiddleware, (req, res) => {
    Admin.createToken(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Retrieves API tokens for the admin.
 * Returns a response containing the requested API token data.
 */
Router.post("/fetch-tokens", adminAuthMiddleware, (req, res) => {
    Admin.fetchTokens(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Handles admin requests to delete an API token.
 * Returns a response containing the result of the deletion operation.
 */
Router.post("/delete-token", adminAuthMiddleware, (req, res) => {
    Admin.deleteToken(req.body).then(
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
    res.status(404).json({ staus: "failed", messsage: "404 not found" });
});

module.exports = Router;
