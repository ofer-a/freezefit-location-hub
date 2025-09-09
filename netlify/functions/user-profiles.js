// Netlify Function for extended user profiles API
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
        if (pathParameters && pathParameters.id) {
          // Get extended profile for user
          const result = await query(
            `SELECT 
              p.id, p.email, p.full_name, p.role, p.age, p.gender, p.address as profile_address, p.image_url,
              upe.phone, upe.address, upe.emergency_contact_name, upe.emergency_contact_phone, upe.medical_conditions
             FROM profiles p
             LEFT JOIN user_profiles_extended upe ON p.id = upe.user_id
             WHERE p.id = $1`,
            [pathParameters.id]
          );
          return createResponse(200, result.rows[0] || null);
        }
        return createResponse(400, null, 'User ID required');

      case 'POST':
        const { user_id, phone, address, emergency_contact_name, emergency_contact_phone, medical_conditions } = JSON.parse(event.body);
        
        if (!user_id) {
          return createResponse(400, null, 'User ID required');
        }

        const insertResult = await query(
          `INSERT INTO user_profiles_extended (user_id, phone, address, emergency_contact_name, emergency_contact_phone, medical_conditions) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (user_id) 
           DO UPDATE SET 
             phone = EXCLUDED.phone,
             address = EXCLUDED.address,
             emergency_contact_name = EXCLUDED.emergency_contact_name,
             emergency_contact_phone = EXCLUDED.emergency_contact_phone,
             medical_conditions = EXCLUDED.medical_conditions,
             updated_at = NOW()
           RETURNING *`,
          [user_id, phone, address, emergency_contact_name, emergency_contact_phone, medical_conditions]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          const body = JSON.parse(event.body);
          const fields = [];
          const values = [];
          let paramCount = 1;

          // Only update extended profile fields
          const allowedFields = ['phone', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'medical_conditions'];
          
          Object.entries(body).forEach(([key, value]) => {
            if (value !== undefined && allowedFields.includes(key)) {
              fields.push(`${key} = $${paramCount}`);
              values.push(value);
              paramCount++;
            }
          });

          if (fields.length === 0) {
            return createResponse(400, null, 'No valid fields to update');
          }

          values.push(pathParameters.id);
          const updateResult = await query(
            `UPDATE user_profiles_extended SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = $${paramCount} RETURNING *`,
            values
          );
          
          if (updateResult.rows.length === 0) {
            // Create new record if it doesn't exist
            const createResult = await query(
              `INSERT INTO user_profiles_extended (user_id, ${Object.keys(body).filter(k => allowedFields.includes(k)).join(', ')}) 
               VALUES ($1, ${Object.keys(body).filter(k => allowedFields.includes(k)).map((_, i) => `$${i + 2}`).join(', ')}) 
               RETURNING *`,
              [pathParameters.id, ...Object.values(body).filter((_, i) => allowedFields.includes(Object.keys(body)[i]))]
            );
            return createResponse(201, createResult.rows[0]);
          }
          
          return createResponse(200, updateResult.rows[0]);
        }
        return createResponse(400, null, 'User ID required');

      default:
        return createResponse(405, null, 'Method not allowed');
    }

  } catch (error) {
    console.error('User profiles API error:', error);
    return createResponse(500, null, error.message);
  }
};
