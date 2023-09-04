const express = require("express");
const Router = express.Router();
const Business = require("../controllers/Business");
const { sendErrorMsg } = require("../utils");
const { adminAuthMiddleware } = require("../middleware/auth");



Router.post("/create", (req, res) => {
    Business.create(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});


Router.get("", (req, res) => {
    Business.fetch().then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * TODO obtener de un api y revisar donde hacer el llamado
 */
Router.get("/trm", (req, res) => {

    // const API_KEY_TRM = "8f90c2331c91553053ceb36af0c3ca1e"
    // const endpoint = `http://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY_TRM}&symbols=USD,COP`
    // fetch(endpoint)
    //     .then(response => response.json())
    //     .then(data => {
    //         const { USD, COP } = data.rates;
    //         console.log(`1 USD = ${COP / USD} COP`);
    //         return res.status(200).json({ status: "success", value: (COP / USD).toFixed(2) })

    //     })
    //     .catch(error => console.error(error));


    res.status(200).json({ status: "success", value: 3955.23 });
});


Router.post("/update-setting", adminAuthMiddleware, (req, res) => {

    Setting.update(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.get("/fetch-setting", adminAuthMiddleware, (req, res) => {

    Setting.fetchOne().then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Handles admin login requests.
 * If successful, returns a response containing the admin's information and a JWT token.
 */
Router.post("/login", (req, res) => {
    User.login(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Handles user signup requests.
 * If successful, returns a response containing the user's information.
 */
Router.post("/signup", (req, res) => {
    User.signUp(req.body).then(
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
    User.fetchDeposits(req.body).then(
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
    User.createInvoice(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            console.log('err route create invoice', err);
            sendErrorMsg(res, err);
        }
    );
});

/**
 * Updates admin information.
 * Returns a response containing the updated admin data.
 */
Router.post("/update", adminAuthMiddleware, (req, res) => {
    User.update(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.post("/consolidate-payment", adminAuthMiddleware, (req, res) => {
    User.consolidatePayment(req.body).then(
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
    User.validateToken(req.body.token).then(
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
    User.adminStats(req.body).then(
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
    User.createToken(req.body).then(
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
    User.fetchTokens(req.body).then(
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
    User.deleteToken(req.body).then(
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
