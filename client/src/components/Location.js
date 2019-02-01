import React from 'react';

const Location = (props) => {
    return (
      <div>
        {
          (props.count === 1)
          ? <p className="text-center location-item">{props.location} at coordinates {props.latitude} {props.longitude} has visited {props.count} time</p>
          : <p className="text-center location-item">{props.location} at coordinates {props.latitude} {props.longitude} has visited {props.count} times</p>
        }
      </div>
      
    );
  }
  
  export default Location;
