// Netlify Function for image upload and retrieval
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    switch (httpMethod) {
      case 'POST':
        // Handle image upload
        const { table, record_id, image_data, mime_type, image_url } = JSON.parse(event.body);
        
        if (!table || !record_id || !image_data) {
          return createResponse(400, null, 'Missing required fields');
        }

        // Update the record with image data
        const updateResult = await query(
          `UPDATE ${table} SET image_data = $1, image_mime_type = $2, image_url = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
          [Buffer.from(image_data, 'base64'), mime_type, image_url, record_id]
        );

        if (updateResult.rows.length === 0) {
          return createResponse(404, null, 'Record not found');
        }

        return createResponse(200, updateResult.rows[0]);

      case 'GET':
        // Handle image retrieval
        if (pathParameters && pathParameters.id) {
          const table = path.split('/')[1]; // Extract table name from path
          const recordId = pathParameters.id;
          
          const result = await query(
            `SELECT image_data, image_mime_type FROM ${table} WHERE id = $1`,
            [recordId]
          );

          if (result.rows.length === 0 || !result.rows[0].image_data) {
            return createResponse(404, null, 'Image not found');
          }

          const imageData = result.rows[0].image_data;
          const mimeType = result.rows[0].image_mime_type || 'image/jpeg';

          return {
            statusCode: 200,
            headers: {
              'Content-Type': mimeType,
              'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: Buffer.from(imageData).toString('base64'),
            isBase64Encoded: true
          };
        }
        return createResponse(400, null, 'Image ID required');

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Image upload API error:', error);
    return createResponse(500, null, error.message);
  }
};
