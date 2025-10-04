import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import InfoPopup from './components/InfoPopup';
import Legend from './components/Legend';
import { DataLayerId, MapStyle } from './types';
import { fetchDataForLocation, geocodeLocation } from './services/geminiService';
import { DATA_LAYERS } from './constants';

interface PopupInfo {
  x: number;
  y: number;
  data: string | null;
  loading: boolean;
  locationName: string | null;
  error: string | null;
}

interface LastClickedInfo {
  lat: number;
  lng: number;
  clickX: number;
  clickY: number;
}

interface TargetCoordinates {
  lat: number;
  lng: number;
}


const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<DataLayerId>(DataLayerId.Temperature);
  const [mapStyle, setMapStyle] = useState<MapStyle>('day');
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [lastClickedInfo, setLastClickedInfo] = useState<LastClickedInfo | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [targetCoordinates, setTargetCoordinates] = useState<TargetCoordinates | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  const refreshIntervalRef = useRef<number | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  const fetchData = useCallback(async (lat: number, lng: number, clickX: number, clickY: number) => {
    setIsApiLoading(true); // Take control of the API lock
    setPopupInfo({
      x: clickX,
      y: clickY,
      data: null,
      loading: true,
      locationName: 'Fetching location...',
      error: null,
    });

    try {
      const selectedLayer = DATA_LAYERS.find(layer => layer.id === activeLayer);
      if (!selectedLayer) {
        throw new Error('Invalid data layer selected.');
      }

      const { location, data } = await fetchDataForLocation(
        selectedLayer.name,
        { lat, lng }
      );

      setPopupInfo(prev => prev ? { ...prev, data, locationName: location, loading: false } : null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setPopupInfo(prev => prev ? { ...prev, error: `Failed to load data: ${errorMessage}`, loading: false } : null);
    } finally {
        setIsApiLoading(false); // Always release the API lock
    }
  }, [activeLayer]);


  const handleMapClick = useCallback(async (
    clickX: number,
    clickY: number,
    lat: number,
    lng: number
  ) => {
    // Prevent new request if one is already loading
    if (isApiLoading) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
        setLastClickedInfo({ lat, lng, clickX, clickY });
        fetchData(lat, lng, clickX, clickY);
    }, 300); // 300ms debounce delay
    
  }, [fetchData, isApiLoading]);

  const handleRefresh = useCallback(() => {
    if (lastClickedInfo && !isApiLoading) {
      const { lat, lng, clickX, clickY } = lastClickedInfo;
      fetchData(lat, lng, clickX, clickY);
    }
  }, [lastClickedInfo, fetchData, isApiLoading]);

  useEffect(() => {
    if (autoRefreshEnabled && lastClickedInfo) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      refreshIntervalRef.current = window.setInterval(() => {
        handleRefresh();
      }, 60000); // Refresh every 60 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled, lastClickedInfo, handleRefresh]);
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);


  const handleClosePopup = () => {
    setPopupInfo(null);
  };
  
  const handleSearch = async (location: string) => {
    if (isApiLoading) return; // Guard against concurrent requests

    setIsApiLoading(true); // Lock the API for the entire search operation
    setPopupInfo(null); // Close any existing popup
    try {
      const coords = await geocodeLocation(location);
      if (coords) {
        setTargetCoordinates(coords);
        
        const clickX = window.innerWidth * 0.6; // Approx center of map area
        const clickY = window.innerHeight / 2;
        
        setLastClickedInfo({ ...coords, clickX, clickY });
        // Hand over to fetchData, which will manage the loading state from here
        await fetchData(coords.lat, coords.lng, clickX, clickY);
      } else {
          // This case might not be reachable if geocodeLocation always throws on failure
          throw new Error("Location could not be found.");
      }
    } catch (error: any) {
        console.error("Geocoding failed:", error);
        setPopupInfo({
             x: window.innerWidth / 2,
             y: window.innerHeight / 2,
             data: null,
             loading: false,
             locationName: `Search failed for "${location}"`,
             error: error.message || "Please try a different location name.",
        });
        setIsApiLoading(false); // Release the lock if geocoding fails
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-gray-200 font-sans overflow-hidden">
      <Header onSearch={handleSearch} isSearching={isApiLoading} />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar 
          activeLayer={activeLayer} 
          onLayerSelect={setActiveLayer}
          mapStyle={mapStyle}
          onMapStyleChange={setMapStyle}
          onRefresh={handleRefresh}
          isRefreshDisabled={!lastClickedInfo || isApiLoading}
          autoRefreshEnabled={autoRefreshEnabled}
          onAutoRefreshChange={setAutoRefreshEnabled}
        />
        <main className="flex-grow relative">
          <Map 
            onMapClick={handleMapClick} 
            mapStyle={mapStyle} 
            targetCoordinates={targetCoordinates}
          />
          {popupInfo && (
            <InfoPopup
              x={popupInfo.x}
              y={popupInfo.y}
              data={popupInfo.data}
              locationName={popupInfo.locationName}
              loading={popupInfo.loading}
              layerName={DATA_LAYERS.find(l => l.id === activeLayer)?.name || 'Data'}
              layerIcon={DATA_LAYERS.find(l => l.id === activeLayer)?.icon}
              error={popupInfo.error}
              onClose={handleClosePopup}
            />
          )}
          <Legend activeLayerId={activeLayer} />
        </main>
      </div>
    </div>
  );
};

export default App;