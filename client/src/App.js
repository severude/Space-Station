import React, { Component } from 'react';
import {Grid, Jumbotron} from 'react-bootstrap';
import L from 'leaflet';

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
      duration: 0,
      loading: true
    };
  }

  componentDidMount() {
    this.myLocation();

    this.callBackendAPI('/location')
      .then(res => {
        this.setState({ lat: res.latitude, lon: res.longitude })
        this.renderMap();
      })
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
        .then(res => {
          let date = new Date(res.risetime * 1000);
          let minutes = Math.floor(res.duration / 60);
          this.setState({ nextPassBy: date.toLocaleString(), duration: minutes });
        })
        .catch(err => console.log(err));
    } catch(err) {
      console.warn(`${err.code}: ${err.message}`);
    }
  }

  renderMap = () => {
    let mymap = L.map('mapid');
    mymap.setView([this.state.lat, this.state.lon], 6);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoiZHNldmVydWRlIiwiYSI6ImNqcjg1bjJ3djAzYXk0M253anlueXBsMWgifQ.K1U8coDnDF_hpCrLPvrbqA'
    }).addTo(mymap);

    L.circle([this.state.lat, this.state.lon], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(mymap);
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
            {
              (this.state.duration)
              ? <h3>The ISS passes by your current location {this.state.my_lat} {this.state.my_lon} on {this.state.nextPassBy} for {this.state.duration} minutes.</h3>
              : <h3>The ISS does not pass by your current location: {this.state.my_lat} {this.state.my_lon}</h3>
            }
            <div id="mapid"></div>
          </Grid>
        </Jumbotron>
      </div>
    );
  }

}

export default App;
