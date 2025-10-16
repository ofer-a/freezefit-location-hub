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
        
        console.log('[IMAGE-UPLOAD] Received upload request:');
        console.log('- Table:', table);
        console.log('- Record ID:', record_id);
        console.log('- MIME type:', mime_type);
        console.log('- Image data type:', typeof image_data);
        console.log('- Image data length:', image_data ? image_data.length : 0);
        console.log('- Image data starts with:', image_data ? image_data.substring(0, 50) : 'null');
        
        if (!table || !record_id || !image_data) {
          return createResponse(400, null, 'Missing required fields');
        }

        // First, check if image_data column exists
        const columnCheck = await query(
          `SELECT column_name 
           FROM information_schema.columns 
           WHERE table_name = $1 
           AND column_name = 'image_data'`,
          [table]
        );

        let updateResult;
        if (columnCheck.rows.length > 0) {
          // Image storage columns exist - use binary storage
          // Ensure image_data is a proper base64 string
          const cleanBase64 = image_data.replace(/^data:image\/[a-z]+;base64,/, '');
          const imageBuffer = Buffer.from(cleanBase64, 'base64');

          console.log('[IMAGE-UPLOAD] Processing image:');
          console.log('- Original length:', image_data.length);
          console.log('- Clean base64 length:', cleanBase64.length);
          console.log('- Buffer size:', imageBuffer.length);
          console.log('- First 10 bytes:', Array.from(imageBuffer.slice(0, 10)));
          console.log('- Is Buffer:', Buffer.isBuffer(imageBuffer));

          // Check if table has updated_at column
          const updatedAtCheck = await query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = 'updated_at'`,
            [table]
          );

          const updateFields = ['image_data = $1', 'image_mime_type = $2', 'image_url = $3'];
          const updateParams = [imageBuffer, mime_type, image_url];

          if (updatedAtCheck.rows.length > 0) {
            updateFields.push('updated_at = NOW()');
          }

          const queryStr = `UPDATE ${table} SET ${updateFields.join(', ')} WHERE id = $${updateParams.length + 1} RETURNING id`;

          updateResult = await query(queryStr, [...updateParams, record_id]);
        } else {
          // Fallback to image_url only (for backwards compatibility)
          console.warn(`Warning: image_data column not found in ${table}, falling back to image_url only`);

          // Check if table has updated_at column for fallback case
          const fallbackUpdatedAtCheck = await query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = 'updated_at'`,
            [table]
          );

          const fallbackUpdateFields = ['image_url = $1'];
          const fallbackParams = [image_url];

          if (fallbackUpdatedAtCheck.rows.length > 0) {
            fallbackUpdateFields.push('updated_at = NOW()');
          }

          const fallbackQueryStr = `UPDATE ${table} SET ${fallbackUpdateFields.join(', ')} WHERE id = $${fallbackParams.length + 1} RETURNING *`;

          updateResult = await query(fallbackQueryStr, [...fallbackParams, record_id]);
        }

        if (updateResult.rows.length === 0) {
          return createResponse(404, null, 'Record not found');
        }

        // Return success without the binary data (to avoid JSON serialization issues)
        return createResponse(200, { 
          id: updateResult.rows[0].id, 
          updated: true 
        });

      case 'GET': {
        // Handle image retrieval
        // Parse path: /.netlify/functions/image-upload/{table}/{record_id}
        const pathParts = event.path.split('/').filter(p => p);
        
        // pathParts should be: ['.netlify', 'functions', 'image-upload', 'table', 'record_id']
        // or in dev: ['image-upload', 'table', 'record_id']
        
        let getTable, getRecordId;
        
        if (pathParts.length >= 3) {
          // Find the index of 'image-upload'
          const imageUploadIndex = pathParts.findIndex(p => p === 'image-upload');
          if (imageUploadIndex >= 0 && pathParts.length > imageUploadIndex + 2) {
            getTable = pathParts[imageUploadIndex + 1];
            getRecordId = pathParts[imageUploadIndex + 2];
          }
        }
        
        if (!getTable || !getRecordId) {
          console.error('Failed to parse path:', event.path, 'pathParts:', pathParts);
          return createResponse(400, null, 'Invalid path format. Expected: /image-upload/{table}/{record_id}');
        }
        
        try {
          const result = await query(
            `SELECT image_data, image_mime_type, image_url FROM ${getTable} WHERE id = $1`,
            [getRecordId]
          );

          if (result.rows.length === 0) {
            return createResponse(404, null, 'Record not found');
          }

          const row = result.rows[0];
          
          // If image_data exists, return it as base64
          if (row.image_data) {
            const mimeType = row.image_mime_type || 'image/jpeg';
            // Ensure we have a proper Buffer and convert to base64
            const imageBuffer = Buffer.isBuffer(row.image_data) ? row.image_data : Buffer.from(row.image_data);
            const base64Data = imageBuffer.toString('base64');

            console.log('[IMAGE-RETRIEVE] Returning image:');
            console.log('- MIME type:', mimeType);
            console.log('- Buffer size:', imageBuffer.length);
            console.log('- Base64 length:', base64Data.length);
            console.log('- First 50 chars:', base64Data.substring(0, 50));

            return createResponse(200, base64Data);
          }
          
          // If no image_data but image_url exists, throw error to trigger frontend fallback
          if (row.image_url) {
            return createResponse(404, null, 'Image not found');
          }
          
          return createResponse(404, null, 'Image not found');
        } catch (error) {
          console.error('Error fetching image:', error);
          return createResponse(500, null, `Failed to retrieve image: ${error.message}`);
        }
      }

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Image upload API error:', error);
    return createResponse(500, null, error.message);
  }
};
