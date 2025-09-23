// Add Trip JavaScript

// Password configuration
const CLUB_PASSWORD = "BigMountain2024"; // Change this to your desired password

class AddTrip {
    constructor() {
        this.uploadedPhotos = [];
        this.isAuthenticated = false;
        this.isEditMode = false;
        this.editingTripId = null;
        this.init();
    }

    init() {
        this.checkEditMode();
        this.checkAuthentication();
        this.setupEventListeners();
        this.setDefaultDate();
    }

    checkEditMode() {
        // Check if we're in edit mode
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        const editingTrip = sessionStorage.getItem('editingTrip');
        
        if (editId && editingTrip) {
            this.isEditMode = true;
            
            // Parse the trip data to get the original ID and its type
            const tripData = JSON.parse(editingTrip);
            this.editingTripId = tripData.id; // Use the original ID from the trip data
            
            console.log('Edit mode activated for trip:', tripData.location);
            
            this.populateEditForm(tripData);
            
            // Update page title and header
            document.title = 'Edit Trip - Big Mountain Club';
            const header = document.querySelector('.add-trip-header h1');
            if (header) header.textContent = 'Edit Trip';
            const lead = document.querySelector('.add-trip-header .lead');
            if (lead) lead.textContent = 'Update your adventure details';
        } else {
            // Ensure we're in add mode and clear any leftover edit data
            this.isEditMode = false;
            this.editingTripId = null;
            
            // Clear any leftover edit session data
            sessionStorage.removeItem('editingTrip');
            
            console.log('Add mode activated');
        }
    }

    populateEditForm(trip) {
        // Populate form fields with existing trip data
        document.getElementById('location').value = trip.location || '';
        document.getElementById('date').value = trip.date || '';
        document.getElementById('duration').value = trip.duration || '';
        document.getElementById('distance').value = trip.distance || '';
        document.getElementById('elevation').value = trip.elevation || '';
        document.getElementById('members').value = trip.members ? trip.members.join(', ') : '';
        document.getElementById('description').value = trip.description || '';
        
        // Update submit button text
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Trip';
        }
        
