const express = require('express');
const http = require('http');
const path = require('path');
const axios = require('axios');

let app = express();

app.use(express.static(path.join(__dirname, 'build')));

const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));

app.get('/express_backend', (req, res) => {
    res.send({ express: 'Hello World - Your Express Backend is Connected to REACT' });
  });

app.get('/location', (req, res) => {
    axios.get('http://api.open-notify.org/iss-now.json?callback=?')
        .then(response => {
            console.log(response.data);
            res.send(response.data);
        });
});
