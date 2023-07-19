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


Router.post('/create-invoice', adminAuthMiddleware, (req, res) => {

    Admin.createInvoice(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});

Router.post('/update', adminAuthMiddleware, (req, res) => {

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

    Admin.adminStats(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});

Router.post('/create-token', adminAuthMiddleware, (req, res) => {

    Admin.createToken(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});


Router.post('/fetch-tokens', adminAuthMiddleware, (req, res) => {

    Admin.fetchTokens(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});


Router.post('/delete-token', adminAuthMiddleware, (req, res) => {

    Admin.deleteToken(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});



Router.use('**', (req, res)=>{
    res.status(404).json({staus: "failed", messsage: "404 not found"});
});

module.exports = Router;