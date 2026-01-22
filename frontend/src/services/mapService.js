import L from 'leaflet';

// Custom icons for map markers
export const createCustomIcon = (color = 'blue') => {
  return new L.Icon({
    iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Map marker icons
export const mapIcons = {
  start: createCustomIcon('green'),
  pickup: createCustomIcon('blue'),
  dropoff: createCustomIcon('red'),
  fuel: createCustomIcon('orange'),
  rest: createCustomIcon('yellow'),
  inspection: createCustomIcon('violet'),
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (coord1, coord2) => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;
  const distanceMiles = distanceKm * 0.621371;
  
  return {
    kilometers: parseFloat(distanceKm.toFixed(2)),
    miles: parseFloat(distanceMiles.toFixed(2)),
  };
};

// Generate sample coordinates for demo if API fails
export const generateSampleRoute = (startName, pickupName, dropoffName) => {
  // Sample coordinates for major US cities
  const cityCoordinates = {
    'new york': [40.7128, -74.0060],
    'philadelphia': [39.9526, -75.1652],
    'chicago': [41.8781, -87.6298],
    'los angeles': [34.0522, -118.2437],
    'houston': [29.7604, -95.3698],
    'miami': [25.7617, -80.1918],
    'seattle': [47.6062, -122.3321],
    'denver': [39.7392, -104.9903],
    'atlanta': [33.7490, -84.3880],
    'dallas': [32.7767, -96.7970],
  };
  
  const getCoordinates = (cityName) => {
    const lowerName = cityName.toLowerCase();
    for (const [key, coords] of Object.entries(cityCoordinates)) {
      if (lowerName.includes(key)) {
        return coords;
      }
    }
    // Default coordinates if city not found
    return [39.8283, -98.5795]; // Center of US
  };
  
  const startCoords = getCoordinates(startName);
  const pickupCoords = getCoordinates(pickupName);
  const dropoffCoords = getCoordinates(dropoffName);
  
  return {
    coordinates: [startCoords, pickupCoords, dropoffCoords],
    bounds: L.latLngBounds([startCoords, dropoffCoords]),
    center: [
      (startCoords[0] + dropoffCoords[0]) / 2,
      (startCoords[1] + dropoffCoords[1]) / 2,
    ],
  };
};

// Generate fuel stops along route
export const generateFuelStops = (routeCoordinates, totalDistanceMiles) => {
  const fuelStops = [];
  const numStops = Math.floor(totalDistanceMiles / 1000);
  
  if (numStops > 0 && routeCoordinates.length >= 2) {
    for (let i = 1; i <= numStops; i++) {
      const progress = i / (numStops + 1);
      const start = routeCoordinates[0];
      const end = routeCoordinates[routeCoordinates.length - 1];
      
      // Interpolate position along route
      const lat = start[0] + (end[0] - start[0]) * progress;
      const lng = start[1] + (end[1] - start[1]) * progress;
      
      // Add some randomness to make it look natural
      const latOffset = (Math.random() - 0.5) * 0.5;
      const lngOffset = (Math.random() - 0.5) * 0.5;
      
      fuelStops.push({
        id: i,
        position: [lat + latOffset, lng + lngOffset],
        label: `Fuel Stop ${i}`,
        description: `Approximately ${Math.round(totalDistanceMiles * progress)} miles`,
        mileage: Math.round(totalDistanceMiles * progress),
        duration: 1, // 1 hour stop
        type: 'fuel',
      });
    }
  }
  
  return fuelStops;
};

// Format coordinates for Leaflet
export const formatCoordinatesForLeaflet = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates)) {
    return [];
  }
  
  return coordinates.map(coord => {
    if (Array.isArray(coord) && coord.length >= 2) {
      return [coord[0], coord[1]];
    }
    return null;
  }).filter(coord => coord !== null);
};

// Calculate map bounds from coordinates
export const calculateMapBounds = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return [[39.8283, -98.5795]]; // Default to US center
  }
  
  const validCoords = coordinates.filter(coord => 
    Array.isArray(coord) && coord.length >= 2
  );
  
  if (validCoords.length === 0) {
    return [[39.8283, -98.5795]];
  }
  
  return L.latLngBounds(validCoords);
};