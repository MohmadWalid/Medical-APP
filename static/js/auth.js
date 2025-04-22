// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Handle registration form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            try {
                // Create user with email and password
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Add user profile to Firestore
                await firebase.firestore().collection('users').doc(user.uid).set({
                    username: username,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } catch (error) {
                console.error('Error during registration:', error);
                alert(error.message);
            }
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                // Sign in user
                await firebase.auth().signInWithEmailAndPassword(email, password);
                
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } catch (error) {
                console.error('Error during login:', error);
                alert(error.message);
            }
        });
    }

    // Check authentication state
    firebase.auth().onAuthStateChanged((user) => {
        console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
        
        // Get current path
        const currentPath = window.location.pathname;
        
        if (user) {
            // User is signed in
            if (currentPath === '/login' || currentPath === '/register') {
                // Redirect to dashboard if on auth pages
                window.location.href = '/dashboard';
            }
        } else {
            // No user is signed in
            const protectedPages = ['/dashboard', '/upload', '/reports', '/chat', '/profile'];
            if (protectedPages.includes(currentPath)) {
                // Redirect to login if on protected pages
                window.location.href = '/login';
            }
        }
    });
});