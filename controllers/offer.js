/* jshint esnext: true */
'use strict';
let Offer = require('../models/Offer');
let ErrorMessage = require('../models/Error');
let bodyParser        = require('body-parser');             // https://github.com/expressjs/body-parser
let passportConf  = require('../config/passport');

/**
 * Offer Api Controller
 */
module.exports.controller = function (app) {

  /**
   * POST /offer
   * Create an offer
   */
  app.post('/offer', passportConf.isAuthenticated, passportConf.isAdministrator, bodyParser.json(), function(req, res) {

    req.assert('name', 'Specify a name.').notEmpty();
    req.assert('amount', 'Amount cannot be Empty').notEmpty();
    req.assert('maximumRides', 'maximumRides').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
      let err = new ErrorMessage('Validation failure', 400);
      return res.status(400).send(err);
    }

    let offer = new Offer({
      name: req.body.name.trim(),
      amount: +req.body.amount || 0,
      maximumRides: +req.body.maximumRides || 0,
    });

    offer.save((err) => {
      if (err) {
        let error = new ErrorMessage('Error saving to database', 530);
        res.status(530).send(error);
      } else {
        res.status(200).end();
      }
    });

  });

  /**
   * POST /offerUpdate
   * Updates an offer
   */
  app.post('/offerUpdate', passportConf.isAuthenticated, passportConf.isAdministrator, bodyParser.json(), function(req, res) {

    req.assert('_id', 'Id must not be empty').notEmpty();
    req.assert('name', 'Specify a name.').notEmpty();
    req.assert('amount', 'Amount cannot be Empty').notEmpty();
    req.assert('maximumRides', 'maximumRides').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
      let err = new ErrorMessage('Validation failure', 400);
      return res.status(400).send(err);
    }

    let id = req.body._id.trim();
    let data = { 
      name: req.body.name.toString(), 
      amount: +req.body.amount, 
      maximumRides: +req.body.maximumRides 
    };

    Offer.findOneAndUpdate({_id: id}, data, {upsert: true}, (err, doc) => {
      if (err) {
        let error = new ErrorMessage('Error updating', 531);
        return res.status(531).send(error);
      } 
      return res.status(200).end();
    });

  });

  /**
   * GET /offers/:limit?
   * Retrieves the offers based on the limit paramter provider.
   * If limit parameter is not provided, all offers are retrieved.
   */
  app.get('/offers/:limit?', passportConf.isAuthenticated, passportConf.isAdministrator, function(req, res) {

    req.checkParams('limit', 'Invalid Limit')
        .optional()
        .isInt();

    let errors = req.validationErrors();
    if (errors) {
      let err = new ErrorMessage('Validation failure', 400);
      return res.status(400).send(err);
    }

    Offer.find({})
          .limit(+req.params.limit || 0)
          .exec((err, offers) => {
            res.send(offers);
          });

  });

  /**
   * DELETE /offer/:id
   * Deletes the offer based on the `id` parameter
   */
  app.delete('/offer/:id', passportConf.isAuthenticated, passportConf.isAdministrator, function(req, res) {

    req.checkParams('id', 'Id must be specified')
        .notEmpty();

    let errors = req.validationErrors();

    if (errors) {
      let err = new ErrorMessage('Error updating', 400);
      return res.status(400).send(err);
    }

    Offer.findById(req.params.id).remove((err) => {
      if (!err) {
        return res.status(200).end();
      }
      let error = new ErrorMessage('Error deleting the offer', 532);
      return res.status(532).send(error);
    });

  });

  /**
   * GET /ng-admin
   * Render ng-admin page(react ui view page for displaying the api usage..)
   */
  app.get('/ng-admin', passportConf.isAuthenticated, passportConf.isAdministrator, function(req, res) {

    res.render('ng-admin/ng-admin', {
      url: req.url
    });

  });

};
