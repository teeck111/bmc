// Firebase Configuration
console.log('Loading Firebase configuration...');

const firebaseConfig = {
  apiKey: "AIzaSyDjH30TDpQt8R5gm9vIm59HtfVnBGTmNtY",
  authDomain: "bigmountainclubwebsite.firebaseapp.com",
  projectId: "bigmountainclubwebsite",
  storageBucket: "bigmountainclubwebsite.firebasestorage.app",
  messagingSenderId: "945172997417",
  appId: "1:945172997417:web:52437b0f24c3e186c8c338",
  measurementId: "G-7Q0EYRP98D"
};

// Initialize Firebase
let db = null;
let storage = null;
try {
    // Check if Firebase SDK is loaded
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        storage = firebase.storage();
        console.log('Firebase initialized successfully');
        console.log('Firebase Storage available:', storage !== null);
    } else {
        console.warn('Firebase SDK not loaded, using localStorage fallback');
        db = null;
        storage = null;
    }
} catch (error) {
    console.error('Error initializing Firebase:', error);
    // Fallback to localStorage if Firebase fails
    db = null;
    storage = null;
}

// Database operations wrapper
class DatabaseManager {
    constructor() {
        this.useFirebase = db !== null;
        this.tripsCollection = 'bmc-trips';
    }

    // Get all trips
    async getTrips() {
        if (this.useFirebase) {
            try {
                const snapshot = await db.collection(this.tripsCollection)
                    .orderBy('dateAdded', 'desc')
                    .get();
                
                const trips = [];
                snapshot.forEach(doc => {
                    trips.push({ id: doc.id, ...doc.data() });
                });
                
                console.log(`Loaded ${trips.length} trips from Firebase`);
                return trips;
            } catch (error) {
                console.error('Error loading trips from Firebase:', error);
                return this.getTripsFromLocalStorage();
            }
        } else {
            return this.getTripsFromLocalStorage();
        }
    }

