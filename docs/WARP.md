# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Big Mountain Club (BMC) is a static HTML/CSS/JavaScript website for an outdoor adventure club focused on mountaineering, climbing, skiing, and other outdoor activities. The site includes:
- Member showcase and club information
- Trip planning and management system  
- Trip logging with photo galleries
- Admin functionality for content management
- Comprehensive test suite

## Development Commands

### Local Development
```bash
# Start a simple local server (Python 3)
python3 -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if available)
npx serve .

# Using PHP (if available)
php -S localhost:8000
```

### Testing
```bash
# Open the test suite in browser after starting local server
open http://localhost:8000/test-suite.html

# Run basic file structure validation
find . -name "*.html" -exec echo "Found: {}" \;
find . -name "*.js" -exec echo "Found: {}" \;
find . -name "*.css" -exec echo "Found: {}" \;
```

### Deployment
The site is configured for GitHub Pages deployment with custom domain `bigmtnclub.com` (configured in CNAME file).

## Code Architecture

### Core Structure
- **Frontend Only**: Pure HTML/CSS/JavaScript with no backend dependencies
- **Client-Side Storage**: Uses localStorage for trip data persistence
- **Bootstrap Framework**: UI components and responsive design
- **Password Protection**: Simple password-based access control for admin features

### Key Components

#### TripLog Class (`trip-log.js`)
- **Data Management**: Handles CRUD operations for trip records
- **LocalStorage Integration**: Persists data using browser localStorage with key `bmcTrips`
- **Admin System**: Secret key sequence (`"admin"`) + password (`AdminBMC2024`) for elevated privileges
- **Filtering**: Dynamic trip filtering by date, location, and members
- **Modal System**: Detailed trip view with photo galleries

#### AddTrip Class (`add-trip.js`)
- **Form Management**: Handles trip creation and editing workflows
- **Authentication**: Password protection (`BigMountain2024`) for trip submission
- **Photo Handling**: Supports both file uploads and URL-based photo references
- **Edit Mode**: URL parameter-based editing (`?edit=<id>`) with session storage
- **Validation**: Form validation for required fields and data formatting

#### BMCTestSuite Class (`test-suite.js`)
- **Comprehensive Testing**: Automated testing framework for all site functionality
- **Category-Based**: Tests organized by Navigation, Trip Log, Admin, Security, etc.
- **Visual Feedback**: Real-time test progress with color-coded results
- **Logging**: Detailed test execution logs with timestamps

### Data Structure
Trip objects stored in localStorage follow this schema:
```javascript
{
  id: <timestamp>,
  location: "String",
  date: "YYYY-MM-DD",
  members: ["Array", "Of", "Names"],
  photos: ["array/of/urls"],
  description: "String",
  distance: "String with units",
  elevation: "String with units",
  duration: "String"
}
```

### Authentication Model
- **Two-Tier Security**: Separate passwords for trip submission and admin functions
- **Session Storage**: Authentication state maintained in browser session
- **No Backend**: All authentication happens client-side (suitable for small club use)

## Important Configuration

### Passwords
- Trip submission: `` (in `add-trip.js` line 4)
- Admin access: `` (in `trip-log.js` line 4)
- Admin unlock sequence: Type "admin" on trip-log page

### Sample Data
Default trip data is hardcoded in `trip-log.js` lines 32-88 and loaded when localStorage is empty.

### Image Assets
All images stored in `/imgs/` directory. Key images:
- `bmclogo.jpeg` - Site favicon and fallback image
- `BMC_Logo.png` - Alternative logo format
- Various trip photos referenced in sample data

## File Dependencies
- **Bootstrap 5.3.3**: CDN-loaded CSS and JS
- **Font Awesome 6.0**: Icons for UI elements
- **Google Fonts**: Space Grotesk font family
- **No Build Process**: Direct file serving, no compilation required

## Testing Notes
- Use `test-suite.html` for comprehensive functionality testing
- Tests cover navigation, CRUD operations, admin functions, and security
- Some tests may need local server to function properly due to CORS restrictions
- Test results include timing and detailed error reporting
