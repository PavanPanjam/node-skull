'use strict';
/* jshint esnext:true */
/*global describe*/
/*global before*/
/*global after*/
/*global beforeEach*/
/*global it*/

/**
 * Module Dependencies
 */

let request = require('supertest');
let app = require('../app.js');
let Offer = require('../models/Offer');
let cheerio = require('cheerio');
let expect = require('chai').expect;


// Set enviroment
process.env.NODE_ENV = 'test';


/**
 * Test Access to the api and ng-admin page without authentication
 */
describe('Accessing Offer api without proper authenticaion', function() {
  let server = request.agent(app);


  it('accessing /offers should return 302', function(done) {
    server.get('/offers')
      .expect(302, done);
  });

  it('accessing /offer should return 302', function(done) {
    server.get('/offers')
      .expect(302, done);
  });

  it('accessing /offerUpdate should return 403', function(done) {
    server.post('/offerUpdate/2')
      .expect(403, done);
  });

  it('accessing /delete should return 403', function(done) {
    server.delete('/offer/1')
      .expect(403, done);
  });

  it('accessing /ng-admin should return 302', function(done) {
    server.delete('/ng-admin')
      .expect(403, done);
  });
  
});  

/**
 * Test the api with proper authentication;
 */
describe('accessing offer api with authentication', function() {

  let server = request.agent(app);
  let csrfToken, cookie, businessOffer, offerDetails, generateOffers;


  /**
   * Log the use in before actually testing the api
   */
  before((done) => {

    let login = function(done) {

      return (err, res) => {
        let html = res.text;
        let $ = cheerio.load(html);
        csrfToken= $('meta[name="x-csrf-token"]').attr('content');
        cookie = res.headers['set-cookie'];

        server.post('/login') 
          .set('cookie', cookie)
          .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
          .set('x-csrf-token', csrfToken)
          .send('email=abc@addd.com&password=1234')
          .end((err, resp) => done());
      };
    };

    server
      .get('/login')
      .end(login(done));

    offerDetails = {name: 'tester', amount: 100, maximumRides: 100};
    businessOffer = new Offer(offerDetails);
    generateOffers = function(n) {
      return new Array(n).fill(0).map((x, ind) => {
        let details = Object.assign(offerDetails, {maximumRides: ind});
        let offer = new Offer(details);
        return offer;
      });
    };
  });

  beforeEach((done) => {
    Offer.remove({}, () => done());
  });

  describe('GET /ng-admin', function() {
    it('GET /ng-admin - Should return 200', (done) => {
      server.get('/ng-admin')
        .expect(200, done);
    });
  });

  describe('GET /offer', function() {
    let onResponse = function(limit, done) {
      return (err, res) => {
        res.status.should.be.equal(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(limit);
        return done();
      };
    };

    it('Should fetch the offers:', (done) => {
      server.get('/offers')
        .end(onResponse(0, done));
    });

    it('Should fetch only two offers', (done) => {
      Promise.all(generateOffers(3).map(o => o.save()))
                  .then((values) => {
        server.get('/offers/2')
          .end(onResponse(2, done));
      });
    });

  });


  describe('/DELETE Offer', function() {

    it('Should delete the offer if given the id', (done) => {
      //create an offer in db
      businessOffer.save((err, offer) => {
        server.delete('/offer/' + offer._id)
          .set('cookie', cookie)
          .set('x-csrf-token', csrfToken)
          .end((err, res) => {
            res.status.should.be.equal(200);
            return done();
          });
      });
    });

    it('Shouldn\'t delete offer if id is not given', (done) => {
      server.delete('/offer')
        .set('cookie', cookie)
        .set('x-csrf-token', csrfToken)
        .end((err, res) => {
          res.status.should.be.equal(404);
          return done();
        });
    });

  });

  describe('/POST update the offer', function() {

    it('should update the existing offer', (done) => {
      businessOffer.save().then(offer => {
        let updatedName = 'Updater';
        server.post('/offerUpdate')
          .set('cookie', cookie)
          .set('x-csrf-token', csrfToken)
          .set('Content-Type', 'application/json')
          .send({name: updatedName, amount: 100, maximumRides: 100, _id: offer._id})
          .end((err, res) => {
            res.status.should.be.equal(200);
            Offer.findById(offer._id).then(offer => {
              offer.name.should.equal(updatedName);
              done();
            });
          });
      });
    });

    it('Should send status 400 if id is not given', (done) => {
      let updatedName = 'Updater';
      server.post('/offerUpdate')
        .set('cookie', cookie)
        .set('x-csrf-token', csrfToken)
        .set('Content-Type', 'application/json')
        .send({name: updatedName, amount: 100, maximumRides: 100})
        .end((err, res) => {
          res.status.should.be.equal(400);
          done();
        });
    });
  });

  describe('/POST Create the Offer', function() {

    it('should create a new Offer', (done) => {
      server.post('/offer')
        .set('cookie', cookie)
        .set('x-csrf-token', csrfToken)
        .set('Content-Type', 'application/json')
        .send({name: 'Tester', amount: 100, maximumRides: 100})
        .end((err, res) => {
          res.status.should.be.equal(200);
          Offer.findOne({name: 'Tester'}, (err, offer) => {
            offer.name.should.equal('Tester');
            done();
          });
        });
    });

    it('shouldn\'t create offer if all fields are not present', (done) => {
      server.post('/offer')
        .set('cookie', cookie)
        .set('x-csrf-token', csrfToken)
        .set('Content-Type', 'application/json')
        .send({name: 'Tester', amount: 100})
        .end((err, res) => {
          res.status.should.be.equal(400);
          res.body.code.should.be.equal(400);
          expect(res.body.message).to.equal('Validation failure');
          console.log('d:', res.body);
          done();
        });
    });
  });


  after((done) => {
    Offer.remove({}, () => {});
    server.get('/logout')
      .expect(302, done);
  });

});
