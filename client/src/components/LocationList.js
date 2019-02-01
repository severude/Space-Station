import React from 'react';
import Location from './Location';

const LocationList = (props) => {
    return (
      <div>
        {
          props.locations.map(location => 
          <Location
            {...location}
            key={location._id}
          />
          )
        }
      </div>
    );
  }
  
  export default LocationList;
  