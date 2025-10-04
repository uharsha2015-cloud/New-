import React from 'react';
import { DataLayer, DataLayerId } from './types';

const iconClass = "w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors";

export const DATA_LAYERS: DataLayer[] = [
  {
    id: DataLayerId.Temperature,
    name: 'Temperature',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m-6.364-6.364l.707.707M17.657 17.657l.707.707M4 12H3m1-7.636l-.707.707M20 12h-1m.293-7.293l-.707-.707M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>,
    legend: {
      title: 'Temperature (°C)',
      gradient: ['#8A2BE2', '#0000FF', '#00FF00', '#FFFF00', '#FF0000'],
      labels: ['-30', '-10', '10', '30', '50']
    }
  },
  {
    id: DataLayerId.Humidity,
    name: 'Humidity',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.5a6.5 6.5 0 00-6.5 6.5c0 3.86 4.5 9.5 6.5 9.5s6.5-5.64 6.5-9.5A6.5 6.5 0 0012 6.5zm0 3a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" /></svg>,
    legend: {
      title: 'Relative Humidity (%)',
      gradient: ['#FDE68A', '#6EE7B7', '#3B82F6', '#1E3A8A'],
      labels: ['0', '33', '66', '100']
    }
  },
  {
    id: DataLayerId.Wind,
    name: 'Wind',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 4H3m18 0h-2M5.64 5.64L4.22 4.22m15.56 15.56l-1.42-1.42" /></svg>,
    legend: {
      title: 'Wind Speed (km/h)',
      gradient: ['#FFFFFF', '#67E8F9', '#0891B2', '#0E7490', '#164E63'],
      labels: ['0', '25', '50', '75', '100+']
    }
  },
  {
    id: DataLayerId.Precipitation,
    name: 'Precipitation',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.99A5.002 5.002 0 1012 5a5.002 5.002 0 00-5 5.001V15zM12 19v-2" /></svg>,
    legend: {
      title: 'Precipitation Rate (mm/hr)',
      gradient: ['#A7F3D0', '#34D399', '#059669', '#047857'],
      labels: ['0', '2.5', '7.6', '50']
    }
  },
  {
    id: DataLayerId.SolarRadiation,
    name: 'Solar Radiation',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-15.66l-.707.707M4.04 19.96l-.707.707M21 12h-1M4 12H3m16.96-7.96l-.707-.707M7.07 7.07l-.707-.707" /></svg>,
    legend: {
      title: 'Insolation (W/m²)',
      gradient: ['#FEF9C3', '#FDE047', '#F59E0B', '#D97706'],
      labels: ['0', '250', '500', '1000+']
    }
  },
  {
    id: DataLayerId.NEO,
    name: 'Near-Earth Objects',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M12.001 2.003a9.998 9.998 0 0 0-8.243 4.413 1.002 1.002 0 0 0 .548 1.48l.094.044a1 1 0 0 0 1.48-.548A7.997 7.997 0 0 1 18.397 12a1 1 0 0 0 1.999 0 9.998 9.998 0 0 0-8.395-9.997zM2.68 9.406a1 1 0 0 0-.548 1.48l4.413 8.243a1.002 1.002 0 0 0 1.48-.548l.044-.094a1 1 0 0 0-.548-1.48L3.108 8.763a1 1 0 0 0-1.48.548z" /></svg>,
    legend: {
        title: 'NEO Proximity',
        gradient: ['#10B981', '#F59E0B', '#EF4444'],
        labels: ['Distant', 'Moderate', 'Close']
    }
  },
  {
    id: DataLayerId.Forecast,
    name: 'Weather Forecast',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.99A5.002 5.002 0 1012 5a5.002 5.002 0 00-5 5.001V15zM12 19l-2-2m2 2l2-2" /></svg>,
    legend: {
        title: 'Forecast',
        gradient: ['#3B82F6', '#93C5FD', '#FBBF24', '#F59E0B'],
        labels: ['Clear', 'Cloudy', 'Rain', 'Storm']
    }
  }
];