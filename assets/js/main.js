/**
 * Sri Veerabhadra Nursery & Gardens
 * Shared site scripts – header, navigation, footer, page interactions
 */

(function () {
  'use strict';

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getPlantLookupValue(plant) {
    if (!plant) return '';
    return String(plant.slug || plant.id || plant.commonName || plant.name || '').trim();
  }

  function getPlantDetailFallbacks(plant) {
    return {
      description: plant.description || plant.shortDescription || 'A beautiful plant selected for landscaping and ornamental use.',
      uses: plant.uses || plant.shortDescription || 'Suitable for landscaping, avenue planting, and ornamental projects.',
      growthRate: plant.growthRate || plant.growthInfo || (plant.maintenanceLevel ? 'Moderate growth with ' + plant.maintenanceLevel.toLowerCase() + ' maintenance.' : 'Moderate growth with regular care.')
    };
  }

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileNav();
    initHeaderScroll();
    initFooterYear();
    initFloatingWhatsAppButton();
    initBlogCards();
    initPlantsFilters();
    initNewsletter();
    initContactForm();
    initBlogDetail();
    initPlantDetail();
  }

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.site-header__panel');

    if (!toggle || !panel) return;

    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        panel.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        panel.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function updateScrollState() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
  }

  function initFooterYear() {
    var yearEl = document.getElementById('footer-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function initFloatingWhatsAppButton() {
    if (document.querySelector('.floating-whatsapp')) return;

    var button = document.createElement('a');
    button.className = 'btn btn--whatsapp floating-whatsapp';
    button.href = 'https://wa.me/918367226375';
    button.setAttribute('aria-label', 'Chat on WhatsApp');
    button.setAttribute('title', 'Chat on WhatsApp');
    button.setAttribute('rel', 'noopener noreferrer');
    button.innerHTML =
      '<svg class="floating-whatsapp__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 3.5A11.8 11.8 0 0 0 2.4 18.1L1.5 22l4-1A11.8 11.8 0 0 0 20.5 3.5Zm-8.4 17.1a9.6 9.6 0 0 1-4.9-1.3l-.3-.2-2.8.7.8-2.7-.2-.3A9.6 9.6 0 1 1 12.1 20.6Zm5.5-7.1c-.3-.2-1.7-.8-2-.9s-.5-.2-.7.2-.8.9-1 .9-.4.1-.7-.1a7.8 7.8 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.4-.5.1-.4-.9-2.1c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1.1 1-1.1 2.5 1.1 2.9 1.3 3.1 2.2 3.5 5.4 4.8c.8.3 1.4.5 1.8.6.8.2 1.5.2 2 .1.6-.1 1.7-.7 1.9-1.3s.2-1.1.1-1.2-.3-.2-.6-.4Z" fill="currentColor"/></svg>';

    document.body.appendChild(button);
  }

  function initBlogCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-blog-card]'));
    if (!cards.length) return;

    cards.forEach(function (card) {
      var link = card.querySelector('a[href*="blog-detail"]');
      var targetUrl = link ? link.getAttribute('href') : 'blog-detail.html';

      card.addEventListener('click', function (event) {
        var interactiveElement = event.target.closest('a, button, input, textarea, select, label');
        if (interactiveElement && interactiveElement !== card) return;
        window.location.href = targetUrl;
      });

      card.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        window.location.href = targetUrl;
      });
    });
  }

  function initPlantsFilters() {
    var searchInput = document.getElementById('plant-search');
    var grid = document.getElementById('plant-grid');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));
    var resultCount = document.getElementById('plants-result-count');
    var emptyState = document.getElementById('plants-empty-state');
    var clearFilters = document.getElementById('plants-clear-filters');

    if (!searchInput || !grid) return;

    var activeCategory = 'all';

    function getCards() {
      return Array.prototype.slice.call(document.querySelectorAll('[data-plant-card]'));
    }

    function updateFilterButtons() {
      filterButtons.forEach(function (button) {
        var category = button.dataset.categoryFilter || 'all';
        var isActive = category === activeCategory;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    }

    function updateResultCount(visibleCount) {
      if (resultCount) {
        resultCount.textContent = visibleCount + ' Plant' + (visibleCount === 1 ? '' : 's') + ' Found';
      }
    }

    function updateEmptyState(visibleCount) {
      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
      grid.hidden = visibleCount === 0;
    }

    function applyFilter() {
      var query = normalizeText(searchInput.value);
      var visibleCount = 0;

      getCards().forEach(function (card) {
        var name = normalizeText(card.dataset.name);
        var category = card.dataset.category || '';
        var matchesSearch = !query || name.indexOf(query) !== -1 || normalizeText(category).indexOf(query) !== -1;
        var matchesCategory = activeCategory === 'all' || category === activeCategory;
        var isVisible = matchesSearch && matchesCategory;

        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) visibleCount += 1;
      });

      updateResultCount(visibleCount);
      updateEmptyState(visibleCount);
    }

    searchInput.addEventListener('input', applyFilter);

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.dataset.categoryFilter || 'all';
        updateFilterButtons();
        applyFilter();
      });
    });

    if (clearFilters) {
      clearFilters.addEventListener('click', function () {
        searchInput.value = '';
        activeCategory = 'all';
        updateFilterButtons();
        applyFilter();
        searchInput.focus();
      });
    }

    updateFilterButtons();
    applyFilter();
  }

  function initNewsletter() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var emailInput = form.querySelector('input[name="email"]');
      if (!emailInput || !emailInput.value) return;

      var button = form.querySelector('button');
      var originalText = button.textContent;

      button.disabled = true;
      button.textContent = 'Subscribing...';

      window.setTimeout(function () {
        button.textContent = 'Subscribed!';
        form.reset();

        window.setTimeout(function () {
          button.disabled = false;
          button.textContent = originalText;
        }, 3000);
      }, 1500);
    });
  }

  function initContactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var formData = new FormData(form);
      var lines = [];
      formData.forEach(function (value, key) {
        lines.push(key + ': ' + value);
      });

      var subject = encodeURIComponent('Plant Inquiry – Sri Veerabhadra Nursery');
      var body = encodeURIComponent(lines.join('\n'));
      window.location.href = 'mailto:sriveerabhadranursery@gmail.com?subject=' + subject + '&body=' + body;
    });
  }

  function initBlogDetail() {
    var titleEl = document.getElementById('blog-detail-title');
    if (!titleEl) return;

    var urlParams = new URLSearchParams(window.location.search);
    var blogId = urlParams.get('id');

    if (!blogId) return;

    fetch('blogs.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (blogs) {
        var blog = blogs.find(function (b) {
          return b.id === blogId;
        });

        if (!blog) return;

        titleEl.textContent = blog.title;
        document.title = blog.title + ' | Sri Veerabhadra Nursery & Gardens';

        var dateEl = document.getElementById('blog-detail-date');
        if (dateEl) dateEl.textContent = blog.date;

        var imageEl = document.getElementById('blog-detail-image');
        if (imageEl && blog.featuredImage) {
          imageEl.style.backgroundImage = 'url("' + blog.featuredImage + '")';
          imageEl.style.backgroundSize = 'cover';
          imageEl.style.backgroundPosition = 'center';
          imageEl.setAttribute('aria-label', blog.title);
        }

        var introEl = document.getElementById('blog-detail-intro');
        if (introEl) introEl.textContent = blog.introduction;

        var bodyEl = document.getElementById('blog-detail-body');
        if (bodyEl) {
          var contentHtml = '';

          if (blog.quickFacts && blog.quickFacts.length) {
            contentHtml += '<h3 id="quick-facts">Quick Facts</h3><ul>';
            blog.quickFacts.forEach(function (fact) {
              contentHtml += '<li>' + fact + '</li>';
            });
            contentHtml += '</ul>';
          }

          if (blog.benefits && blog.benefits.length) {
            contentHtml += '<h3 id="benefits">Key Benefits</h3><ul>';
            blog.benefits.forEach(function (benefit) {
              contentHtml += '<li>' + benefit + '</li>';
            });
            contentHtml += '</ul>';
          }

          if (blog.plantingGuide && blog.plantingGuide.length) {
            contentHtml += '<h3 id="planting-guide">Planting Guide</h3><ol>';
            blog.plantingGuide.forEach(function (step) {
              contentHtml += '<li>' + step + '</li>';
            });
            contentHtml += '</ol>';
          }

          if (blog.maintenanceTips && blog.maintenanceTips.length) {
            contentHtml += '<h3 id="maintenance">Maintenance Tips</h3><ul>';
            blog.maintenanceTips.forEach(function (tip) {
              contentHtml += '<li>' + tip + '</li>';
            });
            contentHtml += '</ul>';
          }

          if (blog.faqs && blog.faqs.length) {
            contentHtml += '<h3 id="faqs">Frequently Asked Questions</h3>';
            blog.faqs.forEach(function (faq) {
              contentHtml += '<div><strong>' + faq.question + '</strong><p>' + faq.answer + '</p></div>';
            });
          }

          contentHtml += '<h3 id="conclusion">Conclusion</h3><p>' + blog.conclusion + '</p>';
          bodyEl.innerHTML = contentHtml;
        }

        var tocList = document.getElementById('blog-detail-toc-list');
        if (tocList) {
          var tocHtml = '';
          if (blog.quickFacts && blog.quickFacts.length) tocHtml += '<li><a href="#quick-facts">Quick Facts</a></li>';
          if (blog.benefits && blog.benefits.length) tocHtml += '<li><a href="#benefits">Benefits</a></li>';
          if (blog.plantingGuide && blog.plantingGuide.length) tocHtml += '<li><a href="#planting-guide">Planting Guide</a></li>';
          if (blog.maintenanceTips && blog.maintenanceTips.length) tocHtml += '<li><a href="#maintenance">Maintenance</a></li>';
          if (blog.faqs && blog.faqs.length) tocHtml += '<li><a href="#faqs">FAQs</a></li>';
          tocHtml += '<li><a href="#conclusion">Conclusion</a></li>';
          tocList.innerHTML = tocHtml;
        }

        var relatedGrid = document.getElementById('blog-detail-related-grid');
        if (relatedGrid && blog.relatedIds) {
          var relatedHtml = '';
          blogs.forEach(function (b) {
            if (blog.relatedIds.indexOf(b.id) !== -1 && b.id !== blogId) {
              relatedHtml +=
                '<article class="blog-card blog-card--compact">' +
                '<div class="blog-card__image img-placeholder" role="img" aria-label="' + b.title + '" style="background-image:url(\'' + b.featuredImage + '\');background-size:cover;background-position:center;"></div>' +
                '<div class="blog-card__body">' +
                '<span class="blog-card__tag">' + b.tag + '</span>' +
                '<h3 class="blog-card__title">' + b.title + '</h3>' +
                '<p class="blog-card__excerpt">' + b.excerpt + '</p>' +
                '<a href="blog-detail.html?id=' + b.id + '" class="blog-card__link">Read More</a>' +
                '</div></article>';
            }
          });
          relatedGrid.innerHTML = relatedHtml;
        }
      })
      .catch(function (error) {
        console.error('Error loading blog data:', error);
      });
  }

  function initPlantDetail() {
    var titleEl = document.getElementById('plant-detail-title');
    if (!titleEl) return;

    var urlParams = new URLSearchParams(window.location.search);
    var requestedPlant = urlParams.get('slug') || urlParams.get('id') || urlParams.get('plant') || '';
    if (!requestedPlant) return;

    fetch('plants.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (plants) {
        var plant = plants.find(function (item) {
          var lookupValue = getPlantLookupValue(item);
          return (lookupValue && normalizeText(lookupValue) === normalizeText(requestedPlant)) ||
            (lookupValue && slugify(lookupValue) === slugify(requestedPlant)) ||
            normalizeText(item.commonName) === normalizeText(requestedPlant) ||
            slugify(item.commonName) === slugify(requestedPlant);
        });

        if (!plant) return;

        var details = getPlantDetailFallbacks(plant);
        titleEl.textContent = plant.commonName;

        var imageEl = document.getElementById('plant-detail-main-image');
        if (imageEl && plant.image) {
          imageEl.style.backgroundImage = 'url("' + plant.image + '")';
          imageEl.style.backgroundSize = 'cover';
          imageEl.style.backgroundPosition = 'center';
          imageEl.setAttribute('aria-label', plant.seoAltText || plant.commonName);
        }

        var scientificEl = document.getElementById('plant-detail-scientific');
        if (scientificEl) scientificEl.textContent = plant.scientificName;

        var commonEl = document.getElementById('plant-detail-common');
        if (commonEl) commonEl.textContent = plant.commonName;

        var categoryEl = document.getElementById('plant-detail-category');
        if (categoryEl) categoryEl.textContent = plant.category;

        var descriptionEl = document.getElementById('plant-detail-description');
        if (descriptionEl) descriptionEl.textContent = details.description;

        var usesEl = document.getElementById('plant-detail-uses');
        if (usesEl) usesEl.textContent = details.uses;

        var growthEl = document.getElementById('plant-detail-growth');
        if (growthEl) growthEl.textContent = details.growthRate;

        var waterEl = document.getElementById('plant-detail-water');
        if (waterEl) waterEl.textContent = plant.waterRequirement || 'Moderate';

        var sunlightEl = document.getElementById('plant-detail-sunlight');
        if (sunlightEl) sunlightEl.textContent = plant.sunlightRequirement || 'Full Sun';

        var maintenanceEl = document.getElementById('plant-detail-maintenance');
        if (maintenanceEl) maintenanceEl.textContent = plant.maintenanceLevel || 'Medium';
      })
      .catch(function (error) {
        console.error('Error loading plant data:', error);
      });
  }
})();
