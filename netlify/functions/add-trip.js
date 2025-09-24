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
    const tripData = JSON.parse(event.body);
    
    // Create new trip with server-generated ID
    const newTrip = {
      ...tripData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString()
    };

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
      }
    } catch (error) {
      // File doesn't exist, will be created
      console.log('Creating new trips file');
    }

    // Add new trip to beginning of array
    currentTrips.unshift(newTrip);

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
        message: `Add new trip: ${newTrip.location}`,
        content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64'),
        sha: sha
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`GitHub update failed: ${updateResponse.status} - ${errorText}`);
    }

    console.log(`Successfully added trip: ${newTrip.location}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        trip: newTrip,
        message: 'Trip added successfully'
      })
    };

  } catch (error) {
    console.error('Error adding trip:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to add trip',
        details: error.message 
      })
    };
  }
};