import React, { Component } from 'react';
import { Grid, Row, Col, Jumbotron, Badge, Well } from 'react-bootstrap';
import { Map, TileLayer, Circle } from 'react-leaflet';

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

  callBackendAPI = async (url) => {
    const response = await fetch(url);
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  getPositionPromise = (options = {}) => {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  updateMapZoom() {
    let zoom = this.map && this.map.leafletElement.getZoom();
    if(zoom !== undefined) {
      this.setState({ zoom });
    }
  }

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

  getNextPassBy() {
    this.callBackendAPI(`/nextPassBy/${this.state.my_lat}/${this.state.my_lon}`)
      .then(res => {
        let date = new Date(res.risetime * 1000);
        let minutes = Math.floor(res.duration / 60);
        this.setState({ nextPassBy: date.toLocaleString(), duration: minutes });
      })
      .catch(err => console.log(err));
  }

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
          <Jumbotron className=" bg-info text-white">
            <h1 className="display-4 text-center">International Space Station Tracker</h1>
          </Jumbotron>
          <Grid>
            <Row>
              <Col className="col-lg-8" >
                {
                  (this.state.lat)
                    ? <h3 className="text-center mb-3"><Badge className="p-2">{this.state.lat}</Badge> latitude <Badge className="p-2">{this.state.lon}</Badge> longitude</h3>
                    : <p></p>
                }
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
                <Row>
                    <Col smOffset={3}>
                      {
                        (this.state.icon) 
                        ? <img src={`https://openweathermap.org/img/w/${this.state.icon}.png`} alt="weather icon" className="ml-3"/>
                        : <p></p>
                      }
                    </Col>
                    <Col>
                      {
                        (this.state.status)
                        ? <h4 className="text-center pt-3 mx-3"> {this.state.status} {this.state.temperature}&#176;</h4>
                        : <p></p>
                      }
                    </Col>
                    <Col>
                      {
                        (this.state.direction)
                        ? <h4 className="text-center pt-3">{this.state.direction} wind {this.state.wind} mph</h4>
                        : <p></p>
                      }
                    </Col>
                </Row>
                <h1 className="text-center mb-5">{this.state.area}</h1>
              </Col>
              <Col className="col-lg" >
                <Well><p>The ISS travels at an altitude of about 250 miles above the earth and at a speed of about 17,100 miles per hour.  That is about 5 miles per second.  It orbits the earth every 92 minutes.</p></Well>
                {
                  (this.state.duration)
                  ? <Well><p>The ISS will pass by your current location of <Badge className="p-2">{this.state.my_lat}</Badge> <Badge className="p-2">{this.state.my_lon}</Badge> on {this.state.nextPassBy} for {this.state.duration} minutes.</p></Well>
                  : <Well><p>The ISS does not pass by your current location: <Badge className="p-2">{this.state.my_lat}</Badge> <Badge className="p-2">{this.state.my_lon}</Badge></p></Well>
                }
                <Well>
                  <p>The following {this.state.travelers} people are currently on board the ISS:</p>
                  <ul className="text-muted">{this.state.people.map((person, index) => <li key={index}>{person}</li>)}</ul>
                </Well>
              </Col>
            </Row>

        </Grid>
      </div>
    ); // end render return
  } // end render

} // end App class

export default App;
