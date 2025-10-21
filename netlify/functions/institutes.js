// Netlify Function for institutes API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    // Extract institute ID from path if pathParameters.id is not available
    let instituteId = pathParameters?.id;
    if (!instituteId && path.includes('/institutes/') && !path.includes('/owner/')) {
      const pathParts = path.split('/');
      const institutesIndex = pathParts.indexOf('institutes');
      if (institutesIndex !== -1 && pathParts[institutesIndex + 1]) {
        const nextPart = pathParts[institutesIndex + 1];
        if (nextPart !== 'owner') {
          instituteId = nextPart;
        }
      }
    }
    
    switch (httpMethod) {
      case 'GET':
        if (instituteId) {
          // Get single institute
          const result = await query('SELECT * FROM institutes WHERE id = $1', [instituteId]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/owner/')) {
          // Get institutes by owner
          const ownerId = path.split('/owner/')[1];
          const result = await query('SELECT * FROM institutes WHERE owner_id = $1', [ownerId]);
          return createResponse(200, result.rows);
        } else {
          // Get all institutes
          const result = await query('SELECT * FROM institutes ORDER BY institute_name');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { owner_id, institute_name, address, service_name, image_url } = JSON.parse(event.body);

        // Insert the institute first
        const insertResult = await query(
          `INSERT INTO institutes (owner_id, institute_name, address, service_name, image_url)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [owner_id, institute_name, address, service_name, image_url]
        );

        const newInstitute = insertResult.rows[0];

        // Try to geocode the address and create coordinates
        try {
          // Use OpenStreetMap Nominatim API for geocoding (free and no API key required)
          const encodedAddress = encodeURIComponent(address);
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=il&addressdetails=1`;

          const geocodingResponse = await fetch(nominatimUrl, {
            headers: {
              'User-Agent': 'FreezeFit-Location-Hub/1.0 (contact@freezefit.com)'
            }
          });

          if (geocodingResponse.ok) {
            const geocodingData = await geocodingResponse.json();

            if (geocodingData.length > 0) {
              const result = geocodingData[0];

              // Create coordinates for the new institute
              await query(
                `INSERT INTO institute_coordinates (institute_id, latitude, longitude, address_verified)
                 VALUES ($1, $2, $3, $4)`,
                [newInstitute.id, parseFloat(result.lat), parseFloat(result.lon), true]
              );

              console.log(`Coordinates created for institute ${newInstitute.id}`);
            } else {
              console.warn(`No geocoding results found for address: ${address}`);
            }
          } else {
            console.warn(`Geocoding API error: ${geocodingResponse.status} for address: ${address}`);
          }
        } catch (geocodingError) {
          console.warn('Geocoding failed for institute creation:', geocodingError.message);
          // Continue without coordinates - institute was created successfully
        }

        return createResponse(201, newInstitute);

      case 'PUT':
        if (!instituteId) {
          return createResponse(400, null, 'Institute ID is required');
        }
        const updates = JSON.parse(event.body);
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
          }
        });

        if (fields.length === 0) {
          return createResponse(400, null, 'No valid fields to update');
        }

        values.push(instituteId);
        const updateResult = await query(
          `UPDATE institutes SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        if (!instituteId) {
          return createResponse(400, null, 'Institute ID is required');
        }
        
        // Delete all related data first (in order to avoid foreign key constraints)
        try {
          // Delete appointments
          await query('DELETE FROM appointments WHERE institute_id = $1', [instituteId]);
          
          // Delete reviews
          await query('DELETE FROM reviews WHERE institute_id = $1', [instituteId]);
          
          // Delete services
          await query('DELETE FROM services WHERE institute_id = $1', [instituteId]);
          
          // Delete workshops
          await query('DELETE FROM workshops WHERE institute_id = $1', [instituteId]);
          
          // Delete business hours
          await query('DELETE FROM business_hours WHERE institute_id = $1', [instituteId]);
          
          // Delete coordinates
          await query('DELETE FROM institute_coordinates WHERE institute_id = $1', [instituteId]);
          
          // Delete gallery images
          await query('DELETE FROM gallery_images WHERE institute_id = $1', [instituteId]);
          
          // Delete therapists
          await query('DELETE FROM therapists WHERE institute_id = $1', [instituteId]);
          
          // Finally delete the institute
          const deleteResult = await query('DELETE FROM institutes WHERE id = $1', [instituteId]);
          return createResponse(200, { deleted: deleteResult.rowCount > 0 });
        } catch (error) {
          console.error('Error deleting institute:', error);
          return createResponse(500, null, 'Failed to delete institute: ' + error.message);
        }

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Institute API error:', error);
    return createResponse(500, null, error.message);
  }
};
