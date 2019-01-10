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
      loading: true,
      data: null
    };
  } 

  componentDidMount() {
    this.myLocation();

    this.findLocation()
      .then(res => this.setState({ lat: res.latitude, lon: res.longitude }))
      .catch(err => console.log(err));

    // this.findPeople();

    // this.callBackendAPI()
    //   .then(res => this.setState({ data: res.express }))
    //   .catch(err => console.log(err));
  }

  callBackendAPI = async () => {
    const response = await fetch('/express_backend');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  findLocation = async () => {
    const response = await fetch('/location');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  }

  findPeople = () => {
    $.getJSON('https://api.open-notify.org/astros.json?callback=?')
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
    $.getJSON(`https://api.open-notify.org/iss-pass.json?lat=${this.state.my_lat}&lon=${this.state.my_lon}&alt=20&n=1&callback=?`)
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
      // this.findPassByTime();
    } catch(err) {
      console.warn(`${err.code}: ${err.message}`);
    }
  }

  render() {
    return (
      <div>
        <Jumbotron>
          <Grid>
            <h1>{this.state.data}</h1>
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
