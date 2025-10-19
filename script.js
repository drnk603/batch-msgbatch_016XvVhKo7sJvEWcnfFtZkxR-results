(function() {
  'use strict';

  var app = window.__app = window.__app || {};

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this, args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() { inThrottle = false; }, limit);
      }
    };
  }

  function initAOS() {
    if (app.aosInit) return;
    app.aosInit = true;

    if (typeof AOS === 'undefined') return;

    var elementsWithAOS = document.querySelectorAll('[data-aos][data-avoid-layout="true"]');
    for (var i = 0; i < elementsWithAOS.length; i++) {
      elementsWithAOS[i].removeAttribute('data-aos');
    }

    AOS.init({
      once: false,
      duration: 600,
      easing: 'ease-out',
      offset: 120,
      mirror: false,
      disable: function() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    });

    app.refreshAOS = function() {
      try {
        if (typeof AOS !== 'undefined' && AOS.refresh) {
          AOS.refresh();
        }
      } catch(e) {}
    };
  }

  function initBurgerMenu() {
    if (app.burgerInit) return;
    app.burgerInit = true;

    var nav = document.querySelector('.c-nav#main-nav');
    var toggle = document.querySelector('.c-nav__toggle');
    var navList = document.querySelector('.c-nav__list');
    var body = document.body;

    if (!nav || !toggle || !navList) return;

    var isOpen = false;

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      var firstLink = navList.querySelector('.c-nav__link');
      if (firstLink) {
        setTimeout(function() {
          firstLink.focus();
        }, 100);
      }
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        toggle.focus();
      }

      if (isOpen && e.key === 'Tab') {
        var focusableElements = navList.querySelectorAll('.c-nav__link');
        var firstElement = focusableElements[0];
        var lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = navList.querySelectorAll('.c-nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initAnchors() {
    if (app.anchorsInit) return;
    app.anchorsInit = true;

    var pathname = window.location.pathname;
    var isHomepage = pathname === '/' || pathname === '/index.html' || pathname.endsWith('/index.html');

    if (!isHomepage) {
      var internalLinks = document.querySelectorAll('a[href^="#"]');
      for (var i = 0; i < internalLinks.length; i++) {
        var link = internalLinks[i];
        var href = link.getAttribute('href');
        if (href && href !== '#' && href !== '#!' && href.length > 1) {
          link.setAttribute('href', '/' + href);
        }
      }
    }

    function getHeaderHeight() {
      var header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 80;
    }

    function smoothScrollTo(target) {
      var headerHeight = getHeaderHeight();
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo(0, targetPosition);
      }
    }

    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      var targetId = href.substring(1);
      var targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        smoothScrollTo(targetElement);
        history.pushState(null, '', href);
      }
    });
  }

  function initActiveMenu() {
    if (app.activeMenuInit) return;
    app.activeMenuInit = true;

    var pathname = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var href = link.getAttribute('href');
      
      link.removeAttribute('aria-current');
      link.classList.remove('active');

      if (href === pathname || 
          (pathname === '/' && href === '/index.html') ||
          (pathname === '/index.html' && href === '/') ||
          (pathname.endsWith(href) && href !== '/')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initImages() {
    if (app.imagesInit) return;
    app.imagesInit = true;

    var images = document.querySelectorAll('img');
    
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      
      if (!img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      (function(image) {
        image.addEventListener('error', function() {
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect fill="#f0f0f0" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#999">Afbeelding niet beschikbaar</text></svg>';
          var encoded = 'data:image/svg+xml;base64,' + btoa(svg);
          image.src = encoded;
          image.style.objectFit = 'contain';

          if (image.classList.contains('c-logo__img')) {
            image.style.maxHeight = '40px';
          }
        });
      })(img);
    }
  }

  function initForms() {
    if (app.formsInit) return;
    app.formsInit = true;

    var forms = document.querySelectorAll('.needs-validation');
    
    app.notify = function(message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.style.minWidth = '250px';
      toast.style.marginBottom = '10px';
      toast.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Sluiten"></button>';
      
      container.appendChild(toast);

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 150);
      }, 5000);
    };

    for (var i = 0; i < forms.length; i++) {
      (function(form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();

          form.classList.add('was-validated');

          if (!form.checkValidity()) {
            var firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
              firstInvalid.focus();
            }
            return;
          }

          var submitBtn = form.querySelector('button[type="submit"]');
          var originalText = submitBtn ? submitBtn.innerHTML : '';
          
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';
          }

          var formData = new FormData(form);
          var data = {};
          formData.forEach(function(value, key) {
            data[key] = value;
          });

          fetch('process.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          .then(function(response) {
            return response.json();
          })
          .then(function(result) {
            if (result.success) {
              app.notify('Bedankt! Uw bericht is succesvol verzonden.', 'success');
              form.reset();
              form.classList.remove('was-validated');
            } else {
              app.notify(result.message || 'Er is een fout opgetreden. Probeer het opnieuw.', 'danger');
            }
          })
          .catch(function() {
            app.notify('Er is een fout opgetreden. Probeer het opnieuw.', 'danger');
          })
          .finally(function() {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }
          });
        });
      })(forms[i]);
    }
  }

  function initAnimeInteractions() {
    if (app.animeInit) return;
    app.animeInit = true;

    if (typeof anime === 'undefined') return;

    var selectors = ['.card', '.feature-card', '.animal-card', '.btn-primary', '.btn-success'];
    
    for (var s = 0; s < selectors.length; s++) {
      var elements = document.querySelectorAll(selectors[s]);
      
      for (var i = 0; i < elements.length; i++) {
        (function(el) {
          el.addEventListener('mouseenter', function() {
            anime({
              targets: el,
              scale: 1.02,
              opacity: 0.95,
              duration: 300,
              easing: 'easeOutQuad'
            });
          });

          el.addEventListener('mouseleave', function() {
            anime({
              targets: el,
              scale: 1,
              opacity: 1,
              duration: 300,
              easing: 'easeOutQuad'
            });
          });
        })(elements[i]);
      }
    }
  }

  function initMobileFlexGaps() {
    if (app.mobileGapsInit) return;
    app.mobileGapsInit = true;

    function applyGaps() {
      var isMobile = window.innerWidth < 576;
      var flexContainers = document.querySelectorAll('.d-flex');

      for (var i = 0; i < flexContainers.length; i++) {
        var container = flexContainers[i];
        var hasGap = false;
        
        var classList = container.className.split(' ');
        for (var j = 0; j < classList.length; j++) {
          if (classList[j].indexOf('gap-') === 0 || classList[j].indexOf('g-') === 0) {
            hasGap = true;
            break;
          }
        }

        if (!hasGap && container.children.length > 1) {
          if (isMobile) {
            container.classList.add('gap-3');
            container.setAttribute('data-mobile-gap', 'true');
          } else {
            if (container.hasAttribute('data-mobile-gap')) {
              container.classList.remove('gap-3');
              container.removeAttribute('data-mobile-gap');
            }
          }
        }
      }
    }

    applyGaps();
    window.addEventListener('resize', debounce(applyGaps, 200), { passive: true });
  }

  function updateFooterYear() {
    var yearSpan = document.getElementById('current-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initAOS();
    initBurgerMenu();
    initAnchors();
    initActiveMenu();
    initImages();
    initForms();
    initAnimeInteractions();
    initMobileFlexGaps();
    updateFooterYear();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();