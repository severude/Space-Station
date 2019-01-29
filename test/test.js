const { expect } = require('chai');
const { assert } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server.js');

describe('Verify Project Setup', () => {

    // Before testing it should connect to the database
    before( function(done) {
        mongoose.connect("mongodb://localhost:27017/space-station", { useNewUrlParser: true } );

        // Verify mongo database connection
        mongoose.connection
            .once("open", () => {
                console.log("Mongo database connection successful");
                done();
            })
            .on("error", (err) => {
                console.error("Mongo database connection error:", err);
            });
    });

    // Disconnect from the database
    after( function(done) {
        mongoose.disconnect();
        done();
    });    

    it('should have Mocha and Chai installed for testing', function () {
        expect(true).to.be.ok;
    });

    it('should verify the server connection', function(done) {
        request(app).get('/test-route')
            .expect(200, {"message": "Welcome to the Space Station App" }, done);
    });
});

describe('Verify Space Station API Routes', () => {

    it('should verify the route for the current space station location', function(done) {
        request(app)
            .get('/location')
            .end((err, res) => {
                expect(res.statusCode).to.be.equal(200);
                assert.isString(res.body.latitude);
                assert.isString(res.body.longitude);
                done();
            });
    });

    it('should verify the route for the number of passengers', function(done) {
        request(app)
            .get('/people')
            .end((err, res) => {
                expect(res.statusCode).to.be.equal(200);
                assert.isArray(res.body.people);
                assert.isNumber(res.body.number);
                done();
            });
    });

    it('should verify the route for the next time the space station will pass by', function(done) {
        request(app)
            .get('/nextPassBy/48/-122')
            .end((err, res) => {
                expect(res.statusCode).to.be.equal(200);
                assert.isNumber(res.body.duration);
                assert.isNumber(res.body.risetime);
                done();
            });
    });
});

describe('Verify Weather API Routes', () => {

    it('should verify the route for getting the weather at a given latitude longitude coordinates', function(done) {
        request(app)
            .get('/weather/48/-122')
            .end((err, res) => {
                expect(res.statusCode).to.be.equal(200);
                assert.isString(res.body.name);
                assert.isNumber(res.body.main.temp);
                assert.isNumber(res.body.wind.speed);
                assert.isNumber(res.body.wind.deg);
                assert.isString(res.body.weather[0].description);
                assert.isString(res.body.weather[0].icon);
                done();
            });
    });
});
