const express = require('express');
const Router = express.Router();
const Admin = require('../controllers/Admin');
const { sendErrorMsg } = require('../utils');
const {  adminAuthMiddleware } = require('../middleware/auth');

Router.post('/login', (req, res) => {

    Admin.login(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});


Router.post('/fetch-deposits', adminAuthMiddleware, (req, res) => {

    Admin.fetchDeposits(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});

Router.post('/update-admin', adminAuthMiddleware, (req, res) => {

    Admin.update(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});

Router.post('/auth-token', adminAuthMiddleware, (req, res) => {

    Admin.validateToken(req.body.token).then((resp) => {
        delete resp['admin_id'];
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});

Router.post('/stats', adminAuthMiddleware, (req, res) => {

    Admin.adminStats(req.body.token).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});


Router.use('**', (req, res)=>{
    res.status(404).json({staus: "failed", messsage: "404 not found"});
});

module.exports = Router;