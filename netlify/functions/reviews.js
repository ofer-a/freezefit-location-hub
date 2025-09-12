// Netlify Function for reviews API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    // Extract review ID from path if pathParameters.id is not available
    let reviewId = pathParameters?.id;
    if (!reviewId && path.includes('/reviews/') && !path.includes('/institute/') && !path.includes('/user/')) {
      const pathParts = path.split('/');
      const reviewsIndex = pathParts.indexOf('reviews');
      if (reviewsIndex !== -1 && pathParts[reviewsIndex + 1]) {
        const nextPart = pathParts[reviewsIndex + 1];
        if (nextPart !== 'institute' && nextPart !== 'user') {
          reviewId = nextPart;
        }
      }
    }
    
    switch (httpMethod) {
      case 'GET':
        if (reviewId) {
          // Get single review
          const result = await query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/institute/')) {
          // Get reviews by institute with user names
          const instituteId = path.split('/institute/')[1];
          const result = await query(
            `SELECT r.*, p.full_name as user_name 
             FROM reviews r 
             JOIN profiles p ON r.user_id = p.id 
             WHERE r.institute_id = $1 
             ORDER BY r.review_date DESC`,
            [instituteId]
          );
          return createResponse(200, result.rows);
        } else if (path.includes('/user/')) {
          // Get reviews by user
          const userId = path.split('/user/')[1];
          const result = await query(
            'SELECT * FROM reviews WHERE user_id = $1 ORDER BY review_date DESC',
            [userId]
          );
          return createResponse(200, result.rows);
        } else {
          // Get all reviews
          const result = await query('SELECT * FROM reviews ORDER BY review_date DESC');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { user_id, institute_id, rating, content, review_date } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO reviews (user_id, institute_id, rating, content, review_date) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [user_id, institute_id, rating, content, review_date || new Date().toISOString().split('T')[0]]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!reviewId) {
          return createResponse(400, null, 'Review ID is required');
        }
        const updates = JSON.parse(event.body);
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined && key !== 'id' && key !== 'created_at') {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
          }
        });

        if (fields.length === 0) {
          return createResponse(400, null, 'No valid fields to update');
        }

        values.push(reviewId);
        const updateResult = await query(
          `UPDATE reviews SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        if (!reviewId) {
          return createResponse(400, null, 'Review ID is required');
        }
        const deleteResult = await query('DELETE FROM reviews WHERE id = $1', [reviewId]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Review API error:', error);
    return createResponse(500, null, error.message);
  }
};
