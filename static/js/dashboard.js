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
                        <div class="card-header">
                        <h3><i class="fas fa-file-medical"></i> Recent Reports</h3>
                            <button class="download-all-btn">
                                <i class="fas fa-download"></i> Download All
                            </button>
                        </div>
                        <div class="card-content" id="recent-reports">
                            <ul class="dashboard-list">
                                <li>
                                    <a href="/reports/1">
                                        Medical Report #1
                                        <span class="list-date">2024-03-20</span>
                                    </a>
                                    <button class="download-btn" onclick="downloadReport(1)">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </li>
                                <li>
                                    <a href="/reports/2">
                                        Medical Report #2
                                        <span class="list-date">2024-03-19</span>
                                    </a>
                                    <button class="download-btn" onclick="downloadReport(2)">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </li>
                                <li>
                                    <a href="/reports/3">
                                        Medical Report #3
                                        <span class="list-date">2024-03-18</span>
                                    </a>
                                    <button class="download-btn" onclick="downloadReport(3)">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </li>
                            </ul>
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
                    console.log('Recent reports data:', reports); // Debug log
                    if (reports && reports.length > 0) {
                        recentReportsElement.innerHTML = `
                            <ul class="dashboard-list">
                                ${reports.map(report => {
                                    console.log('Processing report:', report); // Debug log
                                    return `
                                    <li>
                                        <a href="/reports/${report.id}">
                                            ${report.title}
                                            <span class="list-date">${new Date(report.date).toLocaleDateString()}</span>
                                        </a>
                                        <button class="download-btn" onclick="downloadReport(${report.id})">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </li>
                                    `;
                                }).join('')}
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

        // Load notifications (messages)
        const notificationsElement = document.getElementById('notifications');
        if (notificationsElement) {
            const db = firebase.firestore();
            
            // Show loading state
            notificationsElement.innerHTML = `
                <div class="loading-message">
                    <p>Loading notifications...</p>
                </div>
            `;

            // First try a simple query without ordering
            const simpleQuery = db.collection('chats')
                .where('patientId', '==', user.uid)
                .limit(5);

            simpleQuery.get().then((snapshot) => {
                if (snapshot.empty) {
                    notificationsElement.innerHTML = '<p>No new messages</p>';
                    return;
                }

                const messages = [];
                snapshot.forEach((doc) => {
                    const message = doc.data();
                    if (message && message.text) {
                        messages.push({
                            text: message.text,
                            timestamp: message.timestamp ? message.timestamp.toDate() : new Date(),
                            senderRole: message.senderRole
                        });
                    }
                });

                if (messages.length === 0) {
                    notificationsElement.innerHTML = '<p>No new messages</p>';
                    return;
                }

                // Sort messages by timestamp manually
                messages.sort((a, b) => b.timestamp - a.timestamp);

                notificationsElement.innerHTML = `
                    <ul class="dashboard-list">
                        ${messages.map(message => `
                            <li class="notification-item ${message.senderRole === 'doctor' ? 'unread' : ''}">
                                <div class="notification-content">
                                    <span class="notification-text">${message.text}</span>
                                    <span class="notification-time">${message.timestamp.toLocaleTimeString()}</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                `;

                // Now try to set up the real-time listener with ordering
                setupRealtimeNotifications();
            }).catch((error) => {
                console.error('Error with simple query:', error);
                notificationsElement.innerHTML = `
                    <div class="error-message">
                        <p>Error loading messages</p>
                        <p class="small">Please try again in a few moments</p>
                    </div>
                `;
            });
        }

        // Function to set up real-time notifications
        function setupRealtimeNotifications() {
            const db = firebase.firestore();
            const notificationsElement = document.getElementById('notifications');
            
            // Query to get recent messages with ordering
            const query = db.collection('chats')
                .where('patientId', '==', user.uid)
                .orderBy('timestamp', 'desc')
                .limit(5);

            query.onSnapshot((snapshot) => {
                if (snapshot.empty) {
                    return; // Keep existing messages if no new ones
                }

                const messages = [];
                snapshot.forEach((doc) => {
                    const message = doc.data();
                    if (message && message.text) {
                        messages.push({
                            text: message.text,
                            timestamp: message.timestamp ? message.timestamp.toDate() : new Date(),
                            senderRole: message.senderRole
                        });
                    }
                });

                if (messages.length > 0) {
                    notificationsElement.innerHTML = `
                        <ul class="dashboard-list">
                            ${messages.map(message => `
                                <li class="notification-item ${message.senderRole === 'doctor' ? 'unread' : ''}">
                                    <div class="notification-content">
                                        <span class="notification-text">${message.text}</span>
                                        <span class="notification-time">${message.timestamp.toLocaleTimeString()}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                }
            }, (error) => {
                console.error('Error in real-time notifications:', error);
                // Don't show error to user, keep existing messages
            });
        }

        // Function to create notifications index
        function createNotificationsIndex() {
            const db = firebase.firestore();
            
            // Create a temporary document to trigger index creation
            db.collection('chats').add({
                patientId: user.uid, // Use actual patient ID instead of 'temp'
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                text: 'Index creation',
                senderId: user.uid,
                senderRole: 'system',
                participants: [user.uid]
            }).then(() => {
                console.log('Notifications index creation triggered');
                // Wait a few seconds and then try loading messages again
                setTimeout(() => {
                    loadDashboardData();
                }, 5000);
            }).catch(error => {
                console.error('Error triggering notifications index creation:', error);
            });
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
                                <span class="stat-value">${activity.total_reports || 0}</span>
                                <span class="stat-label">Total Reports</span>
                            </li>
                            <li>
                                <span class="stat-value">${activity.recent_uploads || 0}</span>
                                <span class="stat-label">Recent Uploads</span>
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

// Function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.error('Notification element not found');
        return;
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Function to scroll to bottom of chat
function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Function to format message timestamp
function formatMessageTime(timestamp) {
    const date = timestamp.toDate();
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Function to create message element
function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message-wrapper ${message.senderRole === 'doctor' ? 'doctor-message' : 'patient-message'}`;
    div.innerHTML = `
        <div class="message-bubble">
            <div class="message-content">${message.text}</div>
            <div class="message-time">${formatMessageTime(message.timestamp)}</div>
        </div>
    `;
    return div;
}

// Function to load chat messages with proper error handling
function loadChatMessages() {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }

    // Show loading state
    chatMessages.innerHTML = `
        <div class="loading-message">
            <p>Loading messages...</p>
        </div>
    `;

    // Create messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'chat-messages-container';
    chatMessages.innerHTML = '';
    chatMessages.appendChild(messagesContainer);

    // Set up real-time listener
    const query = db.collection('chats')
        .where('patientId', '==', currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(50); // Increased limit for better history

    const unsubscribe = query.onSnapshot((snapshot) => {
        // Clear existing messages
        messagesContainer.innerHTML = '';

        if (snapshot.empty) {
            messagesContainer.innerHTML = '<p class="no-messages">No messages yet</p>';
            return;
        }

        // Convert to array and sort by timestamp
        const messages = [];
        snapshot.forEach((doc) => {
            const message = doc.data();
            if (message && message.text) {
                messages.push({
                    id: doc.id,
                    text: message.text,
                    timestamp: message.timestamp,
                    senderRole: message.senderRole
                });
            }
        });

        // Sort messages by timestamp (oldest first)
        messages.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

        // Add messages to container
        messages.forEach(message => {
            const messageElement = createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });

        // Scroll to bottom after messages are added
        scrollToBottom();
    }, (error) => {
        console.error('Error in real-time chat:', error);
        messagesContainer.innerHTML = `
            <div class="error-message">
                <p>Error loading messages</p>
                <p class="small">Please try again in a few moments</p>
            </div>
        `;
    });

    // Store unsubscribe function for cleanup
    window.chatUnsubscribe = unsubscribe;
}

// Function to send message
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;

    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;

    // First check if user has a doctor assigned
    db.collection('patients').doc(currentUser.uid).get()
        .then((doc) => {
            if (!doc.exists || !doc.data().doctorId) {
                showNotification('You need to be assigned to a doctor first.', 'error');
                return;
            }

            const doctorId = doc.data().doctorId;

            // Create the chat message
            const chatMessage = {
                text: message,
                senderId: currentUser.uid,
                patientId: currentUser.uid,
                participants: [currentUser.uid, doctorId],
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                senderRole: 'patient',
                status: 'unread'
            };

            // Add the message to Firestore
            return db.collection('chats').add(chatMessage);
        })
        .then(() => {
            messageInput.value = '';
            // Focus back on input
            messageInput.focus();
        })
        .catch((error) => {
            console.error("Error sending message:", error);
            showNotification('Error sending message. Please try again.', 'error');
        });
}

// Add event listener for Enter key in message input
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        const messageInput = document.getElementById('message-input');
        if (messageInput && document.activeElement === messageInput) {
            e.preventDefault();
            sendMessage();
        }
    }
});

// Function to initialize chat interface
function initializeChatInterface() {
    const chatContainer = document.getElementById('chat-interface');
    if (!chatContainer) {
        console.error('Chat container not found');
        return;
    }

    chatContainer.classList.add('chat-container'); // Ensure main container has this class

    chatContainer.innerHTML = `
        <div class="chat-header">
            <div class="doctor-info">
                <div class="doctor-avatar">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="doctor-details">
                    <h4>Your Doctor</h4>
                    <p>General Practitioner</p>
                </div>
            </div>
        </div>
        <div class="chat-body">
            <div class="chat-messages" id="chat-messages"></div>
        </div>
        <div class="chat-input-container">
            <textarea id="message-input" placeholder="Type your message..." rows="1"></textarea>
            <button onclick="sendMessage()" class="send-button">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;

    // Initialize chat messages
    loadChatMessages();
}

// Add styles for chat interface
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .chat-interface {
        display: flex;
        flex-direction: column;
        height: 100%; /* Ensure it takes full height of its parent */
        min-height: 500px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .chat-header {
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        background: #f8f9fa;
        border-radius: 12px 12px 0 0;
        flex-shrink: 0; /* Prevent header from shrinking */
    }

    .doctor-info {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .doctor-avatar {
        width: 40px;
        height: 40px;
        background: #4285f4;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .doctor-details h4 {
        margin: 0;
        color: #333;
        font-size: 1.1em;
    }

    .doctor-details p {
        margin: 5px 0 0 0;
        color: #666;
        font-size: 0.9em;
    }

    .chat-body {
        flex: 1; /* Allow chat-body to take remaining vertical space */
        overflow-y: auto; /* Enable scrolling for messages */
        padding: 20px;
        background: #fff;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .chat-messages {
        /* No specific flex or overflow properties here, handled by chat-body */
    }

    .chat-input-container {
        padding: 15px 20px;
        border-top: 1px solid #eee;
        background: #f8f9fa;
        border-radius: 0 0 12px 12px;
        display: flex;
        gap: 10px;
        align-items: flex-end;
        flex-shrink: 0; /* Ensure it doesn't shrink */
    }

    #message-input {
        flex: 1;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 20px;
        resize: none;
        font-family: inherit;
        font-size: 0.95rem;
        max-height: 100px;
        min-height: 40px;
        background: #fff;
    }

    #message-input:focus {
        outline: none;
        border-color: #4285f4;
        box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
    }

    .send-button {
        background: #4285f4;
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s;
    }

    .send-button:hover {
        background: #3367d6;
    }

    .message-wrapper {
        display: flex;
        margin-bottom: 10px;
        animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .doctor-message {
        justify-content: flex-start;
    }

    .patient-message {
        justify-content: flex-end;
    }

    .message-bubble {
        max-width: 70%;
        padding: 10px 15px;
        border-radius: 15px;
        position: relative;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .doctor-message .message-bubble {
        background-color: #f0f0f0;
        color: #333;
        border-bottom-left-radius: 5px;
    }

    .patient-message .message-bubble {
        background-color: #4285f4;
        color: white;
        border-bottom-right-radius: 5px;
    }

    .message-content {
        margin-bottom: 5px;
        word-wrap: break-word;
        line-height: 1.4;
    }

    .message-time {
        font-size: 0.75em;
        opacity: 0.7;
        text-align: right;
    }

    .no-messages {
        text-align: center;
        color: #666;
        padding: 20px;
    }

    .loading-message {
        text-align: center;
        padding: 20px;
        color: #666;
    }

    .error-message {
        text-align: center;
        padding: 20px;
        color: #d32f2f;
    }

    /* Ensure the chat container takes full height */
    .chat-container {
        height: calc(100vh - 200px);
        min-height: 500px;
        margin: 20px;
    }
`;
document.head.appendChild(chatStyles);

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeChatInterface();
});

// Cleanup when leaving page
window.addEventListener('beforeunload', function() {
    if (window.chatUnsubscribe) {
        window.chatUnsubscribe();
    }
});