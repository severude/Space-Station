import React, { Component } from 'react';
import {Grid, Jumbotron} from 'react-bootstrap';
import $ from 'jquery';

class App extends Component {

  constructor() {
    super();
    this.state = {
      lat: null,
      lon: null,
      my_lat: null,
      my_lon: null,
      travelers: 0,
      people: [],
      nextPassBy: null,
      loading: true
    };
  } 

  componentDidMount() {
    this.myLocation();
    this.findLocation();
    this.findPeople();
}

  findLocation = () => {
    $.getJSON('http://api.open-notify.org/iss-now.json?callback=?')
      .then(response => {
        this.setState({
          lat: response.iss_position.latitude,
          lon: response.iss_position.longitude,
        });
      })
      .catch(error => {
        console.warn('Error fetching and parsing data', error);
      });
}

findPeople = () => {
  $.getJSON('http://api.open-notify.org/astros.json?callback=?')
    .then(response => {
      let persons = [];
      response.people.forEach(person => {
        persons.push(person.name);
      });
      this.setState({
        travelers: response.number,
        people: persons
      });
    })
    .catch(error => {
      console.warn('Error fetching and parsing data', error);
    });
}

findPassByTime = () => {
  $.getJSON(`http://api.open-notify.org/iss-pass.json?lat=${this.state.my_lat}&lon=${this.state.my_lon}&alt=20&n=1&callback=?`)
  .then(response => {
    let date = new Date(response.response[0].risetime * 1000);
    this.setState({
      nextPassBy: date.toString()
    });
  })
  .catch(error => {
    console.warn('Error fetching and parsing data', error);
  })
}

getPosition = (options = {}) => {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

myLocation = async () => {
  try {
    let pos = await this.getPosition();
    let position = pos.coords;
    this.setState({
      my_lat: position.latitude,
      my_lon: position.longitude,
      loading: false
    });
    this.findPassByTime();
  } catch(err) {
    console.warn(`${err.code}: ${err.message}`);
  }
}

render() {
    return (
      <div>
        <Jumbotron>
          <Grid>
            <h1>Tracking the International Space Station (ISS)</h1>
            <p>The IIS travels at an altitude of about 250 miles and at a speed of 17,100 miles per hour.  That is about 5 miles per second.  It orbits the earth every 92 minutes.</p>
            <p>The current location of the ISS over the earth is {this.state.lat} latitude, {this.state.lon} longitude.</p>
            <h2>The following {this.state.travelers} people are currently on board the ISS:</h2>
            <p>{this.state.people.map((person, index) => <li key={index}>{person}</li>)}</p>
            <h3>The ISS will pass by your location of {this.state.my_lat} {this.state.my_lon} on: {this.state.nextPassBy}</h3>
          </Grid>
        </Jumbotron>
      </div>
    );
  }
}

export default App;
