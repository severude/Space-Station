import React from 'react';
import { Badge, Well } from 'react-bootstrap';

const Sidebar = (props) => (
    <div>
        <Well>
            <p>The ISS travels at an altitude of about 250 miles above the earth and at a speed of about 17,100 miles per hour.  That is about 5 miles per second.  It orbits the earth every 92 minutes.</p>
        </Well>
        <Well>
            {
                props.lat === null && 
                <p>Access is required for your location in order to make this calculation.  This is a browser setting.</p>
            }
            {
                (props.duration)
                ? <p>The ISS will pass by your current location of <Badge className="p-2">{props.lat}</Badge> <Badge className="p-2">{props.lon}</Badge> on {props.nextPassBy} for {props.duration} minutes.</p>
                : <p>The ISS does not pass by your current location <Badge className="p-2">{props.lat}</Badge> <Badge className="p-2">{props.lon}</Badge></p>
            }
        </Well>
        <Well>
            <p>The following {props.travelers} people are currently on board the ISS:</p>
            <ul className="text-muted">{props.people.map((person, index) => <li key={index}>{person}</li>)}</ul>
        </Well>
    </div>
);

export default Sidebar;
