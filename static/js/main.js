// Main JavaScript functionality for Medical App

// Handle form submissions
document.addEventListener('DOMContentLoaded', () => {
    // Login form handling
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    window.location.href = '/dashboard';
                } else {
                    alert('Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
            }
        });
    }

    // Dashboard interactions
    const uploadForm = document.querySelector('#upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(uploadForm);
            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    alert('File uploaded successfully!');
                    window.location.reload();
                } else {
                    alert('Upload failed. Please try again.');
                }
            } catch (error) {
                console.error('Upload error:', error);
            }
        });
    }

    // Profile updates
    const profileForm = document.querySelector('#profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            try {
                const response = await fetch('/profile/update', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    alert('Profile updated successfully!');
                } else {
                    alert('Update failed. Please try again.');
                }
            } catch (error) {
                console.error('Profile update error:', error);
            }
        });
    }
});

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function validateFileUpload(input) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (input.files.length > 0) {
        const file = input.files[0];
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            input.value = '';
            return false;
        }
        if (!allowedTypes.includes(file.type)) {
            alert('Only PDF, JPEG, and PNG files are allowed');
            input.value = '';
            return false;
        }
    }
    return true;
}