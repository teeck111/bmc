// GitHub + Imgur Database Manager
// Simple, reliable alternative to Firebase

console.log('Loading GitHub + Imgur database manager...');

// Configuration - these need to be set up
const CONFIG = {
    github: {
        owner: 'teeck111', // Your GitHub username
        repo: 'bmc',       // Your repository name
        token: null,       // Will be set dynamically
        dataFile: 'data/trips.json'
    },
    imgur: {
        clientId: null     // Will be set dynamically
    }
};

class GitHubDatabaseManager {
    constructor() {
        this.useGitHub = true; // Always try GitHub first
        this.dataCache = null;
        this.lastCacheTime = null;
        console.log('GitHub Database Manager initialized');
    }

    // Set API credentials (called after page load)
    setCredentials(githubToken, imgurClientId) {
        CONFIG.github.token = githubToken;
        CONFIG.imgur.clientId = imgurClientId;
        console.log('API credentials configured');
    }

    // Get all trips
    async getTrips() {
        if (this.useGitHub && CONFIG.github.token) {
            try {
                return await this.getTripsFromGitHub();
            } catch (error) {
                console.error('Error loading from GitHub:', error);
                console.log('Falling back to localStorage...');
                return this.getTripsFromLocalStorage();
            }
        } else {
            return this.getTripsFromLocalStorage();
        }
    }

    async getTripsFromGitHub() {
        console.log('Loading trips from GitHub...');
        
        // Check cache first (valid for 2 minutes)
        if (this.dataCache && this.lastCacheTime && 
            (Date.now() - this.lastCacheTime) < 120000) {
            console.log('Using cached data');
            return this.dataCache.trips;
        }

        const url = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/contents/${CONFIG.github.dataFile}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${CONFIG.github.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const fileData = await response.json();
        const content = JSON.parse(atob(fileData.content));
        
        // Cache the data
        this.dataCache = content;
        this.lastCacheTime = Date.now();
        
        console.log(`Loaded ${content.trips.length} trips from GitHub`);
        return content.trips;
    }

    // Add new trip
    async addTrip(tripData) {
        const newTrip = {
            ...tripData,
            id: Date.now().toString(),
            dateAdded: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        if (this.useGitHub && CONFIG.github.token) {
            try {
                await this.addTripToGitHub(newTrip);
                return newTrip;
            } catch (error) {
                console.error('Error adding trip to GitHub:', error);
                console.log('Falling back to localStorage...');
                return this.addTripToLocalStorage(newTrip);
            }
        } else {
            return this.addTripToLocalStorage(newTrip);
        }
    }

    async addTripToGitHub(newTrip) {
        console.log('Adding trip to GitHub:', newTrip.location);
        
        // Get current data
        const url = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/contents/${CONFIG.github.dataFile}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${CONFIG.github.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch current data: ${response.status}`);
        }

        const fileData = await response.json();
        const currentContent = JSON.parse(atob(fileData.content));
        
        // Add new trip to beginning of array
        currentContent.trips.unshift(newTrip);
        currentContent.lastUpdated = new Date().toISOString();
        
        // Update file on GitHub
        const updateResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${CONFIG.github.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add new trip: ${newTrip.location}`,
                content: btoa(JSON.stringify(currentContent, null, 2)),
                sha: fileData.sha
            })
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update GitHub: ${updateResponse.status}`);
        }

        // Clear cache so next request gets fresh data
        this.dataCache = null;
        this.lastCacheTime = null;
        
        console.log('Trip added to GitHub successfully');
    }

    // Update existing trip
    async updateTrip(tripId, tripData) {
        const updatedData = {
            ...tripData,
            id: tripId,
            dateModified: new Date().toISOString()
        };

        if (this.useGitHub && CONFIG.github.token) {
            try {
                await this.updateTripInGitHub(tripId, updatedData);
                return updatedData;
            } catch (error) {
                console.error('Error updating trip in GitHub:', error);
                return this.updateTripInLocalStorage(tripId, updatedData);
            }
        } else {
            return this.updateTripInLocalStorage(tripId, updatedData);
        }
    }

    async updateTripInGitHub(tripId, updatedTrip) {
        console.log('Updating trip in GitHub:', tripId);
        
        // Get current data
        const url = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/contents/${CONFIG.github.dataFile}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${CONFIG.github.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch current data: ${response.status}`);
        }

        const fileData = await response.json();
        const currentContent = JSON.parse(atob(fileData.content));
        
        // Find and update the trip
        const tripIndex = currentContent.trips.findIndex(t => t.id.toString() === tripId.toString());
        
        if (tripIndex === -1) {
            throw new Error('Trip not found for updating');
        }

        currentContent.trips[tripIndex] = updatedTrip;
        currentContent.lastUpdated = new Date().toISOString();
        
