/* jshint esnext: true */
'use strict';

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let offerSchema = new mongoose.Schema({

  name: { type: String },
  amount: { type: Number },
  maximumRides: { type: Number }
});

module.exports = mongoose.model('Offer', offerSchema);
