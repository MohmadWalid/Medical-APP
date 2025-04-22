// Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    updateCurrentDate();
    
    // Setup auth state listener
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            await initializeDashboard(user);
        } else {
            // User is signed out, redirect to login
            window.location.href = '/login';
        }
    });
});

// Update current date display
function updateCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const currentDate = new Date().toLocaleDateString('en-US', options);
        currentDateElement.textContent = currentDate;
    }
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Update greeting with user's email
        const userGreeting = document.getElementById('user-greeting');
        if (userGreeting) {
            userGreeting.textContent = `Hello, ${user.email}!`;
        }

        // Add dashboard content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // Create dashboard widgets
            const dashboardContent = `
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3><i class="fas fa-file-medical"></i> Recent Reports</h3>
                        <div class="card-content" id="recent-reports">
                            <p>Loading recent reports...</p>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3><i class="fas fa-calendar-check"></i> Upcoming Appointments</h3>
                        <div class="card-content" id="upcoming-appointments">
                            <p>No upcoming appointments</p>
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <h3><i class="fas fa-chart-line"></i> Activity Summary</h3>
                        <div class="card-content" id="activity-summary">
                            <p>Loading activity summary...</p>
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <h3><i class="fas fa-bell"></i> Notifications</h3>
                        <div class="card-content" id="notifications">
                            <p>No new notifications</p>
                        </div>
                    </div>
                </div>
            `;

            // Insert after dashboard header
            const dashboardHeader = mainContent.querySelector('.dashboard-header');
            if (dashboardHeader) {
                dashboardHeader.insertAdjacentHTML('afterend', dashboardContent);
            }

            // Load dashboard data
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Get auth token for API requests
        const token = await user.getIdToken();

        // Load recent reports
        const recentReportsElement = document.getElementById('recent-reports');
        if (recentReportsElement) {
            try {
                const response = await fetch('/api/reports/recent', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const reports = await response.json();
                    if (reports && reports.length > 0) {
                        recentReportsElement.innerHTML = `
                            <ul class="dashboard-list">
                                ${reports.map(report => `
                                    <li>
                                        <a href="/reports/${report.id}">
                                            ${report.title}
                                            <span class="list-date">${new Date(report.created_at).toLocaleDateString()}</span>
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        `;
                    } else {
                        recentReportsElement.innerHTML = '<p>No recent reports</p>';
                    }
                } else {
                    recentReportsElement.innerHTML = '<p>Error loading reports</p>';
                }
            } catch (error) {
                console.error('Error loading reports:', error);
                recentReportsElement.innerHTML = '<p>Error loading reports</p>';
            }
        }

        // Load activity summary
        const activitySummaryElement = document.getElementById('activity-summary');
        if (activitySummaryElement) {
            try {
                const response = await fetch('/api/reports/summary', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const activity = await response.json();
                    activitySummaryElement.innerHTML = `
                        <ul class="dashboard-stats">
                            <li>
                                <span class="stat-label">Total Reports</span>
                                <span class="stat-value">${activity.totalReports || 0}</span>
                            </li>
                            <li>
                                <span class="stat-label">This Month</span>
                                <span class="stat-value">${activity.reportsThisMonth || 0}</span>
                            </li>
                            <li>
                                <span class="stat-label">Chat Sessions</span>
                                <span class="stat-value">${activity.chatSessions || 0}</span>
                            </li>
                        </ul>
                    `;
                } else {
                    activitySummaryElement.innerHTML = '<p>Error loading activity summary</p>';
                }
            } catch (error) {
                console.error('Error loading activity summary:', error);
                activitySummaryElement.innerHTML = '<p>Error loading activity summary</p>';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Fetch recent reports
async function fetchRecentReports() {
    try {
        const response = await fetch('/api/reports/recent');
        if (!response.ok) throw new Error('Failed to fetch recent reports');
        return await response.json();
    } catch (error) {
        console.error('Error fetching recent reports:', error);
        return [];
    }
}

// Fetch activity summary
async function fetchActivitySummary() {
    try {
        const response = await fetch('/api/reports/summary');
        if (!response.ok) throw new Error('Failed to fetch activity summary');
        return await response.json();
    } catch (error) {
        console.error('Error fetching activity summary:', error);
        return null;
    }
}