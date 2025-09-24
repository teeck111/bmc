exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-club-password',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only accept DELETE requests
  if (event.httpMethod !== 'DELETE') {
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
    const { id: tripId } = JSON.parse(event.body);
    
    if (!tripId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Trip ID is required' })
      };
    }

    // Get current trips file
    let currentTrips = [];
    let sha = null;
    
    try {
      const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/trips.json`, {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BMC-Netlify-Function'
        }
      });
      
      if (response.ok) {
        const fileData = await response.json();
        const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
        currentTrips = content.trips || [];
        sha = fileData.sha;
      } else {
        throw new Error('Trips file not found');
      }
    } catch (error) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Trips file not found' })
      };
    }

    // Find and remove the trip
    const originalLength = currentTrips.length;
    currentTrips = currentTrips.filter(trip => trip.id.toString() !== tripId.toString());
    
    if (currentTrips.length === originalLength) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Trip not found' })
      };
    }

    const updatedContent = {
      trips: currentTrips,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
      description: "Big Mountain Club trip data"
    };

    // Update file on GitHub
    const updateResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/trips.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'BMC-Netlify-Function'
      },
      body: JSON.stringify({
        message: `Delete trip with ID: ${tripId}`,
        content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64'),
        sha: sha
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`GitHub update failed: ${updateResponse.status} - ${errorText}`);
    }

    console.log(`Successfully deleted trip: ${tripId}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Trip deleted successfully',
        deletedId: tripId
      })
    };

  } catch (error) {
    console.error('Error deleting trip:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to delete trip',
        details: error.message 
      })
    };
  }
};