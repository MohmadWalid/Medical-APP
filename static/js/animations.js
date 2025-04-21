document.addEventListener('DOMContentLoaded', function() {
  // Trigger animations for elements already in viewport
  const triggerAnimations = () => {
    document.querySelectorAll('.features, .how-it-works, .about').forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.8) {
        section.classList.add('visible');
        
        // Animate section children
        if (section.classList.contains('features')) {
          const cards = section.querySelectorAll('.feature-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, index * 150);
          });
        }
        
        if (section.classList.contains('how-it-works')) {
          const steps = section.querySelectorAll('.step');
          steps.forEach((step, index) => {
            setTimeout(() => {
              step.style.opacity = '1';
              step.style.transform = 'translateY(0)';
            }, index * 200);
          });
        }
        
        if (section.classList.contains('about')) {
          const text = section.querySelector('.about-text');
          const image = section.querySelector('.about-image');
          
          setTimeout(() => {
            text.style.opacity = '1';
            text.style.transform = 'translateX(0)';
          }, 100);
          
          setTimeout(() => {
            image.style.opacity = '1';
            image.style.transform = 'translateX(0)';
          }, 300);
        }
      }
    });
  };

  // Initial trigger
  triggerAnimations();

  // Trigger on scroll
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(triggerAnimations);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Section animations
  const sections = document.querySelectorAll('.features, .how-it-works, .about');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Handle specific section animations
        if (entry.target.classList.contains('features')) {
          const cards = entry.target.querySelectorAll('.feature-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, index * 150);
          });
        }
        
        if (entry.target.classList.contains('how-it-works')) {
          const steps = entry.target.querySelectorAll('.step');
          steps.forEach((step, index) => {
            setTimeout(() => {
              step.style.opacity = '1';
              step.style.transform = 'translateY(0)';
            }, index * 200);
          });
        }
        
        if (entry.target.classList.contains('about')) {
          const text = entry.target.querySelector('.about-text');
          const image = entry.target.querySelector('.about-image');
          
          setTimeout(() => {
            text.style.opacity = '1';
            text.style.transform = 'translateX(0)';
          }, 100);
          
          setTimeout(() => {
            image.style.opacity = '1';
            image.style.transform = 'translateX(0)';
          }, 300);
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '-50px 0px'
  });

  // Initialize sections
  sections.forEach(section => {
    if (section.classList.contains('features')) {
      const cards = section.querySelectorAll('.feature-card');
      cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
      });
    }
    
    if (section.classList.contains('how-it-works')) {
      const steps = section.querySelectorAll('.step');
      steps.forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
      });
    }
    
    if (section.classList.contains('about')) {
      const text = section.querySelector('.about-text');
      const image = section.querySelector('.about-image');
      
      text.style.opacity = '0';
      text.style.transform = 'translateX(-20px)';
      
      image.style.opacity = '0';
      image.style.transform = 'translateX(20px)';
    }
    
    observer.observe(section);
  });
});