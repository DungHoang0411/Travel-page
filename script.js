/**
 * Travlla - Main JavaScript Controller
 * Features:
 * 1. Light Rain Effect (Canvas 60fps matching Travlla original vertical rain streaks)
 * 2. Horizontal Drifting Cloud & 3D Flapping Butterfly
 * 3. Search Modal (#search URL hash support), Side Drawer, and Dropdowns
 */

document.addEventListener('DOMContentLoaded', () => {
  const rainCanvas = document.getElementById('rainCanvas');
  const searchModal = document.getElementById('searchModal');
  const searchTrigger = document.querySelector('.search-trigger');
  const searchClose = document.querySelector('.search-close');
  const searchBackdrop = document.querySelector('.search-backdrop');
  const searchInput = document.querySelector('.search-input');
  const searchSubmit = document.querySelector('.search-submit');

  const mobileDrawer = document.getElementById('mobileDrawer');
  const menuTrigger = document.querySelector('.menu-trigger');
  const drawerClose = document.querySelector('.drawer-close');
  const drawerBackdrop = document.querySelector('.drawer-backdrop');

  const butterflyWrap = document.querySelector('.hero-butterfly-wrap');
  const chameleonWrap = document.querySelector('.hero-chameleon-wrap');
  const locationDot = document.querySelector('.location-dot');
  const ctaBtn = document.querySelector('.btn-get-in-touch');

  // 1. Light Rain Effect on Canvas (Vertical translucent streaks with subtle droplet tip)
  if (rainCanvas) {
    const ctx = rainCanvas.getContext('2d');
    let width = (rainCanvas.width = window.innerWidth);
    let height = (rainCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = rainCanvas.width = window.innerWidth;
      height = rainCanvas.height = window.innerHeight;
    });

    const DROP_COUNT = 55;
    const drops = Array.from({ length: DROP_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 45 + Math.random() * 55,
      speed: 2.2 + Math.random() * 2.8,
      opacity: 0.12 + Math.random() * 0.2,
      thickness: 1 + Math.random() * 0.8
    }));

    function renderRain() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        const grad = ctx.createLinearGradient(d.x, d.y - d.length, d.x, d.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, `rgba(255, 255, 255, ${d.opacity * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${d.opacity})`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = d.thickness;
        ctx.lineCap = 'round';
        ctx.moveTo(d.x, d.y - d.length);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();

        // Update position
        d.y += d.speed;
        if (d.y - d.length > height) {
          d.y = -10;
          d.x = Math.random() * width;
        }
      }

      requestAnimationFrame(renderRain);
    }

    requestAnimationFrame(renderRain);
  }

  // 2. Toast Notification Helper
  const toast = document.createElement('div');
  toast.className = 'js-toast';
  document.body.appendChild(toast);
  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // 3. Search Modal Handlers (also supports #search hash like travlla.botble.com/#search)
  function openSearch() {
    if (!searchModal) return;
    searchModal.classList.add('active');
    searchModal.setAttribute('aria-hidden', 'false');
    if (searchInput) setTimeout(() => searchInput.focus(), 100);
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove('active');
    searchModal.setAttribute('aria-hidden', 'true');
    if (window.location.hash === '#search') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function handleSearchSubmit() {
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (query) {
      closeSearch();
      showToast(`Searching tours for: "${query}"`);
      searchInput.value = '';
    } else {
      searchInput.focus();
    }
  }

  if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
  if (searchSubmit) searchSubmit.addEventListener('click', handleSearchSubmit);
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearchSubmit();
    });
  }

  if (window.location.hash === '#search') {
    openSearch();
  }
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#search') openSearch();
  });

  // 4. Side Menu Drawer Handlers
  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('active');
    mobileDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('active');
    mobileDrawer.setAttribute('aria-hidden', 'true');
  }

  if (menuTrigger) menuTrigger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-nav a, .drawer-btn').forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // 5. Dropdown Menus (Nav, Language, Currency)
  const dropdownParents = document.querySelectorAll('.has-dropdown, .dropdown-trigger');

  dropdownParents.forEach((parent) => {
    const trigger = parent.querySelector('.nav-link, .util-img-btn');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = parent.classList.contains('open');
        dropdownParents.forEach((p) => p.classList.remove('open'));
        if (!isOpen) parent.classList.add('open');
      });
    }

    parent.querySelectorAll('.dropdown-menu a').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        parent.querySelectorAll('.dropdown-menu a').forEach((a) => a.classList.remove('active'));
        item.classList.add('active');
        parent.classList.remove('open');
        showToast(`Selected: ${item.textContent.trim()}`);
      });
    });
  });

  document.addEventListener('click', () => {
    dropdownParents.forEach((p) => p.classList.remove('open'));
  });

  // 6. Interactive Hero Elements
  if (butterflyWrap) {
    const wings = butterflyWrap.querySelectorAll('.butterfly-wing');
    butterflyWrap.addEventListener('click', () => {
      wings.forEach((w) => {
        w.style.animationDuration = '0.18s';
        setTimeout(() => {
          w.style.animationDuration = '';
        }, 1200);
      });
    });
  }

  if (chameleonWrap) {
    chameleonWrap.addEventListener('click', () => {
      showToast('Explore Vietnam Wildlife Tours');
    });
  }

  if (locationDot) {
    locationDot.addEventListener('click', () => {
      showToast('Destination: Vietnam Waterfall');
    });
  }

  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Connecting you with our travel specialists...');
    });
  }

  // 7. Keyboard Accessibility (ESC closes modals & dropdowns)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
      closeDrawer();
      dropdownParents.forEach((p) => p.classList.remove('open'));
    }
  });
});
