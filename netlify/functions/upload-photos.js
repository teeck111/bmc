const multipart = require('lambda-multipart-parser');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-club-password',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Verify club password
  const clubPassword = event.headers['x-club-password'];
  if (clubPassword !== process.env.CLUB_PASSWORD) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid club password' })
    };
  }

  try {
    console.log(`Function started: ${new Date().toISOString()}`);
    console.log(`Request size: ${Buffer.byteLength(event.body || '', 'utf8')} bytes`);
    
    let photos = [];
    
    // Handle multipart form data (file uploads)
    if (event.headers['content-type'] && event.headers['content-type'].includes('multipart/form-data')) {
      console.log('Parsing multipart data...');
      const result = await multipart.parse(event);
      photos = result.files || [];
    } else {
      // Handle JSON data (base64 images)
      console.log('Parsing JSON data...');
      const body = JSON.parse(event.body);
      photos = body.photos || [];
    }

    if (photos.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No photos provided' })
      };
    }

    const uploadedUrls = [];
    const errors = [];

    // Upload each photo
    for (let i = 0; i < photos.length; i++) {
      try {
        const photo = photos[i];
        let fileName, fileContent;

        // Handle file upload vs base64
        if (photo.filename) {
          // Multipart file upload
          fileName = `photos/${Date.now()}-${i}-${photo.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          fileContent = photo.content.toString('base64');
        } else {
          // Base64 data
          fileName = `photos/${Date.now()}-${i}-${photo.name || 'upload.jpg'}`;
          fileContent = photo.data; // Already base64
        }

        // More accurate file size calculation
        const fileSizeBytes = Buffer.byteLength(fileContent, 'base64');
        console.log(`Processing ${photo.filename || photo.name}: ${(fileSizeBytes/1024/1024).toFixed(2)}MB`);
        
        // Check Netlify function payload limit (6MB) - this is the real constraint
        if (fileSizeBytes > 6 * 1024 * 1024) {
          const sizeMB = (fileSizeBytes/1024/1024).toFixed(1);
          errors.push(`File ${photo.filename || photo.name} too large (${sizeMB}MB). Netlify functions limited to 6MB.`);
          console.warn(`Skipping large file: ${photo.filename || photo.name} (${sizeMB}MB)`);
          continue;
        }

        // Upload to GitHub
        const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${fileName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'BMC-Netlify-Function'
          },
          body: JSON.stringify({
            message: `Add photo: ${photo.filename || photo.name || 'upload.jpg'}`,
            content: fileContent
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        const imageUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/master/${fileName}`;
        uploadedUrls.push(imageUrl);
        console.log(`Photo uploaded successfully: ${imageUrl}`);

      } catch (error) {
        console.error(`Error uploading photo ${i}:`, error);
        errors.push(`Photo ${i + 1}: ${error.message}`);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        uploadedUrls: uploadedUrls,
        uploadedCount: uploadedUrls.length,
        totalCount: photos.length,
        errors: errors
      })
    };

  } catch (error) {
    console.error('Error processing photo upload:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process photos',
        details: error.message 
      })
    };
  }
};