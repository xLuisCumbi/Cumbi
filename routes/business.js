const express = require('express');

const Router = express.Router();
const Business = require('../controllers/Business');
const { sendErrorMsg } = require('../utils');
const { adminAuthMiddleware } = require('../middleware/auth');

Router.post('/create', (req, res) => {
  Business.create(req.body).then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

Router.get('', adminAuthMiddleware, (req, res) => {
  Business.fetch().then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

Router.get('/:id', (req, res) => {
  Business.fetchByID(req.params.id).then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

/**
 * Get the business for people (Persona Natural)
 */
Router.get('/person', (req, res) => {
  Business.fetchPerson().then(
    (resp) => {
      res.json(resp);
    },
    (err) => {
      sendErrorMsg(res, err);
    },
  );
});

Router.put('/:id', adminAuthMiddleware, (req, res) => {
  Business.update(req.body).then(
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
