const express = require('express');

const Router = express.Router();
const Setting = require('../controllers/Setting');
const { sendErrorMsg } = require('../utils');
const { adminAuthMiddleware } = require('../middleware/auth');

Router.get('', adminAuthMiddleware, (req, res) => {
  Setting.fetchOne().then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

/**
 */
Router.get('/trm', adminAuthMiddleware, (req, res) => {
  const API_KEY_TRM = '8f90c2331c91553053ceb36af0c3ca1e';
  const endpoint = `http://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY_TRM}&symbols=USD,COP`;
  fetch(endpoint)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const { USD, COP } = data.rates;
      console.log(`1 USD = ${COP / USD} COP`);
      return res.status(200).json({ status: 'success', trm: (COP / USD).toFixed(2), date: data.timestamp });
    })
    .catch((error) => console.error(error));

  // res.status(200).json({ status: "success", trm: 3955.23 });
});

Router.post('/update', adminAuthMiddleware, (req, res) => {
  Setting.update(req.body).then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

Router.post('/update-mnemonic', adminAuthMiddleware, (req, res) => {
  const { passphrase } = req.body;
  const userRole = req.user.role; // Assuming the user role is available in req.user

// Router.post("/update-mnemonic", adminAuthMiddleware, (req, res) => {
//     const { passphrase } = req.body;
//     const userRole = req.user.role; // Assuming the user role is available in req.user

//     Setting.updateMnemonic(passphrase, userRole).then(
//         (resp) => {
//             res.json(resp);
//         },
//         (err) => {
//             sendErrorMsg(res, err);
//         }
//     );
// });

Router.use('**', (req, res) => {
  res.status(404).json({ status: 'failed', messsage: '404 not found' });
});

module.exports = Router;
