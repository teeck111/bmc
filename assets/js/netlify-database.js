// Netlify Functions Database Manager
// Handles all API calls through Netlify serverless functions

console.log('Loading Netlify database manager...');

// Club password for all API calls
const CLUB_PASSWORD = 'BigMountain2024';

class NetlifyDatabaseManager {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        console.log('Netlify Database Manager initialized');
        console.log('API Base URL:', this.baseUrl);
    }

    // Detect if we're in development or production
    getBaseUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8888/.netlify/functions'; // Netlify dev server
        } else {
            return '/.netlify/functions'; // Production Netlify
        }
    }

    // Create headers with club password
    getHeaders(isMultipart = false) {
        const headers = {
            'x-club-password': CLUB_PASSWORD
        };
        
        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }
        
        return headers;
    }

    // Get all trips
    async getTrips() {
        try {
            console.log('Loading trips from Netlify function...');
            
            const response = await fetch(`${this.baseUrl}/get-trips`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Loaded ${data.trips.length} trips from Netlify`);
            
            return data.trips || [];
        } catch (error) {
            console.error('Error loading trips from Netlify:', error);
            // Fallback to localStorage if Netlify fails
            return this.getTripsFromLocalStorage();
        }
    }

    // Add new trip
    async addTrip(tripData) {
        try {
            console.log('Adding trip via Netlify function:', tripData.location);
            
            const response = await fetch(`${this.baseUrl}/add-trip`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(tripData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            console.log('Trip added successfully:', data.trip.location);
            
            return data.trip;
        } catch (error) {
            console.error('Error adding trip via Netlify:', error);
            // Fallback to localStorage
            return this.addTripToLocalStorage(tripData);
        }
    }

    // Upload single photo
    async uploadPhoto(file, tripId = null) {
        try {
            console.log(`Uploading photo via Netlify: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
            
            // Convert file to base64
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(file);
            });

            const response = await fetch(`${this.baseUrl}/upload-photos`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    photos: [{
                        name: file.name,
                        data: base64
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            console.log('Upload response data:', data);
            
            if (data.uploadedUrls && data.uploadedUrls.length > 0) {
                console.log('Photo uploaded successfully:', data.uploadedUrls[0]);
                return data.uploadedUrls[0];
            } else {
                console.error('Upload response missing URLs:', data);
                if (data.errors && data.errors.length > 0) {
                    throw new Error(`Upload errors: ${data.errors.join(', ')}`);
                } else {
                    throw new Error('No photo URL returned - check Netlify function logs');
                }
            }
        } catch (error) {
            console.error('Error uploading photo via Netlify:', error);
            // In local development, create a local blob URL as fallback
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('Creating local blob URL for development...');
                const blobUrl = URL.createObjectURL(file);
                return blobUrl;
            }
            return null;
        }
    }

    // Delete trip
    async deleteTrip(tripId) {
        try {
            console.log('Deleting trip via Netlify function:', tripId);
            
            const response = await fetch(`${this.baseUrl}/delete-trip`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                body: JSON.stringify({ id: tripId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            console.log('Trip deleted successfully:', tripId);
            
            return data.success;
        } catch (error) {
            console.error('Error deleting trip via Netlify:', error);
            // Fallback to localStorage
            return this.deleteTripFromLocalStorage(tripId);
        }
    }

    // Update trip
    async updateTrip(tripId, tripData) {
        try {
            console.log('Updating trip via Netlify function:', tripId, tripData.location);
            
            const response = await fetch(`${this.baseUrl}/update-trip`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ id: tripId, ...tripData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            console.log('Trip updated successfully:', data.trip.location);
            
            return data.trip;
        } catch (error) {
            console.error('Error updating trip via Netlify:', error);
            // Fallback to localStorage
            return this.updateTripInLocalStorage(tripId, tripData);
        }
    }

    // Upload multiple photos with progress
    async uploadPhotos(files, tripId, onProgress = null) {
        if (!files || files.length === 0) return [];
        
        console.log(`Starting upload of ${files.length} photos via Netlify...`);
        
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Uploading photo ${i + 1}/${files.length}: ${file.name}`);
            
            const url = await this.uploadPhoto(file, tripId);
            
            if (onProgress) {
                onProgress(i + 1, files.length, url !== null);
            }
            
            if (url) {
                results.push(url);
            }
        }
        
        console.log(`Successfully uploaded ${results.length}/${files.length} photos via Netlify`);
        return results;
    }

    // LocalStorage fallback methods
    getTripsFromLocalStorage() {
        const stored = localStorage.getItem('bmcTrips');
        if (stored) {
            const trips = JSON.parse(stored);
            console.log(`Loaded ${trips.length} trips from localStorage fallback`);
            return trips;
        }
        return this.getDefaultTrips();
    }

    addTripToLocalStorage(tripData) {
        const trips = this.getTripsFromLocalStorage();
        const newTrip = {
            ...tripData,
            id: Date.now().toString(),
            dateAdded: new Date().toISOString()
        };
        trips.unshift(newTrip);
        localStorage.setItem('bmcTrips', JSON.stringify(trips));
        console.log('Trip saved to localStorage fallback');
        return newTrip;
    }

    deleteTripFromLocalStorage(tripId) {
        const trips = this.getTripsFromLocalStorage();
        const filteredTrips = trips.filter(t => t.id.toString() !== tripId.toString());
        localStorage.setItem('bmcTrips', JSON.stringify(filteredTrips));
        console.log('Trip deleted from localStorage fallback:', tripId);
        return true;
    }

    updateTripInLocalStorage(tripId, tripData) {
        const trips = this.getTripsFromLocalStorage();
        const tripIndex = trips.findIndex(t => t.id.toString() === tripId.toString());
        
        if (tripIndex !== -1) {
            const updatedTrip = {
                ...trips[tripIndex],
                ...tripData,
                id: tripId,
                dateModified: new Date().toISOString()
            };
            trips[tripIndex] = updatedTrip;
            localStorage.setItem('bmcTrips', JSON.stringify(trips));
            console.log('Trip updated in localStorage fallback:', tripId);
            return updatedTrip;
        } else {
            console.error('Trip not found for update in localStorage:', tripId);
            return null;
        }
    }

    getDefaultTrips() {
        return [
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
    }
}

// Global database manager instance
let netlifyDbManager;
console.log('Creating Netlify Database Manager...');
try {
    netlifyDbManager = new NetlifyDatabaseManager();
    console.log('Netlify Database Manager initialized successfully');
} catch (error) {
    console.error('Error initializing Netlify Database Manager:', error);
    netlifyDbManager = null;
}

// Make it available globally (compatible with existing code)
if (typeof window !== 'undefined') {
    window.dbManager = netlifyDbManager;
    window.netlifyDbManager = netlifyDbManager;
    console.log('Netlify Database Manager attached to window object');
}