'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require("./routes/index");
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

app.use("/", routes);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));

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
