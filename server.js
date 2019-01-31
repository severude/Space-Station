'use strict';
const express = require('express');
const http = require('http');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'build')));

const port = process.env.PORT || '3001';
app.set('port', port);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/space-station", { useNewUrlParser: true } );
const db = mongoose.connection;
db.on("error", (err) => {
	console.error("Mongo database connection error:", err);
});
db.once("open", () => {
	console.log("Mongo database connection successful");
});

let Location = mongoose.model('Location', { location: String, latitude: String, longitude: String, count: Number });

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));

app.get('/test-route', (req, res) => {
    res.json({ message: 'Welcome to the Space Station App' });
});

app.get('/location', (req, res) => {
    axios.get('http://api.open-notify.org/iss-now.json?callback=')
        .then(response => {
            let location = response.data.iss_position;
            res.status(200).json(location);
        });
});

app.get('/people', (req, res) => {
    axios.get('http://api.open-notify.org/astros.json?callback=')
        .then(response => {
            let passengers = response.data;
            res.status(200).json(passengers);
        });
});

app.get('/nextPassBy/:lat/:lon', (req, res) => {
    let lat = req.params.lat;
    let lon = req.params.lon;
    axios.get(`http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}&alt=20&n=5&callback=`)
        .then(response => {
            let nextPassBy = response.data.response[0];
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=f8a771601a9624cb98f25476e904ee37`)
                .then(response => {
                    let area = response.data.name;
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

app.get('/weather/:lat/:lon', (req, res) => {
    let lat = req.params.lat;
    let lon = req.params.lon;
    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=f8a771601a9624cb98f25476e904ee37`)
        .then(response => {
            let weather = response.data;
            res.status(200).json(weather);
        });
});

app.get('/locationData', (req, res) => {
    Location.find({}, function(err, users){
        let userMap = [];
        users.forEach(function(user){
            userMap.push(user);
        });
        res.status(200).json(userMap);
    });
});

if (process.env.NODE_ENV === 'production') {
    // Exprees will serve up production assets
    app.use(express.static('client/build'));
  
    // Express serve up index.html file if it doesn't recognize route
    const path = require('path');
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

module.exports = server;
