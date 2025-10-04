import React from 'react';
import { DATA_LAYERS } from '../constants';
import { DataLayerId } from '../types';

interface LegendProps {
  activeLayerId: DataLayerId;
}

const Legend: React.FC<LegendProps> = ({ activeLayerId }) => {
  const activeLayer = DATA_LAYERS.find(layer => layer.id === activeLayerId);

  if (!activeLayer) return null;

  const { title, gradient, labels } = activeLayer.legend;
  
  const gradientStyle = {
    background: `linear-gradient(to right, ${gradient.join(', ')})`,
  };

  return (
    <div className="absolute bottom-4 right-4 bg-[#1e293b] bg-opacity-80 backdrop-blur-sm p-3 rounded-lg shadow-lg text-white w-64 border border-gray-700 animate-fade-in">
      <h4 className="text-sm font-bold mb-2">{title}</h4>
      <div className="w-full h-4 rounded" style={gradientStyle}></div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        {labels.map(label => <span key={label}>{label}</span>)}
      </div>
    </div>
  );
};

export default Legend;