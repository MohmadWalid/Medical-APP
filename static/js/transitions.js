document.addEventListener('DOMContentLoaded', () => {
    // Add transition overlay to the DOM
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);

    // Add content container for smooth transitions
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }

    // Handle all navigation link clicks
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            // Only handle internal navigation
            if (link.getAttribute('href').startsWith('/')) {
                e.preventDefault();
                const target = link.getAttribute('href');
                
                // Handle transitions
                if (mainContent) {
                    mainContent.style.opacity = '0';
                    mainContent.style.transform = 'translateX(20px)';
                }

                // Update sidebar active state
                const sidebarLinks = document.querySelectorAll('.sidebar-link');
                sidebarLinks.forEach(sidebarLink => {
                    if (sidebarLink.getAttribute('href') === target) {
                        sidebarLink.classList.add('active');
                    } else {
                        sidebarLink.classList.remove('active');
                    }
                });
                
                // Navigate after transition
                setTimeout(() => {
                    window.location.href = target;
                }, 300);
            }
        });
    });

    // Initial page load animation
    window.addEventListener('load', () => {
        if (mainContent) {
            mainContent.style.opacity = '0';
            mainContent.style.transform = 'translateX(20px)';
            
            requestAnimationFrame(() => {
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'translateX(0)';
            });
        }
    });
});