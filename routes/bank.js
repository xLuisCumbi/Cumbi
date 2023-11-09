const express = require('express');

const Router = express.Router();
const Bank = require('../controllers/Bank');
const { sendErrorMsg } = require('../utils');
const { adminAuthMiddleware, sessionAuthMiddleware } = require('../middleware/auth');

Router.post('/create', adminAuthMiddleware, (req, res) => {
  Bank.create(req.body).then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

Router.get('', sessionAuthMiddleware, (req, res) => {
  Bank.fetch().then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

// Router.get("/init", (req, res) => {
//     Bank.init().then(
//         (resp) => {
//             res.json(resp);
//         },
//         (err) => {
//             sendErrorMsg(res, err);
//         }
//     );
// });

Router.get('/:id', sessionAuthMiddleware, (req, res) => {
  Bank.fetchByID(req.params.id).then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

Router.put('/:id', adminAuthMiddleware, (req, res) => {
  Bank.update(req.body).then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

/**
 * Handles requests to nonexistent admin routes.
 * Returns a 404 response.
 */
Router.use('**', (req, res) => {
  res.status(404).json({ status: 'failed', message: '404 not found' });
});

module.exports = Router;
