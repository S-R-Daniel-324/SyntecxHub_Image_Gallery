document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filters button');
  const searchInput   = document.getElementById('search');
  const sections      = document.querySelectorAll('.section');
  const galleryItems  = document.querySelectorAll('.gallery .item');
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const closeBtn      = lightbox.querySelector('.close');
  const prevBtn       = document.getElementById('prev');
  const nextBtn       = document.getElementById('next');

  let visibleImages = [];
  let currentIndex  = 0;

  galleryItems.forEach(item => {
    const img = item.querySelector('img');

    const onLoad = () => {
      item.classList.add('loaded');
      item.classList.remove('error');
    };

    const onError = () => {
      item.classList.add('loaded', 'error');
      console.warn(`Image failed to load: ${img.src}`);
    };

    if (img.complete && img.naturalWidth > 0) {
      onLoad();
    } else {
      img.addEventListener('load',  onLoad);
      img.addEventListener('error', onError);
    }
  });

  const updateVisibleItems = () => {
    const activeFilter = document.querySelector('.filters button.active').dataset.filter;
    const query = searchInput.value.trim().toLowerCase();

    galleryItems.forEach(item => {
      const category = item.closest('.section').dataset.category.toLowerCase();
      const altText  = item.querySelector('img').alt.toLowerCase();

      const matchesCategory = activeFilter === 'all' || category === activeFilter;
      const matchesSearch   = !query || altText.includes(query) || category.includes(query);

      item.style.display = (matchesCategory && matchesSearch) ? '' : 'none';
    });

    sections.forEach(section => {
      const hasVisible = Array.from(section.querySelectorAll('.item'))
        .some(item => item.style.display !== 'none');
      section.classList.toggle('hidden-section', !hasVisible);
    });

    visibleImages = Array.from(galleryItems).filter(item => item.style.display !== 'none');
  };

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateVisibleItems();
    });
  });

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(updateVisibleItems, 150);
  });

  const openLightbox = index => {
    if (!visibleImages.length) return;
    currentIndex = ((index % visibleImages.length) + visibleImages.length) % visibleImages.length;

    const src = visibleImages[currentIndex].querySelector('img').src;
    lightboxImg.src = src;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    setTimeout(() => { lightboxImg.src = ''; }, 250);
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = visibleImages.indexOf(item);
      if (idx >= 0) openLightbox(idx);
    });
  });

  prevBtn.addEventListener('click', () => openLightbox(currentIndex - 1));
  nextBtn.addEventListener('click', () => openLightbox(currentIndex + 1));

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keyup', event => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape')      closeLightbox();
    if (event.key === 'ArrowRight')  openLightbox(currentIndex + 1);
    if (event.key === 'ArrowLeft')   openLightbox(currentIndex - 1);
  });

  updateVisibleItems();
});