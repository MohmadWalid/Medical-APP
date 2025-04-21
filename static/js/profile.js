// Wait for DOM and Firebase Auth to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const profileForm = document.getElementById('profile-form');
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const medicalHistoryInput = document.getElementById('medical-history');

    // Get preview elements
    const previewName = document.getElementById('preview-name');
    const previewAge = document.getElementById('preview-age');
    const previewMedicalHistory = document.getElementById('preview-medical-history');

    // Update preview function
    function updatePreview() {
        previewName.textContent = nameInput.value || 'Not set';
        previewAge.textContent = ageInput.value || 'Not set';
        
        const medicalHistory = medicalHistoryInput.value
            .split('\n')
            .filter(item => item.trim() !== '');

        if (medicalHistory.length > 0) {
            previewMedicalHistory.innerHTML = medicalHistory
                .map(item => `<li>${item.trim()}</li>`)
                .join('');
        } else {
            previewMedicalHistory.innerHTML = '<li>No medical history recorded</li>';
        }
    }

    // Add input event listeners for live preview
    nameInput.addEventListener('input', updatePreview);
    ageInput.addEventListener('input', updatePreview);
    medicalHistoryInput.addEventListener('input', updatePreview);

    // Load profile data
    async function loadProfile() {
        try {
            const profileData = await getUserProfile();
            if (profileData) {
                nameInput.value = profileData.name || '';
                ageInput.value = profileData.age || '';
                medicalHistoryInput.value = Array.isArray(profileData.medicalHistory) 
                    ? profileData.medicalHistory.join('\n')
                    : '';
                updatePreview();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            alert('Failed to load profile data. Please try again.');
        }
    }

    // Save profile data
    async function saveProfile(event) {
        event.preventDefault();

        const medicalHistory = medicalHistoryInput.value
            .split('\n')
            .filter(item => item.trim() !== '')
            .map(item => item.trim());

        const profileData = {
            name: nameInput.value,
            age: parseInt(ageInput.value),
            medicalHistory: medicalHistory,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await updateUserProfile(profileData);
            alert('Profile saved successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        }
    }

    // Add form submit handler
    profileForm.addEventListener('submit', saveProfile);

    // Load initial profile data
    loadProfile();
});