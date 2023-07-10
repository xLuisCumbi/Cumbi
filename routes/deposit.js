const express = require('express');
const Router = express.Router();
const Deposit = require('../controllers/Deposit');
const { sendErrorMsg } = require('../utils');
const {  apiAuthMiddleware } = require('../middleware/auth');

Router.post('/create', apiAuthMiddleware , (req, res) => {

    Deposit.create(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});


Router.post('/status', apiAuthMiddleware, (req, res) => {

    Deposit.status(req.body).then((resp) => {
        res.json(resp);
    }, err => {
        sendErrorMsg(res, err);
    });

});


Router.use('**', (req, res)=>{
    res.status(404).json({staus: "failed", messsage: "404 not found"});
});

module.exports = Router;