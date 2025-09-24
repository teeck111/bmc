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
    const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/trips.json`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BMC-Netlify-Function'
      }
    });

    if (response.status === 404) {
      // File doesn't exist yet, return default trips
      const defaultTrips = [
        {
          id: "1",
          location: "Mt Holy Cross",
          date: "2024-08-15",
          members: ["Tyler", "Brendan", "Sarah", "Mike"],
          photos: ["assets/images/hc_summit.jpg", "assets/images/hc_group.JPG", "assets/images/hc_trees.JPG"],
          description: "Epic 4-hour ridge scramble to one of Colorado's most challenging 14ers. Perfect weather and incredible views!",
          distance: "11 miles",
          elevation: "5,600 ft gain",
          duration: "8 hours",
          dateAdded: "2024-08-15T10:00:00.000Z"
        },
        {
          id: "2",
          location: "Gore Range Backpacking",
          date: "2024-07-22",
          members: ["Alex", "Jordan", "Casey", "Morgan", "Sam"],
          photos: ["assets/images/gorebackpacking.jpeg"],
          description: "3-day backpacking adventure in the Gore Range with multiple summit attempts. Amazing alpine lakes and ridge walks.",
          distance: "25 miles",
          elevation: "4,200 ft gain",
          duration: "3 days",
          dateAdded: "2024-07-22T10:00:00.000Z"
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ trips: defaultTrips })
      };
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const fileData = await response.json();
    const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ trips: content.trips || [] })
    };

  } catch (error) {
    console.error('Error loading trips:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to load trips' })
    };
  }
};