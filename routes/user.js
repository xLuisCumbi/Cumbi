const express = require("express");
const Router = express.Router();
const User = require("../controllers/User");
const Setting = require("../controllers/Setting");
const { sendErrorMsg } = require("../utils");
const { adminAuthMiddleware, sessionAuthMiddleware } = require("../middleware/auth");


/**
 * Get all users
 */
Router.get("", sessionAuthMiddleware, (req, res) => {
    User.fetch().then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.get("/:id", sessionAuthMiddleware, (req, res) => {
    User.fetchByID(req.params.id).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.delete("/:id",sessionAuthMiddleware, (req, res) => {
    User.deleteById(req.params.id).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * TODO revisar como hacerlo con GET
 */
Router.post("/business",sessionAuthMiddleware, (req, res) => {
    User.getByBusiness(req.body).then(
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
Router.post("/signup", adminAuthMiddleware, (req, res) => {
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
Router.delete("/token/:id", adminAuthMiddleware, (req, res) => {
    console.log(req.params.id)
    User.deleteToken(req.params.id, req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

/**
 * This is a route handler for a PUT request with a dynamic parameter 'id'.
 * It uses the 'sessionAuthMiddleware' middleware to check user authentication.
 */
Router.put("/:id", sessionAuthMiddleware, (req, res) => {
    User.updateUser(req.body).then(
        (resp) => {
            res.json(resp);
        },
        (err) => {
            sendErrorMsg(res, err);
        }
    );
});

Router.put("/block/:id", sessionAuthMiddleware, (req, res) => {
    console.log(req.body)
    User.updateUserStatus(req.params.id, req.body).then(
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
