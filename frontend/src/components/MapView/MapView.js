import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Custom icons
const startIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const fuelIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 34],
  iconAnchor: [10, 34],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapView = ({ route }) => {
  const defaultCenter = [39.8283, -98.5795]; // Center of US
  const defaultZoom = 4;
  
  // If we have actual coordinates from the backend
  const hasCoordinates = route?.coordinates?.start && route?.coordinates?.dropoff;
  
  // Calculate center if we have coordinates
  const mapCenter = hasCoordinates 
    ? [
        (route.coordinates.start[0] + route.coordinates.dropoff[0]) / 2,
        (route.coordinates.start[1] + route.coordinates.dropoff[1]) / 2
      ]
    : defaultCenter;
  
  // Generate a sample polyline if no coordinates (for demo)
  const generateSamplePolyline = () => {
    if (hasCoordinates && route.coordinates.pickup) {
      return [
        route.coordinates.start,
        route.coordinates.pickup,
        route.coordinates.dropoff
      ];
    } else if (hasCoordinates) {
      return [
        route.coordinates.start,
        route.coordinates.dropoff
      ];
    } else {
      // Sample coordinates for demo
      return [
        [40.7128, -74.0060], // NYC
        [39.9526, -75.1652], // Philadelphia
        [41.8781, -87.6298], // Chicago
      ];
    }
  };
  
  const polylinePositions = generateSamplePolyline();
  
  // Generate fuel stops along the route (for demo)
  const generateFuelStops = () => {
    const stops = [];
    const numStops = Math.floor(route?.distance_miles / 1000) || 1;
    
    for (let i = 1; i <= numStops; i++) {
      const progress = i / (numStops + 1);
      const lat = mapCenter[0] + (Math.sin(progress * Math.PI) * 2);
      const lng = mapCenter[1] + (Math.cos(progress * Math.PI) * 2);
      stops.push({
        position: [lat, lng],
        label: `Fuel Stop ${i}`,
        description: `Approx. ${i * 1000} miles, 1 hour stop`
      });
    }
    
    return stops;
  };
  
  const fuelStops = generateFuelStops();
  
  return (
    <div className="map-view-container">
      <div className="map-header">
        <h3>🗺️ Route Visualization</h3>
        <div className="map-stats">
          <div className="stat-item">
            <span className="stat-label">Distance:</span>
            <span className="stat-value">{route?.distance_miles?.toLocaleString() || '1,000'} miles</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Est. Driving:</span>
            <span className="stat-value">{route?.driving_hours?.toFixed(1) || '18.0'} hours</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Est. Days:</span>
            <span className="stat-value">{route?.estimated_days?.toFixed(1) || '1.6'} days</span>
          </div>
        </div>
      </div>
      
      <div className="map-wrapper">
        <MapContainer 
          center={mapCenter} 
          zoom={defaultZoom} 
          scrollWheelZoom={true}
          className="map-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route Polyline */}
          <Polyline
            pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.7 }}
            positions={polylinePositions}
          />
          
          {/* Start Marker */}
          <Marker position={polylinePositions[0]} icon={startIcon}>
            <Popup>
              <div className="popup-content">
                <strong>📍 Start: Current Location</strong><br/>
                <em>{route?.current_location || 'New York, NY'}</em><br/>
                <small>Day 1 - Beginning of trip</small>
              </div>
            </Popup>
          </Marker>
          
          {/* Pickup Marker (if exists) */}
          {polylinePositions.length > 2 && (
            <Marker position={polylinePositions[1]} icon={pickupIcon}>
              <Popup>
                <div className="popup-content">
                  <strong>📦 Pickup Location</strong><br/>
                  <em>{route?.pickup_location || 'Philadelphia, PA'}</em><br/>
                  <small>Estimated stop: 1 hour for loading</small><br/>
                  <small>Required by trip assumptions</small>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Fuel Stops */}
          {fuelStops.map((stop, index) => (
            <Marker key={index} position={stop.position} icon={fuelIcon}>
              <Popup>
                <div className="popup-content">
                  <strong>⛽ {stop.label}</strong><br/>
                  <em>{stop.description}</em><br/>
                  <small>Every 1,000 miles per assumptions</small><br/>
                  <small>1-hour duration for fueling/rest</small>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Dropoff Marker */}
          <Marker position={polylinePositions[polylinePositions.length - 1]} icon={dropoffIcon}>
            <Popup>
              <div className="popup-content">
                <strong>🏁 Dropoff Location</strong><br/>
                <em>{route?.dropoff_location || 'Chicago, IL'}</em><br/>
                <small>Final destination</small><br/>
                <small>Estimated stop: 1 hour for unloading</small>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-icon start"></div>
          <span>Start Location</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon pickup"></div>
          <span>Pickup (1h stop)</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon dropoff"></div>
          <span>Dropoff (1h stop)</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon fuel"></div>
          <span>Fuel Stop (1h stop)</span>
        </div>
        <div className="legend-item">
          <div className="legend-line"></div>
          <span>Route Path</span>
        </div>
      </div>
      
      <div className="route-details">
        <h4>Route Details</h4>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Total Stops:</span>
            <span className="detail-value">{fuelStops.length + 2} stops</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fuel Stops:</span>
            <span className="detail-value">{fuelStops.length} every ~1,000 miles</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Avg Speed:</span>
            <span className="detail-value">55 mph (assumed)</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Stop Duration:</span>
            <span className="detail-value">1 hour each</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;