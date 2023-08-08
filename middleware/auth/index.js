const jwt = require("jsonwebtoken");
const ApiTokenModel = require("../../models/ApiToken");
const User = require('../../models/User'); // adjust the path to match your project structure

const apiAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ status: "auth_failed", message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            status: "auth_failed",
            message: "Authentication API KEY missing",
        });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.API_JWT_SECRET);
        if (decodedToken.type === "api_token") {
            ApiTokenModel.findOne({ token }).then(
                (tokenObj) => {
                    if (tokenObj) {
                        next();
                    } else {
                        return res.status(401).json({
                            status: "auth_failed",
                            message: "Authentication Failed: Invalid API KEY",
                        });
                    }
                },
                (err) => {
                    return res.status(401).json({
                        status: "auth_failed",
                        message: "Authentication Failed: Invalid API KEY",
                    });
                }
            );
        } else {
            return res.status(401).json({
                status: "auth_failed",
                message: "Authentication Failed: Invalid API KEY",
            });
        }
    } catch (error) {
        return res
            .status(401)
            .json({ status: "auth_failed", message: "Authentication failed" });
    }
};
const adminAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ status: "auth_failed", message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            status: "auth_failed",
            message: "Authentication API KEY missing (token)",
        });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // If it's a business_token or admin_token, fetch the user and attach it to the request
        if (decodedToken.type === "business_token" || decodedToken.type === "admin_token") {
            req.body.token = token;

            // Fetch the user from the database and attach it to the request object
            User.findOne({ _id: decodedToken.id })
                .then(user => {
                    if (!user) {
                        return res.status(401).json({
                            status: "auth_failed",
                            message: "Authentication Failed: User not found",
                        });
                    }

                    req.user = user;
                    next();
                })
                .catch(err => {
                    // Handle error
                    console.error(err);
                    res.status(500).json({ status: "error", message: "Internal server error" });
                });
        } else {
            return res.status(401).json({
                status: "auth_failed",
                message: "Authentication Failed: Invalid API KEY (no admin_token or business_token in middleware)",
            });
        }
    } catch (error) {
        console.log('admin middleware error', error);
        console.log('error.stack', error.stack);
        return res
            .status(401)
            .json({ status: "auth_failed", message: "Authentication failed - triggered an error" });
    }
};

const sessionAuthMiddleware = (req, res, next) => {
    console.log(
        "back sessionAuthMiddleware req.headers.authorization",
        req.headers.authorization
    );

    if (req.headers.authorization) {
        return apiAuthMiddleware(req, res, next);
    } else {
        if (req.session.token && req.session.deposit_id) {
            jwt.verify(
                req.session.token,
                process.env.SESSION_SECRET,
                (err, decoded) => {
                    if (err) {
                        return res.status(401).json({
                            status: "auth_failed",
                            message: "Authentication Failed: Invalid API KEY",
                        });
                    } else {
                        if (req.session.deposit_id === decoded.deposit_id) {
                            next();
                        } else {
                            return res.status(401).json({
                                status: "auth_failed",
                                message: "Authentication Failed: Invalid API KEY",
                            });
                        }
                    }
                }
            );
        } else {
            return res.status(401).json({
                status: "auth_failed",
                message: "Authentication Failed: Invalid API KEY",
            });
        }
    }
};

module.exports = {
    apiAuthMiddleware,
    adminAuthMiddleware,
    sessionAuthMiddleware,
};
