'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const Location = require('../models').Location;

// Test route only
router.get('/test-route', (req, res) => {
    res.json({ message: 'Welcome to the Space Station App' });
});

//  Returns current latitude, longitude of ISS
router.get('/location', (req, res) => {
    axios.get('http://api.open-notify.org/iss-now.json?callback=')
        .then(response => {
            let location = response.data.iss_position;
            res.status(200).json(location);
        });
});

// Returns number of passengers on the ISS
router.get('/people', (req, res) => {
    axios.get('http://api.open-notify.org/astros.json?callback=')
        .then(response => {
            let passengers = response.data;
            res.status(200).json(passengers);
        });
});

// Returns current latitude, longitude of user location
router.get('/nextPassBy/:lat/:lon', (req, res) => {
    let lat = req.params.lat;
    let lon = req.params.lon;
    axios.get(`http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}&alt=20&n=5&callback=`)
        .then(response => {
            let nextPassBy = response.data.response[0];
            // Returns location name of user
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=f8a771601a9624cb98f25476e904ee37`)
                .then(response => {
                    let area = response.data.name;
                    // Updates the database, either increases the location count, otherwise creates a new record
                    Location.findOne({'location': area}, function(err, loc){
                        if(loc) {
                            loc.set({ count: loc.count + 1 });
                            loc.save(function (err) {
                                if (err) { console.log(err); }
                            });
                        } else {
                            let location = new Location({ location: area, latitude: lat, longitude: lon, count: 1 });
                            location.save(function (err) {
                                if (err) { console.log(err); }
                            });
                        }
                    });
            });
            res.status(200).json(nextPassBy);
        }).catch((error) => {
            // The space station does not pass by these coordinates, then return 0
            res.status(200).json({"duration":0,"risetime":0});
        });
});

// Returns current weather conditions for a given latitude, longitude
router.get('/weather/:lat/:lon', (req, res) => {
    let lat = req.params.lat;
    let lon = req.params.lon;
    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=f8a771601a9624cb98f25476e904ee37`)
        .then(response => {
            let weather = response.data;
            res.status(200).json(weather);
        });
});

// Returns all location records from the database
router.get('/locationData', (req, res) => {
    Location.find({}, function(err, users){
        let userMap = [];
        users.forEach(function(user){
            userMap.push(user);
        });
        res.status(200).json(userMap);
    });
});

module.exports = router;
