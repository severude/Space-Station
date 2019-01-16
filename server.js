const express = require('express');
const http = require('http');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'build')));

const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));

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
    let url = `http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}&alt=20&n=1&callback=`;
    axios.get(url)
        .then(response => {
            let date = new Date(response.data.response[0].risetime * 1000);
            res.status(200).json(date.toLocaleString());
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
