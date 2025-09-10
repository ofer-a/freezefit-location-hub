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

    // Single optimized query to get all institute data with related information
    const result = await query(`
      SELECT 
        i.id,
        i.institute_name,
        i.address,
        i.service_name,
        i.image_url,
        i.created_at,
        i.updated_at,
        
        -- Aggregated therapist data
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'id', t.id,
              'name', t.name,
              'experience', t.experience,
              'bio', t.bio,
              'image_url', t.image_url
            )
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as therapists,
        
        -- Aggregated review stats
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(AVG(r.rating), 4.5) as average_rating,
        
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
      LEFT JOIN therapists t ON i.id = t.institute_id
      LEFT JOIN reviews r ON i.id = r.institute_id
      LEFT JOIN business_hours bh ON i.id = bh.institute_id
      GROUP BY i.id, i.institute_name, i.address, i.service_name, i.image_url, i.created_at, i.updated_at
      ORDER BY i.institute_name
    `);

    // Transform the data to match the expected format
    const institutes = result.rows.map(row => ({
      id: row.id,
      institute_name: row.institute_name,
      address: row.address,
      service_name: row.service_name,
      image_url: row.image_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      therapists: row.therapists || [],
      review_count: parseInt(row.review_count) || 0,
      average_rating: parseFloat(row.average_rating) || 4.5,
      business_hours: row.business_hours || []
    }));

    return createResponse(200, institutes);

  } catch (error) {
    console.error('Detailed institutes API error:', error);
    return createResponse(500, null, error.message);
  }
};
