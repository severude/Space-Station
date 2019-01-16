import React, { Component } from 'react';
import {Grid, Jumbotron} from 'react-bootstrap';

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

    this.callBackendAPI('/location')
      .then(res => this.setState({ lat: res.latitude, lon: res.longitude }))
      .catch(err => console.log(err));

    this.callBackendAPI('/people')
      .then(res => {
        let persons = [];
        res.people.forEach(person => {
          persons.push(person.name);
        });
        this.setState({ travelers: res.number, people: persons })
      })
      .catch(err => console.log(err));

  } //end componentDidMount()

  callBackendAPI = async (url) => {
    const response = await fetch(url);
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

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
        my_lat: position.latitude.toFixed(4),
        my_lon: position.longitude.toFixed(4),
        loading: false
      });
      this.callBackendAPI(`/nextPassBy/${this.state.my_lat}/${this.state.my_lon}`)
        .then(res => this.setState({ nextPassBy: res }))
        .catch(err => console.log(err));
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
