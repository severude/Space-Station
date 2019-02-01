'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema({ 
    location: String, 
    latitude: String, 
    longitude: String, 
    count: Number 
});

const Location = mongoose.model('Location', LocationSchema);
module.exports.Location = Location;
