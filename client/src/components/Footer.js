import React, {Component} from 'react';
import { Jumbotron, Button, Collapse } from 'reactstrap';
import LocationList from './LocationList';

class Footer extends Component {

    constructor() {
        super();
        this.state = {
          locationData: [],
          collapse: false
        };
        this.toggle = this.toggle.bind(this);
        this.getLocationData = this.getLocationData.bind(this);
      }
    
      // Change collapse state when button is clicked
      toggle() {
        this.setState({ collapse: !this.state.collapse });
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

      // Return all locations from the database
      getLocationData() {
        this.callBackendAPI('/locationData')
          .then(res => {
            let data = res;
            this.setState({ locationData: data });
          })
          .catch(err => console.log(err));
      }
        
      render() {
        return(
            <Jumbotron className=" bg-info text-white">
                <div className="text-center mb-3">
                    <Button color="info" size="lg" className="border border-white visitor-button p-3" onClick={e => { this.toggle(); this.getLocationData(); }} >Site Visitors</Button>
                </div>
                <Collapse isOpen={this.state.collapse}>
                    <LocationList locations={this.state.locationData} />
                </Collapse>
            </Jumbotron>
        );
      }

}

export default Footer;
