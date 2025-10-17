// Netlify Function for profiles API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    switch (httpMethod) {
      case 'GET':
        // Extract profile ID from path
        let profileId = pathParameters?.id;
        if (!profileId && path) {
          const pathParts = path.split('/');
          const lastPart = pathParts[pathParts.length - 1];
          // Check if it's a valid UUID (profile ID)
          if (lastPart && lastPart.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            profileId = lastPart;
          }
        }
        
        if (profileId) {
          // Get single profile
          const result = await query('SELECT * FROM profiles WHERE id = $1', [profileId]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/email/')) {
          // Get profile by email
          const email = path.split('/email/')[1];
          const result = await query('SELECT * FROM profiles WHERE email = $1', [email]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/role/')) {
          // Get profiles by role
          const role = path.split('/role/')[1];
          const result = await query('SELECT * FROM profiles WHERE role = $1 ORDER BY full_name', [role]);
          return createResponse(200, result.rows);
        } else {
          // Get all profiles
          const result = await query('SELECT * FROM profiles ORDER BY full_name');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { email, full_name, role, age, gender, address, image_url } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO profiles (email, full_name, role, age, gender, address, image_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [email, full_name, role || 'customer', age, gender, address, image_url]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        // Extract profile ID from path
        let updateProfileId = pathParameters?.id;
        if (!updateProfileId && path) {
          const pathParts = path.split('/');
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart && lastPart.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            updateProfileId = lastPart;
          }
        }
        
        if (!updateProfileId) {
          return createResponse(400, null, 'Profile ID is required');
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

        values.push(updateProfileId);
        const updateResult = await query(
          `UPDATE profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        let deleteProfileId = pathParameters?.id;
        if (!deleteProfileId && path) {
          const pathParts = path.split('/');
          deleteProfileId = pathParts[pathParts.length - 1];
        }
        
        if (!deleteProfileId) {
          return createResponse(400, null, 'Profile ID is required');
        }
        
        // Check if profile has any appointments, reviews, or other data
        const appointmentsCheck = await query(
          'SELECT COUNT(*) as count FROM appointments WHERE user_id = $1',
          [deleteProfileId]
        );
        
        const reviewsCheck = await query(
          'SELECT COUNT(*) as count FROM reviews WHERE user_id = $1',
          [deleteProfileId]
        );
        
        const hasAppointments = parseInt(appointmentsCheck.rows[0].count) > 0;
        const hasReviews = parseInt(reviewsCheck.rows[0].count) > 0;
        
        if (hasAppointments || hasReviews) {
          // Deactivate instead of delete
          const deactivateResult = await query(
            'UPDATE profiles SET is_active = false, deactivated_at = NOW() WHERE id = $1 RETURNING *',
            [deleteProfileId]
          );
          return createResponse(200, { 
            deactivated: deactivateResult.rowCount > 0,
            deleted: false,
            hasAppointments,
            hasReviews,
            message: 'Profile deactivated due to existing data'
          });
        } else {
          // Safe to delete
          const deleteResult = await query('DELETE FROM profiles WHERE id = $1', [deleteProfileId]);
          return createResponse(200, { 
            deleted: deleteResult.rowCount > 0,
            deactivated: false,
            hasAppointments: false,
            hasReviews: false,
            message: 'Profile deleted successfully'
          });
        }

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Profile API error:', error);
    return createResponse(500, null, error.message);
  }
};