    // Add new trip
    async addTrip(tripData) {
        const newTrip = {
            ...tripData,
            dateAdded: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        if (this.useFirebase) {
            try {
                // Clean data for Firebase (remove base64 images)
                const cleanedData = this.cleanDataForFirebase(newTrip);
                console.log('Adding trip to Firebase with cleaned data:', cleanedData);
                
                const docRef = await db.collection(this.tripsCollection).add(cleanedData);
                console.log('Trip added to Firebase with ID:', docRef.id);
                return { id: docRef.id, ...newTrip };
            } catch (error) {
                console.error('Error adding trip to Firebase:', error);
                return this.addTripToLocalStorage(newTrip);
            }
        } else {
            return this.addTripToLocalStorage(newTrip);
        }
    }

    // Update existing trip
    async updateTrip(tripId, tripData) {
        const updatedData = {
            ...tripData,
            dateModified: new Date().toISOString()
        };

        if (this.useFirebase) {
            try {
                // Clean data for Firebase (remove base64 images)
                const cleanedData = this.cleanDataForFirebase(updatedData);
                console.log('Updating trip in Firebase with cleaned data:', cleanedData);
                
                await db.collection(this.tripsCollection).doc(tripId).update(cleanedData);
                console.log('Trip updated in Firebase:', tripId);
                return { id: tripId, ...updatedData };
            } catch (error) {
                console.error('Error updating trip in Firebase:', error);
                return this.updateTripInLocalStorage(tripId, updatedData);
            }
        } else {
            return this.updateTripInLocalStorage(tripId, updatedData);
        }
    }

    // Clean data for Firebase by removing base64 images and large data
    cleanDataForFirebase(data) {
        const cleaned = { ...data };
        
        // Filter out base64 encoded images (data URLs)
        if (cleaned.photos && Array.isArray(cleaned.photos)) {
            cleaned.photos = cleaned.photos.filter(photo => {
                if (typeof photo === 'string') {
                    // Keep only URLs, filter out base64 data URLs
                    if (photo.startsWith('data:')) {
                        console.warn('Filtering out base64 image data for Firebase storage');
                        return false;
                    }
                    // Keep URLs that are reasonable length
                    if (photo.length > 500) {
                        console.warn('Filtering out very long URL:', photo.substring(0, 50) + '...');
                        return false;
                    }
                    return true;
                }
                return false;
            });
        }
        
        // Ensure all string fields are reasonable length
        const maxStringLength = 10000;
        Object.keys(cleaned).forEach(key => {
            if (typeof cleaned[key] === 'string' && cleaned[key].length > maxStringLength) {
                console.warn(`Truncating field ${key} from ${cleaned[key].length} to ${maxStringLength} characters`);
                cleaned[key] = cleaned[key].substring(0, maxStringLength) + '... (truncated)';
            }
        });
        
        return cleaned;
    }

    // Upload photo to Firebase Storage
    async uploadPhoto(file, tripId) {
        if (!storage) {
            console.warn('Firebase Storage not available');
            return null;
        }

        // Validate file
        if (!file.type.startsWith('image/')) {
            console.error('File is not an image:', file.type);
            return null;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            console.error('File too large:', file.size, 'bytes');
            return null;
        }

        try {
            // Create a unique filename
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `trip-photos/${tripId || 'temp'}/${timestamp}-${sanitizedFileName}`;
            
            // Create storage reference
            const storageRef = storage.ref(filename);
            
            console.log('Uploading photo:', filename, `(${(file.size/1024/1024).toFixed(2)}MB)`);
            
            // Upload file with metadata
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    tripId: tripId || 'temp',
                    uploadedAt: new Date().toISOString(),
                    originalName: file.name
                }
            };
            
            const snapshot = await storageRef.put(file, metadata);
            
            // Get download URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            console.log('Photo uploaded successfully:', downloadURL);
            return downloadURL;
            
        } catch (error) {
            console.error('Error uploading photo:', error);
            return null;
        }
    }

    // Upload multiple photos with progress
    async uploadPhotos(files, tripId, onProgress = null) {
        if (!files || files.length === 0) return [];
        
        console.log(`Starting upload of ${files.length} photos for trip ${tripId}...`);
        
        const uploadPromises = Array.from(files).map(async (file, index) => {
            console.log(`Starting upload ${index + 1}/${files.length}: ${file.name}`);
            
            const url = await this.uploadPhoto(file, tripId);
            
            if (onProgress) {
                onProgress(index + 1, files.length, url !== null);
            }
            
            return url;
        });
        
        try {
            const results = await Promise.all(uploadPromises);
            // Filter out failed uploads (null values)
            const successfulUploads = results.filter(url => url !== null);
            console.log(`Successfully uploaded ${successfulUploads.length}/${files.length} photos`);
            return successfulUploads;
        } catch (error) {
            console.error('Error uploading multiple photos:', error);
            return [];
        }
    }

    // Delete photo from Firebase Storage
    async deletePhoto(photoUrl) {
        if (!storage || !photoUrl) return false;
        
        try {
            // Extract storage path from URL
            const storageRef = storage.refFromURL(photoUrl);
            await storageRef.delete();
            console.log('Photo deleted from storage:', photoUrl);
            return true;
        } catch (error) {
            console.error('Error deleting photo:', error);
            return false;
        }
    }

    // Delete trip
    async deleteTrip(tripId) {
        if (this.useFirebase) {
            try {
                await db.collection(this.tripsCollection).doc(tripId).delete();
                console.log('Trip deleted from Firebase:', tripId);
                return true;
            } catch (error) {
                console.error('Error deleting trip from Firebase:', error);
                return this.deleteTripFromLocalStorage(tripId);
            }
        } else {
            return this.deleteTripFromLocalStorage(tripId);
        }
    }

    // LocalStorage fallback methods
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
            id: Date.now().toString() // Convert to string for consistency
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
        // Default sample data
        return [
            {
                id: "1",
                location: "Mt Holy Cross",
                date: "2024-08-15",
                members: ["Tyler", "Brendan", "Sarah", "Mike"],
                photos: ["imgs/hc_summit.jpg", "imgs/hc_group.JPG", "imgs/hc_trees.JPG"],
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
                photos: ["imgs/gorebackpacking.jpeg"],
                description: "3-day backpacking adventure in the Gore Range with multiple summit attempts. Amazing alpine lakes and ridge walks.",
                distance: "25 miles",
                elevation: "4,200 ft gain",
                duration: "3 days",
                dateAdded: "2024-07-22T10:00:00.000Z"
            },
            {
                id: "3",
                location: "Longs Peak",
                date: "2024-09-03",
                members: ["Tyler", "Emma", "Josh", "Riley"],
                photos: ["imgs/longs-summit.JPG"],
                description: "Classic Colorado 14er via the Keyhole Route. Started at 3 AM for sunrise summit push!",
                distance: "14.5 miles",
                elevation: "5,100 ft gain",
                duration: "12 hours",
                dateAdded: "2024-09-03T10:00:00.000Z"
            },
            {
                id: "4",
                location: "Quandary Peak Ski Descent",
                date: "2024-03-10",
                members: ["Tyler", "Brendan"],
                photos: ["imgs/quandary.jpg"],
                description: "Epic spring skiing down a 14er! Perfect corn snow conditions and blue skies.",
                distance: "6 miles",
                elevation: "3,400 ft gain",
                duration: "6 hours",
                dateAdded: "2024-03-10T10:00:00.000Z"
            },
            {
                id: "5",
                location: "Third Flatiron",
                date: "2024-06-18",
                members: ["Tyler", "Brendan", "Alex"],
                photos: ["imgs/third-flatiron.jpeg"],
                description: "Classic Boulder climbing route. Technical rock climbing with stunning Flatirons views.",
                distance: "3 miles",
                elevation: "1,400 ft gain",
                duration: "4 hours",
                dateAdded: "2024-06-18T10:00:00.000Z"
            }
        ];
    }
}

// Global database manager instance - ensure it's always available
let dbManager;
console.log('Creating DatabaseManager...');
try {
    dbManager = new DatabaseManager();
    console.log('DatabaseManager initialized successfully');
    console.log('DatabaseManager useFirebase:', dbManager.useFirebase);
} catch (error) {
    console.error('Error initializing DatabaseManager:', error);
    // Create a minimal fallback if DatabaseManager fails
    dbManager = null;
}

// Make sure dbManager is available globally
if (typeof window !== 'undefined') {
    window.dbManager = dbManager;
    console.log('dbManager attached to window object');
} else {
    console.log('Window object not available, running in non-browser environment');
}
