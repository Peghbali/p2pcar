import React, { useEffect, useRef, useState } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import { useHistory } from "react-router-dom";
import "./CarMap.css";

function CarMap({
  cars,
  highlightedCar,
  mapOptions = {},
  mapEventHandlers = {},
  markerEventHandlers = {},
}) {
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const markers = useRef({});
  const history = useHistory();

  //   // Create the map
  useEffect(() => {
    if (!map) {
      setMap(
        new window.google.maps.Map(mapRef.current, {
          center: {
            lat: 37.773972,
            lng: -122.431297,
          }, // San Francisco coordinates
          zoom: 13,
          clickableIcons: false,
          ...mapOptions,
        })
      );
    }
  }, [mapRef, map, mapOptions]);

  //   // Add event handlers to map
  useEffect(() => {
    if (map) {
      const listeners = Object.entries(mapEventHandlers).map(
        ([event, handler]) =>
          window.google.maps.event.addListener(map, event, (...args) =>
            handler(...args, map)
          )
      );

      return () => listeners.forEach(window.google.maps.event.removeListener);
    }
  }, [map, mapEventHandlers]);

  // Update map markers whenever `cars` changes
  useEffect(() => {
    if (map) {
      // Add markers for new cars
      cars.forEach((car) => {
        if (markers.current[car.id]) return;

        const marker = new window.google.maps.Marker({
          map,
          position: new window.google.maps.LatLng(
            parseFloat(car.location[0]),
            parseFloat(car.location[1])
          ),
          label: {
            text: `$${car.dailyRate}`,
            fontWeight: "bold",
            color: "darkslateblue",
          },
          icon: {
            path: `
                M 1,0
                L 2,0
                A 1 1 0 0 1 3,1
                A 1 1 0 0 1 2,2
                L 1,2
                A 1 1 0 0 1 0,1
                A 1 1 0 0 1 1,0
                z
              `,
            fillOpacity: 1,
            fillColor: "white",
            // strokeColor: "black",
            // strokeWeight: 1,
            strokeWeight: 0,
            scale: 15,
            labelOrigin: new window.google.maps.Point(1.5, 1),
            anchor: new window.google.maps.Point(1.5, 1),
          },
        });

        Object.entries(markerEventHandlers).forEach(([event, handler]) => {
          marker.addListener(event, () => handler(car));
        });
        markers.current[car.id] = marker;
      });

      // Remove markers for old cars
      Object.entries(markers.current).forEach(([carId, marker]) => {
        if (cars.some((car) => car.id.toString() === carId)) return;

        marker.setMap(null);
        delete markers.current[carId];
      });
    }
  }, [cars, history, map, markerEventHandlers]);

  // Change the style for car marker on hover
  useEffect(() => {
    Object.entries(markers.current).forEach(([carId, marker]) => {
      const label = marker.getLabel();
      const icon = marker.getIcon();

      if (parseInt(carId) === highlightedCar) {
        marker.setLabel({ ...label, color: "white" });
        marker.setIcon({ ...icon, fillColor: "darkslateblue" });
      } else {
        marker.setLabel({ ...label, color: "darkslateblue" });
        marker.setIcon({ ...icon, fillColor: "white" });
      }
    });
  }, [markers, highlightedCar]);

  return (
    <div ref={mapRef} className="map">
      Map
    </div>
  );
}

function CarMapWrapper(props) {
  return (
    <Wrapper apiKey={process.env.REACT_APP_MAPS_API_KEY}>
      <CarMap {...props} />
    </Wrapper>
  );
}

export default CarMapWrapper;