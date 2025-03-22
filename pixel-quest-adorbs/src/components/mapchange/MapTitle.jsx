import React, { useState } from 'react';
import '../../../src/index.css'; // We'll define some styles separately

const MapTitle = () => {
  // Sample map data - you would customize this with your actual maps
  const maps = [
    { id: 1, name: 'Beginner', image: '../../../public/assets/map.png' },
    { id: 2, name: 'Medium', image: '../../../public/assets/map2.jpg' },
    { id: 3, name: 'Hard', image: '../../../public/assets/map3.jpg' },

  ];

  // State for the currently selected map
  const [selectedMap, setSelectedMap] = useState(maps[0]);

  // Function to change the current map
  const changeMap = (map) => {
    setSelectedMap(map);
  };

  return (
    <div className="map-page-container ">
      <h1 className='text-bold text-4xl'>Game Map Selection</h1>
      
      {/* Display the currently selected map */}
      {/* <div className="current-map-display">
        <h2>{selectedMap.name} Map</h2>
        <img 
          src={selectedMap.image} 
          alt={`${selectedMap.name} map`} 
          className="main-map-image"
        />
      </div> */}
      
      {/* Map selector tiles */}
      <div className="map-tiles-container">
        <h3>Select a Map:</h3>
        <div className="map-tiles-grid">
          {maps.map(map => (
            <MapTile 
              key={map.id}
              map={map}
              isSelected={selectedMap.id === map.id}
              onMapSelect={changeMap}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Reusable Map Tile component
const MapTile = ({ map, isSelected, onMapSelect }) => {
  return (
    <div 
      className={`map-tile ${isSelected ? 'selected' : ''}`}
      onClick={() => onMapSelect(map)}
    >
      <div className="map-tile-image-container">
        <img 
          src={map.image} 
          alt={`${map.name} thumbnail`} 
          className="map-tile-image"
        />
      </div>
      <p className="map-tile-name">{map.name}</p>
    </div>
  );
};

export default MapTitle;