        // Update file on GitHub
        const updateResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${CONFIG.github.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update trip: ${updatedTrip.location}`,
                content: btoa(JSON.stringify(currentContent, null, 2)),
                sha: fileData.sha
            })
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update GitHub: ${updateResponse.status}`);
        }

        // Clear cache
        this.dataCache = null;
        this.lastCacheTime = null;
        
        console.log('Trip updated in GitHub successfully');
    }

    // Delete trip
    async deleteTrip(tripId) {
        if (this.useGitHub && CONFIG.github.token) {
            try {
                await this.deleteTripFromGitHub(tripId);
                return true;
            } catch (error) {
                console.error('Error deleting trip from GitHub:', error);
                return this.deleteTripFromLocalStorage(tripId);
            }
        } else {
            return this.deleteTripFromLocalStorage(tripId);
        }
    }

    async deleteTripFromGitHub(tripId) {
        console.log('Deleting trip from GitHub:', tripId);
        
        // Get current data
        const url = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/contents/${CONFIG.github.dataFile}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${CONFIG.github.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch current data: ${response.status}`);
        }

        const fileData = await response.json();
        const currentContent = JSON.parse(atob(fileData.content));
        
        // Find and remove the trip
        const tripIndex = currentContent.trips.findIndex(t => t.id.toString() === tripId.toString());
        
        if (tripIndex === -1) {
            throw new Error('Trip not found for deletion');
        }

        const deletedTrip = currentContent.trips.splice(tripIndex, 1)[0];
        currentContent.lastUpdated = new Date().toISOString();
        
        // Update file on GitHub
        const updateResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${CONFIG.github.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete trip: ${deletedTrip.location}`,
                content: btoa(JSON.stringify(currentContent, null, 2)),
                sha: fileData.sha
            })
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update GitHub: ${updateResponse.status}`);
        }

        // Clear cache
        this.dataCache = null;
        this.lastCacheTime = null;
        
        console.log('Trip deleted from GitHub successfully');
    }

    // Upload photo to Imgur
    async uploadPhoto(file, tripId = null) {
        if (!CONFIG.imgur.clientId) {
            console.warn('Imgur client ID not configured');
            return null;
        }

        // Validate file
        if (!file.type.startsWith('image/')) {
            console.error('File is not an image:', file.type);
            return null;
        }

        // Check file size (max 10MB for Imgur)
        if (file.size > 10 * 1024 * 1024) {
            console.error('File too large:', file.size, 'bytes');
            return null;
        }

        try {
            console.log('Uploading photo to Imgur:', file.name, `(${(file.size/1024/1024).toFixed(2)}MB)`);
            
            const formData = new FormData();
            formData.append('image', file);
            formData.append('type', 'file');
            formData.append('title', `BMC Trip Photo - ${file.name}`);
            formData.append('description', `Uploaded for Big Mountain Club trip${tripId ? ` (${tripId})` : ''}`);

            const response = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Client-ID ${CONFIG.imgur.clientId}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Imgur API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(`Imgur upload failed: ${data.data.error}`);
            }

            const imageUrl = data.data.link;
            console.log('Photo uploaded to Imgur successfully:', imageUrl);
            
            return imageUrl;
            
        } catch (error) {
            console.error('Error uploading to Imgur:', error);
            return null;
        }
    }

    // Upload multiple photos with progress
    async uploadPhotos(files, tripId, onProgress = null) {
        if (!files || files.length === 0) return [];
        
        console.log(`Starting upload of ${files.length} photos to Imgur...`);
        
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
        
        console.log(`Successfully uploaded ${results.length}/${files.length} photos to Imgur`);
        return results;
    }

    // LocalStorage fallback methods (same as before)
    getTripsFromLocalStorage() {
        const stored = localStorage.getItem('bmcTrips');
        if (stored) {
            const trips = JSON.parse(stored);
            console.log(`Loaded ${trips.length} trips from localStorage`);
            return trips;
        }
        return this.getDefaultTrips();
    }

    addTripToLocalStorage(tripData) {
        const trips = this.getTripsFromLocalStorage();
        const newTrip = {
            ...tripData,
            id: Date.now().toString()
        };
        trips.unshift(newTrip);
        localStorage.setItem('bmcTrips', JSON.stringify(trips));
        return newTrip;
    }

    updateTripInLocalStorage(tripId, tripData) {
        const trips = this.getTripsFromLocalStorage();
        const tripIndex = trips.findIndex(t => t.id.toString() === tripId.toString());
        
        if (tripIndex !== -1) {
            trips[tripIndex] = { ...trips[tripIndex], ...tripData, id: tripId };
            localStorage.setItem('bmcTrips', JSON.stringify(trips));
            return trips[tripIndex];
        }
        return null;
    }

    deleteTripFromLocalStorage(tripId) {
        const trips = this.getTripsFromLocalStorage();
        const filteredTrips = trips.filter(t => t.id.toString() !== tripId.toString());
        localStorage.setItem('bmcTrips', JSON.stringify(filteredTrips));
        return true;
    }

    getDefaultTrips() {
        // Default sample data (same as before)
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
let gitHubDbManager;
console.log('Creating GitHub Database Manager...');
try {
    gitHubDbManager = new GitHubDatabaseManager();
    console.log('GitHub Database Manager initialized successfully');
} catch (error) {
    console.error('Error initializing GitHub Database Manager:', error);
    gitHubDbManager = null;
}

// Make sure it's available globally (compatible with existing code)
if (typeof window !== 'undefined') {
    window.dbManager = gitHubDbManager;
    window.gitHubDbManager = gitHubDbManager;
    console.log('GitHub Database Manager attached to window object');
}

// Function to configure API credentials (called from HTML pages)
window.configureAPIs = function(githubToken, imgurClientId) {
    if (gitHubDbManager) {
        gitHubDbManager.setCredentials(githubToken, imgurClientId);
        console.log('✅ API credentials configured successfully');
    } else {
        console.error('❌ Database manager not available');
    }
};