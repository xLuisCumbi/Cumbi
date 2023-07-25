const jwt = require("jsonwebtoken");
const ApiTokenModel = require("../../models/ApiToken");

//ApiTokenModel.sync({ alter: true });

const apiAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ status: "auth_failed", message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({
                status: "auth_failed",
                message: "Authentication API KEY missing",
            });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.API_JWT_SECRET);
        if (decodedToken.type === "api_token") {
            ApiTokenModel.findOne({ where: { token } }).then(
                (tokenObj) => {
                    if (tokenObj) {
                        next();
                    } else {
                        return res
                            .status(401)
                            .json({
                                status: "auth_failed",
                                message: "Authentication Failed: Invalid API KEY",
                            });
                    }
                },
                (err) => {
                    return res
                        .status(401)
                        .json({
                            status: "auth_failed",
                            message: "Authentication Failed: Invalid API KEY",
                        });
                }
            );
        } else {
            return res
                .status(401)
                .json({
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
        return res
            .status(401)
            .json({
                status: "auth_failed",
                message: "Authentication API KEY missing",
            });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (decodedToken.type === "admin_token") {
            req.body.token = token;
            next();
        } else {
            return res
                .status(401)
                .json({
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

const sessionAuthMiddleware = (req, res, next) => {
    if (req.headers.authorization) {
        return apiAuthMiddleware(req, res, next);
    } else {
        if (req.session.token && req.session.deposit_id) {
            jwt.verify(
                req.session.token,
                process.env.SESSION_SECRET,
                (err, decoded) => {
                    if (err) {
                        return res
                            .status(401)
                            .json({
                                status: "auth_failed",
                                message: "Authentication Failed: Invalid API KEY",
                            });
                    } else {
                        if (req.session.deposit_id === decoded.deposit_id) {
                            next();
                        } else {
                            return res
                                .status(401)
                                .json({
                                    status: "auth_failed",
                                    message: "Authentication Failed: Invalid API KEY",
                                });
                        }
                    }
                }
            );
        } else {
            return res
                .status(401)
                .json({
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
