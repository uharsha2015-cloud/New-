import React from 'react';

export enum DataLayerId {
  Temperature = 'temperature',
  Humidity = 'humidity',
  Wind = 'wind',
  Precipitation = 'precipitation',
  SolarRadiation = 'solar_radiation',
  NEO = 'neo',
  Forecast = 'forecast',
}

export interface LegendInfo {
  title: string;
  gradient: string[];
  labels: string[];
}

export interface DataLayer {
  id: DataLayerId;
  name: string;
  icon: React.ReactNode;
  legend: LegendInfo;
}

export type MapStyle = 'day' | 'satellite' | 'topo' | 'ultra';