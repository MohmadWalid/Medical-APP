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
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Check user role in Firestore
                const db = firebase.firestore();
                const doctorDoc = await db.collection('doctors').doc(user.uid).get();
                
                if (doctorDoc.exists) {
                    // User is a doctor, redirect to doctor dashboard
                    window.location.href = '/doctor';
                } else {
                    // User is a patient, redirect to patient dashboard
                    window.location.href = '/dashboard';
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert(error.message);
            }
        });
    }

    // Check authentication state
    firebase.auth().onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
        
        // Get current path
        const currentPath = window.location.pathname;
        
        if (user) {
            // User is signed in
            const db = firebase.firestore();
            const doctorDoc = await db.collection('doctors').doc(user.uid).get();
            
            if (doctorDoc.exists) {
                // User is a doctor
                if (currentPath === '/login' || currentPath === '/register' || currentPath === '/dashboard') {
                    // Redirect to doctor dashboard if on login, register, or patient dashboard
                    window.location.href = '/doctor';
                }
            } else {
                // User is a patient
                if (currentPath === '/login' || currentPath === '/register' || currentPath === '/doctor') {
                    // Redirect to patient dashboard if on login, register, or doctor dashboard
                    window.location.href = '/dashboard';
                }
            }
        } else {
            // No user is signed in
            const protectedPages = ['/dashboard', '/upload', '/reports', '/chat', '/profile', '/doctor'];
            if (protectedPages.includes(currentPath)) {
                // Redirect to login if on protected pages
                window.location.href = '/login';
            }
        }
    });
});