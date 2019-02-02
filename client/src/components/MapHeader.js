import React from 'react';
import { Badge } from 'react-bootstrap';

const MapHeader = (props) => (
    <div>
        {
            (props.lat)
            ? <h3 className="text-center mb-3"><Badge className="p-2">{props.lat}</Badge> latitude <Badge className="p-2">{props.lon}</Badge> longitude</h3>
            : <p></p>
        }
    </div>
);

export default MapHeader;
