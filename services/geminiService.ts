// This service now uses public APIs (Nominatim for geocoding, NASA for data)
// and does not use the Gemini API.

// --- Geocoding Service (Nominatim) ---

export async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number }> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    } else {
      throw new Error(`Location "${locationName}" not found.`);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Could not find coordinates for "${locationName}".`);
  }
}


// --- Data Fetching Service (NASA APIs) ---

const NASA_API_KEY = 'DEMO_KEY'; // Using DEMO_KEY for public access

interface NasaPowerData {
    [key: string]: {
        [date: string]: number;
    };
}

// Fetches meteorological data from NASA's POWER API
async function fetchPowerData(coords: { lat: number; lng: number }): Promise<NasaPowerData | null> {
    const parameters = ['T2M', 'RH2M', 'WS10M', 'PRECTOTCORR', 'ALLSKY_SFC_SW_DWN'].join(',');
    // Get data for the last 5 days to ensure we have a recent value
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 5);
    const endStr = endDate.toISOString().slice(0, 10).replace(/-/g, '');
    const startStr = startDate.toISOString().slice(0, 10).replace(/-/g, '');
    
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters}&community=RE&longitude=${coords.lng}&latitude=${coords.lat}&start=${startStr}&end=${endStr}&format=JSON`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('NASA POWER API Error:', errorText);
            throw new Error(`NASA POWER API request failed with status: ${response.status}`);
        }
        const data = await response.json();
        return data.properties.parameter;
    } catch (error) {
        console.error('Failed to fetch from NASA POWER API:', error);
        return null;
    }
}

// Fetches Near-Earth Object data from NASA's NeoWs API
async function fetchNeoData(): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`NASA NeoWs API request failed with status: ${response.status}`);
        }
        const data = await response.json();
        const neos = data.near_earth_objects[today] || [];
        
        if (neos.length === 0) {
            return 'No significant Near-Earth Objects are being tracked for today.';
        }

        const closestNeo = neos.reduce((prev: any, current: any) => 
            (parseFloat(prev.close_approach_data[0].miss_distance.kilometers) < parseFloat(current.close_approach_data[0].miss_distance.kilometers)) ? prev : current
        );
        
        const name = closestNeo.name;
        const missDistance = parseFloat(closestNeo.close_approach_data[0].miss_distance.kilometers).toLocaleString('en-US', { maximumFractionDigits: 0 });
        const velocity = parseFloat(closestNeo.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString('en-US', { maximumFractionDigits: 0 });
        const diameter = ((closestNeo.estimated_diameter.meters.estimated_diameter_min + closestNeo.estimated_diameter.meters.estimated_diameter_max) / 2).toFixed(2);

        return `Closest NEO Today: ${name}\nEst. Diameter: ${diameter} m\nMiss Distance: ${missDistance} km\nVelocity: ${velocity} km/h`;

    } catch (error) {
        console.error('Failed to fetch from NASA NeoWs API:', error);
        return 'Could not retrieve NEO data from NASA.';
    }
}

// Helper to get the most recent valid value from a POWER API parameter
function getLatestValue(param: any, unit: string): string {
    if (!param) return 'N/A';
    const dates = Object.keys(param).sort().reverse(); // Sort dates descending
    for (const date of dates) {
        const value = param[date];
        if (value !== -999) { // -999 is NASA's null value
            return `${value.toFixed(2)} ${unit}`;
        }
    }
    return 'N/A';
}

export async function fetchDataForLocation(
  layerName: string,
  coords: { lat: number; lng: number }
): Promise<{ location: string; data: string }> {
    let reportData = 'Data not available for this layer.';
    let locationName = `Lat: ${coords.lat.toFixed(2)}, Lon: ${coords.lng.toFixed(2)}`;

    if (layerName === 'Near-Earth Objects') {
        locationName = 'Global NEO Tracking';
        reportData = await fetchNeoData();
    } else {
        const powerData = await fetchPowerData(coords);
        if (powerData) {
            const temp = getLatestValue(powerData.T2M, '°C');
            const humidity = getLatestValue(powerData.RH2M, '%');
            const wind = getLatestValue(powerData.WS10M, 'm/s');
            const precipitation = getLatestValue(powerData.PRECTOTCORR, 'mm/day');
            const solar = getLatestValue(powerData.ALLSKY_SFC_SW_DWN, 'kW-hr/m²/day');
            
            const intro = 'Latest Observational Data:\n\n';

            switch (layerName) {
                case 'Temperature':
                    reportData = `Temperature: ${temp}`;
                    break;
                case 'Humidity':
                    reportData = `Relative Humidity: ${humidity}`;
                    break;
                case 'Wind':
                    reportData = `Wind Speed (10m): ${wind}`;
                    break;
                case 'Precipitation':
                    reportData = `Precipitation: ${precipitation}`;
                    break;
                case 'Solar Radiation':
                    reportData = `Solar Insolation: ${solar}`;
                    break;
                case 'Weather Forecast':
                    reportData = `${intro}Temperature: ${temp}\nHumidity: ${humidity}\nWind Speed: ${wind}\nPrecipitation: ${precipitation}`;
                    break;
                default:
                    reportData = `${intro}Temperature: ${temp}\nHumidity: ${humidity}\nWind: ${wind}`;
            }
        } else {
            reportData = 'Could not retrieve meteorological data from NASA POWER API.';
        }
    }

    return {
        location: locationName,
        data: `(Source: NASA) ${reportData}`,
    };
}
