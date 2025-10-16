// Netlify Function for gallery images API
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
          // Get single gallery image
          const result = await query('SELECT * FROM gallery_images WHERE id = $1', [pathParameters.id]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/institute/')) {
          // Get gallery images by institute
          const instituteId = path.split('/institute/')[1];
          const result = await query(
            'SELECT * FROM gallery_images WHERE institute_id = $1 ORDER BY created_at DESC',
            [instituteId]
          );
          return createResponse(200, result.rows);
        } else {
          // Get all gallery images
          const result = await query('SELECT * FROM gallery_images ORDER BY created_at DESC');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { institute_id, image_url, category } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO gallery_images (institute_id, image_url, category) 
           VALUES ($1, $2, $3) RETURNING *`,
          [institute_id, image_url, category]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!pathParameters || !pathParameters.id) {
          return createResponse(400, null, 'Gallery image ID is required');
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

        values.push(pathParameters.id);
        const updateResult = await query(
          `UPDATE gallery_images SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        // Extract ID from path if pathParameters.id is not available
        let imageId = pathParameters?.id;
        if (!imageId && path) {
          const pathParts = path.split('/');
          imageId = pathParts[pathParts.length - 1];
        }
        
        if (!imageId) {
          return createResponse(400, null, 'Gallery image ID is required');
        }

        // Check if table has image_data column and clear it before deleting
        const columnCheck = await query(
          `SELECT column_name FROM information_schema.columns WHERE table_name = 'gallery_images' AND column_name = 'image_data'`
        );

        if (columnCheck.rows.length > 0) {
          // Clear image data first (in case there are foreign key constraints)
          await query('UPDATE gallery_images SET image_data = NULL, image_mime_type = NULL WHERE id = $1', [imageId]);
        }

        const deleteResult = await query('DELETE FROM gallery_images WHERE id = $1', [imageId]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Gallery API error:', error);
    return createResponse(500, null, error.message);
  }
};
