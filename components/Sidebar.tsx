import React from 'react';
import { DATA_LAYERS } from '../constants';
import { DataLayerId, MapStyle } from '../types';

interface SidebarProps {
  activeLayer: DataLayerId;
  onLayerSelect: (layerId: DataLayerId) => void;
  mapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  onRefresh: () => void;
  isRefreshDisabled: boolean;
  autoRefreshEnabled: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
}

const MapStyleButton: React.FC<{
    style: MapStyle;
    currentStyle: MapStyle;
    onClick: (style: MapStyle) => void;
    children: React.ReactNode;
}> = ({ style, currentStyle, onClick, children }) => (
    <button
        onClick={() => onClick(style)}
        className={`w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors ${
            currentStyle === style ? 'bg-blue-500 bg-opacity-30 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
        {children}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({
  activeLayer,
  onLayerSelect,
  mapStyle,
  onMapStyleChange,
  onRefresh,
  isRefreshDisabled,
  autoRefreshEnabled,
  onAutoRefreshChange
}) => {
  return (
    <aside className="w-64 bg-[#1e293b] bg-opacity-80 backdrop-blur-sm p-4 flex-shrink-0 flex flex-col z-10 shadow-lg border-r border-gray-700">
      <div>
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <h2 className="text-lg font-semibold text-white">Data Layers</h2>
        </div>
        <div className="border-t border-gray-700 mb-4"></div>
        <nav className="flex flex-col space-y-1">
          {DATA_LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onLayerSelect(layer.id)}
              className={`flex items-center px-3 py-2.5 text-left text-sm font-medium rounded-md group transition-all duration-200 ${
                activeLayer === layer.id
                  ? 'bg-blue-500 bg-opacity-30 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {layer.icon}
              <span>{layer.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-700 my-4"></div>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-400 px-3 mb-2">MAP STYLE</h3>
        <div className="flex flex-col space-y-1">
          <MapStyleButton style="day" currentStyle={mapStyle} onClick={onMapStyleChange}>Day</MapStyleButton>
          <MapStyleButton style="satellite" currentStyle={mapStyle} onClick={onMapStyleChange}>Satellite (Night)</MapStyleButton>
          <MapStyleButton style="topo" currentStyle={mapStyle} onClick={onMapStyleChange}>Topographic</MapStyleButton>
          <MapStyleButton style="ultra" currentStyle={mapStyle} onClick={onMapStyleChange}>Ultra Hybrid</MapStyleButton>
        </div>
      </div>
      
      <div className="border-t border-gray-700 my-4"></div>
      
      <div className="mt-auto">
        <div className="space-y-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshDisabled}
            className="flex items-center justify-center w-full px-3 py-2.5 text-sm font-semibold rounded-md transition-colors bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <svg className={`w-5 h-5 mr-2 ${!isRefreshDisabled && 'animate-pulse'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5"></path></svg>
            Refresh Data
          </button>
           <label htmlFor="auto-refresh-toggle" className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-300">Auto-Refresh</span>
              <div className="relative">
                  <input
                      id="auto-refresh-toggle"
                      type="checkbox"
                      className="sr-only"
                      checked={autoRefreshEnabled}
                      onChange={(e) => onAutoRefreshChange(e.target.checked)}
                  />
                  <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoRefreshEnabled ? 'transform translate-x-full bg-blue-400' : ''}`}></div>
              </div>
          </label>
        </div>
        <div className="border-t border-gray-700 mt-4 pt-4">
          <div className="flex items-start text-yellow-400">
             <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             <div>
                <p className="text-sm font-semibold">Click globe to get data</p>
                <p className="text-xs text-gray-400">Toggle auto-refresh for live updates.</p>
             </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;