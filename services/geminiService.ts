import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Caching layer to reduce API calls
const geocodeCache = new Map<string, { lat: number; lng: number }>();
const dataCache = new Map<string, { location: string; data: string }>();


export async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number } | null> {
  if (geocodeCache.has(locationName)) {
    return geocodeCache.get(locationName)!;
  }

  const prompt = `
    You are a highly accurate geocoding service. 
    Given a location name, provide its latitude and longitude.
    Your response MUST be a JSON object with the following structure: {"lat": number, "lng": number}.
    Do not include any other text, explanations, or markdown formatting.
    If the location is ambiguous or cannot be found, return a JSON object with an error: {"error": "Location not found"}.
    
    Location: "${locationName}"
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER, nullable: true },
            lng: { type: Type.NUMBER, nullable: true },
            error: { type: Type.STRING, nullable: true },
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed.error) {
        console.error(`Geocoding error for "${locationName}": ${parsed.error}`);
        throw new Error(parsed.error);
    }

    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      const result = { lat: parsed.lat, lng: parsed.lng };
      geocodeCache.set(locationName, result); // Cache the successful result
      return result;
    } else {
      throw new Error("Invalid coordinates received from geocoding service.");
    }

  } catch (error: any) {
    console.error("Error geocoding location:", error);
    if (String(error).includes('429') || error?.error?.status === 'RESOURCE_EXHAUSTED') {
      throw new Error("API quota exceeded. Please wait a moment before trying again.");
    }
    if (error.message) {
      throw error; // Re-throw specific errors like "Location not found"
    }
    // Generic fallback for other unexpected errors
    throw new Error("The geocoding service is currently unavailable.");
  }
}

export async function fetchDataForLocation(
  layerName: string,
  coords: { lat: number; lng: number }
): Promise<{ location: string; data: string }> {
  // Create a cache key based on layer and rounded coordinates
  const cacheKey = `${layerName}:${coords.lat.toFixed(1)}:${coords.lng.toFixed(1)}`;
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey)!;
  }

  const prompt = `
    You are a NASA Earth data observation system.
    A user has clicked on a 3D globe at latitude=${coords.lat.toFixed(2)} and longitude=${coords.lng.toFixed(2)}.
    
    Your tasks:
    1. First, determine the plausible real-world geographical location (e.g., "Central Brazil", "North Atlantic Ocean", "Siberia, Russia", "Sahara Desert, Algeria") that corresponds to these coordinates. Announce this location clearly.
    2. Second, generate a realistic, simulated data report for the selected data layer: "${layerName}".
    3. The report should be concise and sound scientific. 
    
    - For standard layers, include a primary metric with units and a brief one-sentence summary of the conditions.
    - If the layer is "Weather Forecast", provide a simple 3-day forecast summary (e.g., "Today: Sunny, 25°C. Tomorrow: Partly cloudy, 22°C. Day 3: Showers, 20°C").

    Example for Temperature:
    Location: Central Europe
    Report:
    Surface Temp: 15°C (59°F)
    Summary: Mild temperatures are observed across the region under partly cloudy skies.

    Example for Wind:
    Location: Off the coast of Japan
    Report:
    Wind Speed: 45 km/h (28 mph)
    Summary: Strong westerly winds are creating significant wave action in the area.
    
    Example for Weather Forecast:
    Location: Southern California, USA
    Report:
    Today: Clear skies, 28°C.
    Tomorrow: Sunny with light coastal fog, 26°C.
    Day 3: Partly cloudy, 24°C.
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            location: {
              type: Type.STRING,
              description: 'The identified geographical location based on the coordinates.',
            },
            report: {
              type: Type.STRING,
              description: 'A concise, multi-line report for the data layer, including a primary metric with units and a summary sentence, or a 3-day forecast.',
            },
          }
        }
      }
    });
    
    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (parsedResponse.location && parsedResponse.report) {
      const result = {
        location: parsedResponse.location,
        data: parsedResponse.report,
      };
      dataCache.set(cacheKey, result); // Cache the successful result
      return result;
    } else {
      throw new Error("Invalid format in Gemini response.");
    }
  } catch (error: any) {
    console.error("Error fetching data from Gemini:", error);
    if (String(error).includes('429') || error?.error?.status === 'RESOURCE_EXHAUSTED') {
      throw new Error("API quota exceeded. Please wait a moment before trying again.");
    }
    throw new Error("Could not retrieve data from the observation system.");
  }
}