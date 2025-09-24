// Trip Log JavaScript

// Admin configuration
const ADMIN_PASSWORD = "AdminBMC2024"; // Change this to your desired admin password
const SECRET_KEY_SEQUENCE = ["a", "d", "m", "i", "n"]; // Type "admin" to reveal toggle

class TripLog {
    constructor() {
        this.trips = [];
        this.isAdmin = false;
        this.adminUnlocked = false;
        this.keySequence = [];
        this.init();
    }

    async init() {
        await this.loadTrips();
        this.renderTrips();
        this.setupFilters();
        this.setupEventListeners();
        this.setupSecretKeyListener();
    }

    async loadTrips() {
        try {
            // Check for Netlify database manager availability
            const dbMgr = window.dbManager || window.netlifyDbManager;
            if (dbMgr && typeof dbMgr.getTrips === 'function') {
                this.trips = await dbMgr.getTrips();
                console.log('Loaded', this.trips.length, 'trips from Netlify database');
                console.log('Raw trip data from Netlify database:', this.trips);
                
                // Validate and clean each trip from database
                this.trips = this.trips.map(trip => {
                    const cleanTrip = {
                        id: trip.id || Date.now().toString(),
                        location: trip.location || 'Unknown Location',
                        date: trip.date || new Date().toISOString().split('T')[0],
                        photos: Array.isArray(trip.photos) ? trip.photos : [],
                        members: Array.isArray(trip.members) ? trip.members : [],
                        distance: trip.distance || 'N/A',
                        elevation: trip.elevation || 'N/A',
                        duration: trip.duration || 'N/A',
                        description: trip.description || 'No description available'
                    };
                    console.log('Cleaned trip:', cleanTrip);
                    return cleanTrip;
                });
            } else {
                // Fallback to localStorage
                console.warn('Netlify database manager not available, loading from localStorage');
                this.trips = this.loadFromLocalStorage();
                console.log('Loaded', this.trips.length, 'trips from localStorage');
            }
        } catch (error) {
            console.error('Error loading trips from Netlify database:', error);
            console.warn('Falling back to localStorage');
            this.trips = this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('bmcTrips');
        if (stored) {
            const trips = JSON.parse(stored);
            // Migrate old image paths if needed
            const migratedTrips = this.migrateImagePaths(trips);
            return migratedTrips;
        }
        return this.getDefaultTrips();
    }
    
    // Migrate old image paths to correct ones
    migrateImagePaths(trips) {
        return trips.map(trip => {
            if (trip.photos && Array.isArray(trip.photos)) {
                const migratedPhotos = trip.photos.map(photo => {
                    // Fix old imgs/ paths to assets/images/
                    if (photo.startsWith('imgs/')) {
                        const newPath = photo.replace('imgs/', 'assets/images/');
                        console.log(`Migrating image path: ${photo} -> ${newPath}`);
                        return newPath;
                    }
                    return photo;
                });
                
                return {
                    ...trip,
                    photos: migratedPhotos
                };
            }
            return trip;
        });
    }

    getDefaultTrips() {
        // Sample data for demonstration with correct image paths
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
                duration: "8 hours"
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
                duration: "3 days"
            },
            {
                id: "3",
                location: "Longs Peak",
                date: "2024-09-03",
                members: ["Tyler", "Emma", "Josh", "Riley"],
                photos: ["assets/images/longs-summit.JPG"],
                description: "Classic Colorado 14er via the Keyhole Route. Started at 3 AM for sunrise summit push!",
                distance: "14.5 miles",
                elevation: "5,100 ft gain",
                duration: "12 hours"
            }
        ];
    }


    addTrip(tripData) {
        const newTrip = {
            ...tripData,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0]
        };
        this.trips.unshift(newTrip);
        this.saveTrips();
        return newTrip;
    }

    renderTrips(filteredTrips = null) {
        const container = document.getElementById('tripContainer');
        const noTripsMessage = document.getElementById('noTripsMessage');
        const tripsToRender = filteredTrips || this.trips;

        console.log('renderTrips called with:', tripsToRender);
        console.log('Number of trips to render:', tripsToRender.length);

        if (tripsToRender.length === 0) {
            container.innerHTML = '';
            noTripsMessage.style.display = 'block';
            return;
        }

        noTripsMessage.style.display = 'none';
        
        // Debug each trip before rendering
        tripsToRender.forEach((trip, index) => {
            console.log(`Trip ${index}:`, trip);
            console.log(`Trip ${index} photos:`, trip.photos);
            console.log(`Trip ${index} members:`, trip.members);
        });
        
        try {
            container.innerHTML = tripsToRender.map((trip, index) => {
                console.log(`Processing trip ${index}:`, trip);
                
                // Validate trip object
                if (!trip || typeof trip !== 'object') {
                    console.warn(`Trip ${index} is not a valid object:`, trip);
                    return ''; // Skip this trip
                }
                
                // Ensure all properties exist with defaults
                const safeTrip = {
                    id: trip.id || Date.now(),
                    location: trip.location || 'Unknown Location',
                    date: trip.date || new Date().toISOString().split('T')[0],
                    photos: Array.isArray(trip.photos) ? trip.photos : [],
                    members: Array.isArray(trip.members) ? trip.members : [],
                    distance: trip.distance || 'N/A',
                    description: trip.description || 'No description available'
                };
                
                const firstPhoto = safeTrip.photos.length > 0 ? safeTrip.photos[0] : 'assets/images/BMC_Logo.png';
                const memberCount = safeTrip.members.length;
                const shortDescription = safeTrip.description.length > 100 
                    ? safeTrip.description.substring(0, 100) + '...'
                    : safeTrip.description;
                
                return `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="trip-card" onclick="tripLog.showTripDetails('${safeTrip.id}')">
                            <div class="trip-image-container">
                                <img src="${firstPhoto}" alt="${safeTrip.location}" class="trip-image">
                                <div class="trip-overlay">
                                    <div class="trip-date">${this.formatDate(safeTrip.date)}</div>
                                </div>
                                <div class="admin-actions ${this.isAdmin ? 'show' : ''}">
                                    <button class="admin-btn admin-btn-edit" onclick="event.stopPropagation(); tripLog.editTrip('${safeTrip.id}')" title="Edit Trip">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="admin-btn admin-btn-delete" onclick="event.stopPropagation(); tripLog.deleteTrip('${safeTrip.id}')" title="Delete Trip">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="trip-content">
                                <h5 class="trip-title">${safeTrip.location}</h5>
                                <div class="trip-members">
                                    <i class="fas fa-users"></i>
                                    <span>${memberCount} member${memberCount !== 1 ? 's' : ''}</span>
                                </div>
                                <div class="trip-stats">
                                    <div class="stat">
                                        <i class="fas fa-route"></i>
                                        <span>${safeTrip.distance}</span>
                                    </div>
                                </div>
                                <p class="trip-description">${shortDescription}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error in renderTrips:', error);
            container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading trips. Please refresh the page.</div></div>';
        }
    }

    showTripDetails(tripId) {
        const trip = this.trips.find(t => t.id.toString() === tripId.toString());
        if (!trip) {
            console.error('Trip not found with ID:', tripId);
            return;
        }

        // Store current trip ID for admin actions
        this.currentTripId = tripId;

        const modalBody = document.getElementById('tripModalBody');
        const modalTitle = document.getElementById('tripModalLabel');
        const adminModalActions = document.getElementById('adminModalActions');
        
        // Ensure all properties exist with defaults
        const safeTrip = {
            location: trip.location || 'Unknown Location',
            date: trip.date || new Date().toISOString().split('T')[0],
            photos: trip.photos || [],
            members: trip.members || [],
            distance: trip.distance || 'N/A',
            elevation: trip.elevation || 'N/A',
            duration: trip.duration || 'N/A',
            description: trip.description || 'No description available'
        };
        
        modalTitle.textContent = safeTrip.location;
        
        // Show/hide admin actions in modal
        if (this.isAdmin) {
            adminModalActions.classList.add('show');
        } else {
            adminModalActions.classList.remove('show');
        }
        
        const photosHTML = safeTrip.photos.length > 0 
            ? safeTrip.photos.map((photo, index) => `
                <img src="${photo}" alt="${safeTrip.location} ${index + 1}" 
                     class="img-fluid mb-2 trip-detail-photo" 
                     style="max-height: 300px; object-fit: cover; margin-right: 10px;">
            `).join('')
            : '<p class="text-muted">No photos available</p>';
            
        const membersHTML = safeTrip.members.length > 0 
            ? safeTrip.members.join(', ')
            : 'No members listed';
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <div class="trip-photos mb-3">
                        ${photosHTML}
                    </div>
                    <p class="trip-full-description">${safeTrip.description}</p>
                </div>
                <div class="col-md-4">
                    <div class="trip-details-sidebar">
                        <div class="detail-item mb-3">
                            <strong><i class="fas fa-calendar"></i> Date:</strong><br>
                            ${this.formatDate(safeTrip.date)}
                        </div>
                        <div class="detail-item mb-3">
                            <strong><i class="fas fa-users"></i> Members:</strong><br>
                            ${membersHTML}
                        </div>
                        <div class="detail-item mb-3">
                            <strong><i class="fas fa-route"></i> Distance:</strong><br>
                            ${safeTrip.distance}
                        </div>
                        <div class="detail-item mb-3">
                            <strong><i class="fas fa-arrow-up"></i> Elevation Gain:</strong><br>
                            ${safeTrip.elevation}
                        </div>
                        <div class="detail-item mb-3">
                            <strong><i class="fas fa-clock"></i> Duration:</strong><br>
                            ${safeTrip.duration}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('tripModal'));
        modal.show();
    }

    setupFilters() {
        const locationFilter = document.getElementById('locationFilter');
        const yearFilter = document.getElementById('yearFilter');

        // Populate location filter
        const locations = [...new Set(this.trips.map(trip => trip.location))].sort();
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });

        // Populate year filter
        const years = [...new Set(this.trips.map(trip => new Date(trip.date).getFullYear()))].sort().reverse();
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    setupEventListeners() {
        const locationFilter = document.getElementById('locationFilter');
        const yearFilter = document.getElementById('yearFilter');

        locationFilter.addEventListener('change', () => this.filterTrips());
        yearFilter.addEventListener('change', () => this.filterTrips());
    }

    filterTrips() {
        const locationFilter = document.getElementById('locationFilter').value;
        const yearFilter = document.getElementById('yearFilter').value;

        let filteredTrips = this.trips;

        if (locationFilter) {
            filteredTrips = filteredTrips.filter(trip => trip.location === locationFilter);
        }

        if (yearFilter) {
            filteredTrips = filteredTrips.filter(trip => 
                new Date(trip.date).getFullYear().toString() === yearFilter
            );
        }

        this.renderTrips(filteredTrips);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Secret Key Listener
    setupSecretKeyListener() {
        document.addEventListener('keydown', (e) => {
            // Only listen when not typing in form inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const key = e.key.toLowerCase();
            this.keySequence.push(key);

            // Keep only the last N keys (length of secret sequence)
            if (this.keySequence.length > SECRET_KEY_SEQUENCE.length) {
                this.keySequence.shift();
            }

            // Check if sequence matches
            if (this.keySequence.length === SECRET_KEY_SEQUENCE.length &&
                this.keySequence.every((k, i) => k === SECRET_KEY_SEQUENCE[i])) {
                
                this.revealAdminToggle();
                this.keySequence = []; // Reset sequence
            }
        });
    }

    revealAdminToggle() {
        const adminToggle = document.querySelector('.admin-toggle');
        if (adminToggle && !this.adminUnlocked) {
            adminToggle.classList.add('show');
            this.adminUnlocked = true;
            
            // Show brief notification
            this.showAdminUnlockedMessage();
        }
    }

    showAdminUnlockedMessage() {
        const notification = document.createElement('div');
        notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-unlock"></i> Admin controls unlocked! Toggle admin mode to access editing features.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Admin Functions
    toggleAdminMode() {
        if (!this.adminUnlocked) {
            alert('Admin controls are not unlocked.');
            return;
        }

        if (!this.isAdmin) {
            // Prompt for password when enabling admin mode
            this.promptAdminPassword();
        } else {
            // Disable admin mode
            this.isAdmin = false;
            this.renderTrips(); // Re-render to hide admin buttons
        }
    }

    promptAdminPassword() {
        const password = prompt('Enter admin password:');
        
        if (password === ADMIN_PASSWORD) {
            this.isAdmin = true;
            this.renderTrips(); // Re-render to show admin buttons
            this.showAdminEnabledMessage();
        } else if (password !== null) { // User didn't cancel
            alert('Incorrect admin password.');
            // Uncheck the toggle since authentication failed
            const toggle = document.getElementById('adminToggle');
            if (toggle) toggle.checked = false;
        } else {
            // User canceled, uncheck the toggle
            const toggle = document.getElementById('adminToggle');
            if (toggle) toggle.checked = false;
        }
    }

    showAdminEnabledMessage() {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-shield-alt"></i> Admin mode enabled! You can now edit and delete trips.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    editTrip(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;

        // Store trip data for editing
        sessionStorage.setItem('editingTrip', JSON.stringify(trip));
        sessionStorage.setItem('bmcAuthenticated', 'true'); // Bypass password for editing
        
        // Redirect to add-trip page in edit mode
        window.location.href = 'add-trip.html?edit=' + tripId;
    }

    editTripFromModal() {
        if (this.currentTripId) {
            // Close modal first
            const modal = bootstrap.Modal.getInstance(document.getElementById('tripModal'));
            modal.hide();
            
            // Then edit trip
            this.editTrip(this.currentTripId);
        }
    }

    async deleteTrip(tripId) {
        const trip = this.trips.find(t => t.id.toString() === tripId.toString());
        if (!trip) return;

        const confirmDelete = confirm(`Are you sure you want to delete the trip to ${trip.location}?\n\nThis action cannot be undone.`);
        
        if (confirmDelete) {
            try {
                // Try to delete from database first
                const dbMgr = window.dbManager || dbManager;
                if (dbMgr) {
                    await dbMgr.deleteTrip(tripId);
                } else {
                    // Fallback: remove from localStorage
                    console.warn('Database manager not available, removing from localStorage');
                    const stored = localStorage.getItem('bmcTrips');
                    if (stored) {
                        const trips = JSON.parse(stored);
                        const filteredTrips = trips.filter(t => t.id.toString() !== tripId.toString());
                        localStorage.setItem('bmcTrips', JSON.stringify(filteredTrips));
                    }
                }
                
                // Remove trip from local array
                this.trips = this.trips.filter(t => t.id.toString() !== tripId.toString());
                
                // Re-render trips
                this.renderTrips();
                this.setupFilters();
                
                // Show success message
                this.showDeleteSuccess(trip.location);
            } catch (error) {
                console.error('Error deleting trip:', error);
                // Try localStorage fallback even if database delete failed
                try {
                    const stored = localStorage.getItem('bmcTrips');
                    if (stored) {
                        const trips = JSON.parse(stored);
                        const filteredTrips = trips.filter(t => t.id.toString() !== tripId.toString());
                        localStorage.setItem('bmcTrips', JSON.stringify(filteredTrips));
                        
                        // Remove from local array and re-render
                        this.trips = this.trips.filter(t => t.id.toString() !== tripId.toString());
                        this.renderTrips();
                        this.setupFilters();
                        this.showDeleteSuccess(trip.location);
                    } else {
                        alert('Error deleting trip. Please try again.');
                    }
                } catch (fallbackError) {
                    console.error('Error with localStorage fallback:', fallbackError);
                    alert('Error deleting trip. Please try again.');
                }
            }
        }
    }

    deleteTripFromModal() {
        if (this.currentTripId) {
            // Close modal first
            const modal = bootstrap.Modal.getInstance(document.getElementById('tripModal'));
            modal.hide();
            
            // Then delete trip
            this.deleteTrip(this.currentTripId);
        }
    }

    showDeleteSuccess(location) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        successDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i> Trip to ${location} has been deleted successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }
}

// Global function to redirect to add trip page
function redirectToAddTrip() {
    // Clear any existing authentication to force password prompt
    sessionStorage.removeItem('bmcAuthenticated');
    window.location.href = 'add-trip.html';
}

// Global function to toggle admin mode
function toggleAdminMode() {
    if (window.tripLog) {
        window.tripLog.toggleAdminMode();
    }
}

// Initialize trip log when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tripLog = new TripLog();
});