        // Handle photos
        if (trip.photos && trip.photos.length > 0) {
            this.uploadedPhotos = [...trip.photos];
            this.showPhotoPreview();
        }
    }

    checkAuthentication() {
        // Check if user is already authenticated in this session
        const authenticated = sessionStorage.getItem('bmcAuthenticated');
        if (authenticated === 'true') {
            this.isAuthenticated = true;
            this.hidePasswordModal();
        } else {
            this.showPasswordModal();
        }
    }

    showPasswordModal() {
        const modal = document.getElementById('passwordModal');
        modal.style.display = 'flex';
        
        // Focus on password input
        const passwordInput = document.getElementById('passwordInput');
        passwordInput.focus();
        
        // Allow Enter key to submit password
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkPassword();
            }
        });
        
        // Allow Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.closePasswordModal();
            }
        });
        
        // Allow clicking outside modal to close it
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePasswordModal();
            }
        });
    }

    hidePasswordModal() {
        const modal = document.getElementById('passwordModal');
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }

    checkPassword() {
        const passwordInput = document.getElementById('passwordInput');
        const errorDiv = document.getElementById('passwordError');
        const enteredPassword = passwordInput.value;

        if (enteredPassword === CLUB_PASSWORD) {
            this.isAuthenticated = true;
            sessionStorage.setItem('bmcAuthenticated', 'true');
            this.hidePasswordModal();
            errorDiv.style.display = 'none';
            
            // Show success message briefly
                    this.showSuccessAuth(); // Show success message after authentication
                } else {
                    errorDiv.style.display = 'block'; // Display error message
                    passwordInput.value = ''; // Clear password input
                    passwordInput.focus(); // Focus on password input
                    
                    // Add shake animation to modal for visual feedback
                    const modal = document.querySelector('.password-modal');
                    modal.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        modal.style.animation = ''; // Reset animation after it completes
                    }, 500);
                }
            }

            showSuccessAuth() {
                // Temporarily show success message after authentication
                const modal = document.querySelector('.password-modal-content');
                const originalContent = modal.innerHTML; // Store original content for restoration
                
                modal.innerHTML = `
                    <div class="text-center">
                        <i class="fas fa-check-circle text-success" style="font-size: 3rem; margin-bottom: 20px;"></i>
                        <h3 class="text-success">Access Granted!</h3>
                        <p class="text-light">You can now add trip information!</p>
                    </div>
                `;
                
                setTimeout(() => {
                    // Hide modal completely after showing success message
                    this.hidePasswordModal();
                    // Restore original content for next time
                    modal.innerHTML = originalContent;
                }, 1500);
            }

            closePasswordModal() {
                // Redirect back to trip log when closing the modal
                window.location.href = 'trip-log.html';
            }

            setupEventListeners() {
                const form = document.getElementById('addTripForm'); // Get the form element
                const photoFiles = document.getElementById('photoFiles'); // Get the photo file input
                
                form.addEventListener('submit', (e) => this.handleSubmit(e)); // Handle form submission
                photoFiles.addEventListener('change', (e) => this.handlePhotoUpload(e)); // Handle photo file changes
                
                // Setup photo URL input monitoring
                this.setupPhotoUrlListeners();
            }

            setupPhotoUrlListeners() {
                const container = document.getElementById('photoUrlsContainer'); // Get the container for photo URLs
                container.addEventListener('input', (e) => {
                    if (e.target.name === 'photoUrls') {
                        this.previewPhotoUrls(); // Preview photos when URLs are input
                    }
                });
            }

            setDefaultDate() {
                const dateInput = document.getElementById('date'); // Get the date input
                const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
                dateInput.value = today; // Set the default date to today
            }

            handleSubmit(e) {
                e.preventDefault(); // Prevent default form submission
                
                console.log('Form submitted, checking authentication...');
                
                // Check authentication before allowing form submission
                if (!this.isAuthenticated) {
                    console.log('User not authenticated, showing password modal');
                    alert('Please enter the correct password first.'); // Alert user for password
                    this.showPasswordModal(); // Show password modal
                    return;
                }
                
                console.log('User authenticated, processing form...');
                
                const formData = new FormData(e.target); // Create FormData object from the form
                const tripData = this.extractTripData(formData); // Extract trip data from form
                
                console.log('Extracted trip data:', tripData);
                
                if (this.validateTripData(tripData)) {
                    console.log('Trip data validated, saving...');
                    const saveSuccess = this.saveTripData(tripData); // Save trip data
                    
                    if (saveSuccess !== false) {
                        console.log('Trip saved successfully, showing success message');
                        this.showSuccessMessage(); // Show success message
                        this.resetForm(); // Reset the form
                    } else {
                        console.error('Failed to save trip data'); // Log error if save fails
                    }
                } else {
                    console.log('Trip data validation failed'); // Log validation failure
                }
            }

            extractTripData(formData) {
                // Get photo URLs from inputs
                const photoUrlInputs = document.querySelectorAll('input[name="photoUrls"]');
                const photoUrls = Array.from(photoUrlInputs)
                    .map(input => input.value.trim())
                    .filter(url => url !== '');

                // Combine uploaded photos and URLs
                const allPhotos = [...this.uploadedPhotos, ...photoUrls];

                // Parse members list
                const membersText = formData.get('members').trim();
                const members = membersText ? membersText.split(',').map(m => m.trim()).filter(m => m !== '') : [];

                return {
                    location: formData.get('location').trim(),
                    date: formData.get('date'),
                    duration: formData.get('duration').trim(),
                    distance: formData.get('distance').trim(),
                    elevation: formData.get('elevation').trim(),
                    members: members,
                    description: formData.get('description').trim(),
                    photos: allPhotos
                };
            }

            validateTripData(data) {
                const errors = []; // Initialize an array to hold validation errors

                if (!data.location) errors.push('Location is required'); // Check for location
                if (!data.date) errors.push('Date is required'); // Check for date
                if (!data.description) errors.push('Description is required'); // Check for description
                if (data.members.length === 0) errors.push('At least one member is required'); // Check for members

                if (errors.length > 0) {
                    alert('Please fix the following errors:\n\n' + errors.join('\n')); // Alert user of errors
                    return false; // Return false if there are errors
                }

                return true; // Return true if validation passes
            }

            saveTripData(tripData) {
                try {
                    // Get existing trips from localStorage
                    const existingTrips = JSON.parse(localStorage.getItem('bmcTrips') || '[]');
                    
                    if (this.isEditMode && this.editingTripId) {
                        // Update existing trip if in edit mode
                        const tripIndex = existingTrips.findIndex(t => t.id == this.editingTripId); // Use == for loose comparison
                        
                        if (tripIndex !== -1) {
                            const updatedTrip = {
                                ...existingTrips[tripIndex],
                                ...tripData,
                                id: this.editingTripId, // Keep original ID
                                dateModified: new Date().toISOString() // Update modification date
                            };
                            existingTrips[tripIndex] = updatedTrip; // Replace old trip with updated trip
                        } else {
                            console.error('Trip not found for editing! ID:', this.editingTripId); // Log error if trip not found
                            alert('Error: Could not find trip to update. Please try again.'); // Alert user
                            return false; // Return false if trip not found
                        }
                    } else {
                        // Add new trip with unique ID
                        const newTrip = {
                            ...tripData,
                            id: Date.now(), // Use timestamp as unique ID
                            dateAdded: new Date().toISOString() // Set date added
                        };
                        existingTrips.unshift(newTrip); // Add new trip to the beginning of the array
                        console.log('Adding new trip:', newTrip.location); // Log new trip addition
                    }

                    // Save to localStorage
                    localStorage.setItem('bmcTrips', JSON.stringify(existingTrips));
                    
                    // Verify the save worked
                    const savedTrips = JSON.parse(localStorage.getItem('bmcTrips') || '[]');
                    console.log('Successfully saved. Total trips:', savedTrips.length);
                    
                    return true; // Return true if save is successful
                } catch (error) {
                    console.error('Error saving trip data:', error); // Log error if save fails
                    alert('Error saving trip data. Please try again.'); // Alert user of save error
                    return false; // Return false if an error occurs
                }
            }

            showSuccessMessage() {
                const successMessage = document.getElementById('successMessage'); // Get success message element
                const messageText = this.isEditMode ? 'Trip updated successfully!' : 'Trip added successfully!'; // Determine message text
                
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i> ${messageText}
                    <a href="trip-log.html" class="alert-link">View all trips</a>
                `;
                successMessage.style.display = 'block'; // Show success message
                successMessage.scrollIntoView({ behavior: 'smooth' }); // Scroll to success message
                
                // Clear edit mode session data
                if (this.isEditMode) {
                    sessionStorage.removeItem('editingTrip'); // Remove editing trip from session storage
                }
                
                // Redirect to trip log after 3 seconds
                setTimeout(() => {
                    window.location.href = 'trip-log.html';
                }, 3000);
            }

            resetForm() {
                const form = document.getElementById('addTripForm'); // Get the form element
                form.reset(); // Reset the form
                this.uploadedPhotos = []; // Clear uploaded photos
                
                            hidePhotoPreview() { // Ensure this method is part of a class
                                const preview = document.getElementById('photoPreview'); // Get photo preview element
                                preview.style.display = 'none'; // Hide photo preview
                            }

                            showPhotoPreview() { // Ensure this method is part of a class
                                const preview = document.getElementById('photoPreview'); // Get photo preview element
                                const grid = document.getElementById('photoPreviewGrid'); // Get grid for photo previews
                                
                                // Get all photos (uploaded + URLs)
                                const photoUrlInputs = document.querySelectorAll('input[name="photoUrls"]');
                                const urls = Array.from(photoUrlInputs)
                                    .map(input => input.value.trim())
                                    .filter(url => url !== '');
                                
                                const allPhotos = [...this.uploadedPhotos, ...urls]; // Combine uploaded photos and URLs
                                
                                if (allPhotos.length === 0) {
                                    this.hidePhotoPreview(); // Hide preview if no photos
                                    return;
                                }

                                grid.innerHTML = allPhotos.map((photo, index) => {
                                    const isUploadedPhoto = index < this.uploadedPhotos.length; // Check if photo is uploaded
                                    const photoType = isUploadedPhoto ? 'uploaded' : 'url'; // Determine photo type
                                    const actualIndex = isUploadedPhoto ? index : index - this.uploadedPhotos.length; // Get actual index
                                    
                                    return `
                                        <div class="col-md-3 col-sm-4 col-6 mb-3">
                                            <div class="photo-preview-item">
                                                <img src="${photo}" alt="Preview ${index + 1}" class="img-fluid rounded">
                                                <button type="button" class="photo-remove-btn" 
                                                        onclick="addTrip.removePhoto('${photoType}', ${actualIndex})"
                                                        title="Remove photo">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join(''); // Join all photo previews into a single HTML string

                                preview.style.display = 'block'; // Show the photo preview
                            }

                            resetPhotoUrlInputs() { // Ensure this method is part of a class
                                const container = document.getElementById('photoUrlsContainer');
                                container.innerHTML = `
                                    <div class="photo-url-input mb-2">
                                        <div class="input-group">
                                            <input type="url" class="form-control" name="photoUrls" 
                                                   placeholder="https://example.com/photo1.jpg">
                                            <button type="button" class="btn btn-outline-success" onclick="addTrip.resetPhotoUrlInputs()">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }
                    const preview = document.getElementById('photoPreview');
                    preview.style.display = 'none';
                }

                resetPhotoUrlInputs() {
                    const container = document.getElementById('photoUrlsContainer');
                    container.innerHTML = `
                        <div class="photo-url-input mb-2">
                            <div class="input-group">
                                <input type="url" class="form-control" name="photoUrls" 
                           placeholder="https://example.com/photo1.jpg">
                    <button type="button" class="btn btn-outline-success" onclick="addPhotoUrlInput()">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }

    removePhoto(photoType, index) {
        if (photoType === 'uploaded') {
            // Remove from uploaded photos array
            if (index >= 0 && index < this.uploadedPhotos.length) {
                this.uploadedPhotos.splice(index, 1);
                
                // If no uploaded photos left, clear the file input
                if (this.uploadedPhotos.length === 0) {
                    const fileInput = document.getElementById('photoFiles');
                    if (fileInput) fileInput.value = '';
                }
            }
        } else if (photoType === 'url') {
            // Remove from URL inputs
            const photoUrlInputs = document.querySelectorAll('input[name="photoUrls"]');
            const urlInputs = Array.from(photoUrlInputs).filter(input => input.value.trim() !== '');
            
            if (index >= 0 && index < urlInputs.length) {
                // Clear the specific input
                urlInputs[index].value = '';
                
                // If this was the last input with content, refresh URL inputs
                const remainingUrls = Array.from(photoUrlInputs)
                    .map(input => input.value.trim())
                    .filter(url => url !== '');
                
                if (remainingUrls.length === 0) {
                    this.resetPhotoUrlInputs();
                }
            }
        }
        
        // Refresh the preview
        this.showPhotoPreview();
        
        // Show removal confirmation
        this.showPhotoRemovalMessage();
    }

    showPhotoRemovalMessage() {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-info alert-dismissible fade show position-fixed';
        successDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 250px;';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i> Photo removed successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

// Global function for password checking (called from HTML)
function checkPassword() {
    if (window.addTrip) {
        window.addTrip.checkPassword();
    }
}

// Global function to close password modal (called from HTML)
function closePasswordModal() {
    if (window.addTrip) {
        window.addTrip.closePasswordModal();
    }
}

// Global function to add photo URL inputs
function addPhotoUrlInput() {
    const container = document.getElementById('photoUrlsContainer');
    const newInput = document.createElement('div');
    newInput.className = 'photo-url-input mb-2';
    newInput.innerHTML = `
        <div class="input-group">
            <input type="url" class="form-control" name="photoUrls" 
                   placeholder="https://example.com/photo${container.children.length + 1}.jpg">
            <button type="button" class="btn btn-outline-danger" onclick="removePhotoUrlInput(this)">
                <i class="fas fa-minus"></i>
            </button>
        </div>
    `;
    container.appendChild(newInput);
    
    // Add event listener for the new input
    newInput.querySelector('input').addEventListener('input', () => {
        if (window.addTrip) {
            window.addTrip.previewPhotoUrls();
        }
    });
}

function removePhotoUrlInput(button) {
    const container = document.getElementById('photoUrlsContainer');
    if (container.children.length > 1) {
        button.closest('.photo-url-input').remove();
        if (window.addTrip) {
            window.addTrip.previewPhotoUrls();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.addTrip = new AddTrip();
});
