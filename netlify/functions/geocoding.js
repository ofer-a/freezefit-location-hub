// Netlify Function for geocoding addresses using OpenStreetMap Nominatim API
import { createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    if (event.httpMethod !== 'POST') {
      return createResponse(405, null, 'Method not allowed');
    }

    const { address } = JSON.parse(event.body);

    if (!address) {
      return createResponse(400, null, 'Address is required');
    }

    // Use OpenStreetMap Nominatim API for geocoding (free and no API key required)
    const encodedAddress = encodeURIComponent(address);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=il&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'FreezeFit-Location-Hub/1.0 (contact@freezefit.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      return createResponse(404, null, 'Address not found');
    }

    const result = data[0];

    // Return coordinates and address details
    const geocodingResult = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      display_name: result.display_name,
      address_details: {
        city: result.address?.city || result.address?.town || result.address?.village || '',
        street: result.address?.road || '',
        house_number: result.address?.house_number || '',
        postcode: result.address?.postcode || ''
      }
    };

    return createResponse(200, geocodingResult);

  } catch (error) {
    console.error('Geocoding API error:', error);
    return createResponse(500, null, error.message);
  }
};
