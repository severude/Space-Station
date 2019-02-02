import React from 'react';
import { Row, Col } from 'react-bootstrap';

const MapFooter = (props) => (
    <div>
        <Row>
            <Col smOffset={3}>
                {
                (props.icon) 
                ? <img src={`https://openweathermap.org/img/w/${props.icon}.png`} alt="weather icon" className="ml-3"/>
                : <p></p>
                }
            </Col>
            <Col>
                {
                (props.status)
                ? <h4 className="text-center pt-3 mx-3"> {props.status} {props.temperature}&#176;</h4>
                : <p></p>
                }
            </Col>
            <Col>
                {
                (props.direction)
                ? <h4 className="text-center pt-3">{props.direction} wind {props.wind} mph</h4>
                : <p></p>
                }
            </Col>
        </Row>
        <h1 className="text-center mb-5">{props.area}</h1>
    </div>
);

export default MapFooter;
