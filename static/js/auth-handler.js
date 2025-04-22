// Authentication handler
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            handleAuthenticatedUser(user);
        } else {
            // User is signed out
            handleSignedOutUser();
        }
    });

    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Get user profile from API
async function getUserProfile() {
    try {
        const token = await firebase.auth().currentUser.getIdToken();
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

// Handle authenticated user
async function handleAuthenticatedUser(user) {
    // Update UI for authenticated user
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting) {
        const profile = await getUserProfile();
        const displayName = profile?.name || user.email || 'User';
        userGreeting.textContent = `Hello, ${displayName}!`;
    }

    // Check if we're on a protected page
    const protectedPages = ['/dashboard', '/upload', '/reports', '/chat', '/profile'];
    const currentPath = window.location.pathname;

    if (currentPath === '/login') {
        // Redirect to dashboard if on login page
        window.location.href = '/dashboard';
    }
}

// Handle signed out user
function handleSignedOutUser() {
    // Check if we're on a protected page
    const protectedPages = ['/dashboard', '/upload', '/reports', '/chat', '/profile'];
    const currentPath = window.location.pathname;

    if (protectedPages.includes(currentPath)) {
        // Redirect to login if on protected page
        window.location.href = '/login';
    }
}

// Handle logout
async function handleLogout() {
    try {
        await firebase.auth().signOut();
        window.location.href = '/login';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
}