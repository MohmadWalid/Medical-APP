// Firebase configuration and utility functions
// Note: firebaseConfig is provided by the server in the template
if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export Firebase services
window.auth = auth;
window.db = db;

// Get current user
function getCurrentUser() {
    return firebase.auth().currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
    return getCurrentUser() !== null;
}

// Get user profile
async function getUserProfile() {
    const user = getCurrentUser();
    if (!user) return null;

    try {
        const db = firebase.firestore();
        const doc = await db.collection('users').doc(user.uid).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

// Update user profile
async function updateUserProfile(profileData) {
    const user = getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    try {
        const db = firebase.firestore();
        await db.collection('users').doc(user.uid).set(profileData, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}