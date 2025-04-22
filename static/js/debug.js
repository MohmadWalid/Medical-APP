// Debug utilities for development
const DEBUG = true; // Set to false in production

// Debug logger
const logger = {
    log: function(...args) {
        if (DEBUG) {
            console.log('[DEBUG]', ...args);
        }
    },
    
    error: function(...args) {
        if (DEBUG) {
            console.error('[ERROR]', ...args);
        }
    },
    
    warn: function(...args) {
        if (DEBUG) {
            console.warn('[WARN]', ...args);
        }
    },
    
    info: function(...args) {
        if (DEBUG) {
            console.info('[INFO]', ...args);
        }
    }
};

// Authentication state monitor
firebase.auth().onAuthStateChanged((user) => {
    logger.info('Auth state changed:', user ? `User: ${user.email}` : 'No user');
});

// Network request monitor
if (DEBUG) {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        logger.info('Fetch request:', args[0]);
        try {
            const response = await originalFetch.apply(this, args);
            logger.info('Fetch response:', response.status, response.statusText);
            return response;
        } catch (error) {
            logger.error('Fetch error:', error);
            throw error;
        }
    };
}

// Error boundary
window.addEventListener('error', (event) => {
    logger.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection:', event.reason);
});

// Performance monitoring
if (DEBUG) {
    // Page load timing
    window.addEventListener('load', () => {
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        logger.info('Page load time:', pageLoadTime + 'ms');
        
        // Resource timing
        const resources = window.performance.getEntriesByType('resource');
        resources.forEach(resource => {
            if (resource.duration > 1000) { // Log slow resources (>1s)
                logger.warn('Slow resource:', {
                    name: resource.name,
                    duration: resource.duration + 'ms',
                    type: resource.initiatorType
                });
            }
        });
    });
}

// Export debug utilities
window.debugUtils = {
    logger,
    
    // Get current state
    getState: function() {
        return {
            user: firebase.auth().currentUser,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
    },
    
    // Test network connectivity
    testConnection: async function() {
        try {
            const start = performance.now();
            await fetch('/health');
            const duration = performance.now() - start;
            logger.info('Connection test:', {
                status: 'success',
                duration: duration + 'ms'
            });
        } catch (error) {
            logger.error('Connection test failed:', error);
        }
    }
};