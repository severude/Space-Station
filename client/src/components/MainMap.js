import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { Map, TileLayer, Circle } from 'react-leaflet';
import MapHeader from './MapHeader';
import MapFooter from './MapFooter';
import Sidebar from './Sidebar';

class MainMap extends Component {

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
      zoom: 6,
      area: '',
      temperature: null,
      wind: null,
      degrees: null,
      direction: '',
      status: '',
      icon: '',
      interval: 3000,
      loading: true
    };
  }

  componentDidMount() {
    this.getMyLocation();
    this.getISSLocation();
    this.getPassengers();
  }

  // Wrapper for API Calls
  callBackendAPI = async (url) => {
    const response = await fetch(url);
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  // Promise for returning user location
  getPositionPromise = (options = {}) => {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  // Keeps zoom in sync with state if user changes zoom setting
  updateMapZoom() {
    let zoom = this.map && this.map.leafletElement.getZoom();
    if(zoom !== undefined) {
      this.setState({ zoom });
    }
  }

  // Returns user latitude and longitude
  getMyLocation = async () => {
    try {
      let pos = await this.getPositionPromise();
      let position = pos.coords;
      this.setState({
        my_lat: position.latitude.toFixed(4),
        my_lon: position.longitude.toFixed(4)
      });
      this.getNextPassBy();
    } catch(err) {
      console.warn(`${err.code}: ${err.message}`);
    }
  }

  // Returns time and duration of next ISS pass by
  getNextPassBy() {
    this.callBackendAPI(`/nextPassBy/${this.state.my_lat}/${this.state.my_lon}`)
      .then(res => {
        let date = new Date(res.risetime * 1000);
        let minutes = Math.floor(res.duration / 60);
        this.setState({ nextPassBy: date.toLocaleString(), duration: minutes });
      })
      .catch(err => console.log(err));
  }

  // Returns current ISS location and repeats the call per a set interval
  getISSLocation() {
    this.callBackendAPI('/location')
      .then(res => {
        this.updateMapZoom();
        this.setState({ 
          lat: res.latitude, 
          lon: res.longitude,
          loading: false 
        });
        this.getWeather();
      })
      .catch(err => console.log(err));

    setTimeout(this.getISSLocation.bind(this), this.state.interval);
  }

  // Returns all passengers currently on the ISS
  getPassengers() {
    this.callBackendAPI('/people')
      .then(res => {
        let persons = [];
        res.people.forEach(person => {
          persons.push(person.name);
        });
        this.setState({ travelers: res.number, people: persons })
      })
      .catch(err => console.log(err));
  }

  // Calculates a direction based on the degree value passed in
  getDirection(degrees) {
    if(degrees >= 337.5) { return 'N'; }
    else if(degrees >= 292.5) { return 'NW'; }
    else if(degrees >= 247.5) { return 'W'; }
    else if(degrees >= 202.5) { return 'SW'; }
    else if(degrees >= 157.5) { return 'S'; }
    else if(degrees >= 112.5) { return 'SE'; }
    else if(degrees >= 67.5) { return 'E'; }
    else if(degrees >= 22.5) { return 'NE'; }
    else return 'N';
  }

  // Gets the current weather and location name per given coordinates
  getWeather() {
    this.callBackendAPI(`/weather/${this.state.lat}/${this.state.lon}`)
      .then(res => {
        let area = res.name;
        let icon = res.weather[0].icon;
        let temperature = Math.round(res.main.temp);
        let status = res.weather[0].description;
        let wind = Math.round(res.wind.speed);
        let degrees = res.wind.deg;
        let direction = this.getDirection(degrees);
        this.setState({ area, temperature, status, wind, direction, icon });
      })
      .catch(err => console.log(err));
  }

  render() {
    return (
      <div>
        <Grid>
            <Row>
                <Col className="col-lg-8" >
                  <MapHeader 
                    lat={this.state.lat}
                    lon={this.state.lon}
                  />
                  {
                      (this.state.loading)
                      ? <h2 className="text-center">Loading...</h2>
                      : <Map className="map-container" center={[this.state.lat, this.state.lon]} 
                              ref={(ref) => { this.map = ref; }}
                              zoom={this.state.zoom} >
                          <TileLayer 
                              url='https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}'
                              maxZoom={18}
                              attribution= 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
                              accessToken= 'pk.eyJ1IjoiZHNldmVydWRlIiwiYSI6ImNqcjg1bjJ3djAzYXk0M253anlueXBsMWgifQ.K1U8coDnDF_hpCrLPvrbqA'
                              id= 'mapbox.streets'
                          />
                          <Circle center={[this.state.lat, this.state.lon]}
                              color='red'
                              fillColor='#f03'
                              fillOpacity={0.5}
                              radius={500}
                          />
                          </Map>
                  }
                  <MapFooter
                    icon={this.state.icon}
                    status={this.state.status}
                    temperature={this.state.temperature}
                    direction={this.state.direction}
                    wind={this.state.wind}
                    area={this.state.area}
                  />
                </Col>
                <Col className="col-lg" >
                  <Sidebar 
                    lat={this.state.my_lat}
                    lon={this.state.my_lon}
                    duration={this.state.duration}
                    travelers={this.state.travelers}
                    people={this.state.people}
                    nextPassBy={this.state.nextPassBy}
                  />
                </Col>
            </Row>
        </Grid>
      </div>
    ); // end render return
  } // end render

} // end MainMap class

export default MainMap;
