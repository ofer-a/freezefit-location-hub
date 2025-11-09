// Optimized Netlify Function for institutes with all related data
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    if (event.httpMethod !== 'GET') {
      return createResponse(405, null, 'Method not allowed');
    }

    // Parse query parameters for pagination to keep response under 6MB limit
    const queryParams = new URLSearchParams(event.queryStringParameters || '');
    const limit = parseInt(queryParams.get('limit') || '5'); // Default to 5 institutes per request to stay under 6MB
    const offset = parseInt(queryParams.get('offset') || '0');

    // Single optimized query to get all institute data with related information
    // Using pagination to keep response size under Netlify's 6MB limit
    const result = await query(`
      SELECT 
        i.id,
        i.institute_name,
        i.address,
        i.service_name,
        i.image_url,
        ENCODE(i.image_data, 'base64') as image_data,
        i.image_mime_type,
        i.created_at,
        i.updated_at,
        
        -- Institute coordinates
        ic.latitude,
        ic.longitude,
        
        -- Aggregated therapist data
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'id', t.id,
              'name', t.name,
              'experience', t.experience,
              'bio', t.bio,
              'image_url', t.image_url,
              'image_data', ENCODE(t.image_data, 'base64'),
              'image_mime_type', t.image_mime_type
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as therapists,
        
        -- Aggregated review stats
        COUNT(DISTINCT r.id) as review_count,
        CASE 
          WHEN COUNT(DISTINCT r.id) = 0 THEN NULL
          ELSE AVG(r.rating)
        END as average_rating,
        
        -- Aggregated business hours
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'day_of_week', bh.day_of_week,
              'open_time', bh.open_time,
              'close_time', bh.close_time,
              'is_open', bh.is_open
            )
          ) FILTER (WHERE bh.id IS NOT NULL), 
          '[]'
        ) as business_hours
        
      FROM institutes i
      LEFT JOIN institute_coordinates ic ON i.id = ic.institute_id
      LEFT JOIN therapists t ON i.id = t.institute_id
      LEFT JOIN reviews r ON i.id = r.institute_id
      LEFT JOIN business_hours bh ON i.id = bh.institute_id
      GROUP BY i.id, i.institute_name, i.address, i.service_name, i.image_url, i.image_data, i.image_mime_type, i.created_at, i.updated_at, ic.latitude, ic.longitude
      ORDER BY i.institute_name
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count for pagination info
    const countResult = await query('SELECT COUNT(*) as total FROM institutes');
    const total = parseInt(countResult.rows[0].total);

    // Transform the data to match the expected format
    const institutes = result.rows.map(row => ({
      id: row.id,
      institute_name: row.institute_name,
      address: row.address,
      service_name: row.service_name,
      image_url: row.image_url,
      image_data: row.image_data,
      image_mime_type: row.image_mime_type,
      created_at: row.created_at,
      updated_at: row.updated_at,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      therapists: row.therapists || [],
      review_count: parseInt(row.review_count) || 0,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : null,
      business_hours: row.business_hours || []
    }));

    return createResponse(200, {
      institutes,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Detailed institutes API error:', error);
    return createResponse(500, null, error.message);
  }
};
