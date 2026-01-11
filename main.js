document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Voting System with localStorage
    const votes = JSON.parse(localStorage.getItem('votes')) || {};

    // Initialize vote counts from localStorage
    updateAllVoteCounts();

    function updateAllVoteCounts() {
        document.querySelectorAll('.product-card').forEach(card => {
            const id = card.dataset.id;
            const voteCount = votes[id] || 0;
            const voteCountSpan = card.querySelector('.vote-count');
            const voteBtn = card.querySelector('.vote-button');

            if (voteCountSpan) {
                voteCountSpan.textContent = `${voteCount} vote${voteCount !== 1 ? 's' : ''}`;
            }

            // Check if user has voted for this item
            const userVotes = JSON.parse(localStorage.getItem('userVotes')) || {};
            if (userVotes[id]) {
                voteBtn.textContent = "Unvote";
                voteBtn.classList.add('voted');
            }
        });
    }

    function saveVotes() {
        localStorage.setItem('votes', JSON.stringify(votes));
    }

    // Voting Logic with Vote/Unvote
    document.querySelectorAll('.vote-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card expansion when voting
            const card = e.target.closest('.product-card');
            const id = card.dataset.id;
            const title = card.querySelector('h3').innerText;
            const voteCountSpan = card.querySelector('.vote-count');

            // Get user's votes
            const userVotes = JSON.parse(localStorage.getItem('userVotes')) || {};

            if (userVotes[id]) {
                // Unvote
                votes[id] = Math.max(0, (votes[id] || 0) - 1);
                delete userVotes[id];
                btn.textContent = "Vote for Design";
                btn.classList.remove('voted');
            } else {
                // Vote
                votes[id] = (votes[id] || 0) + 1;
                userVotes[id] = true;
                btn.textContent = "Unvote";
                btn.classList.add('voted');
            }

            // Update display
            const voteCount = votes[id] || 0;
            voteCountSpan.textContent = `${voteCount} vote${voteCount !== 1 ? 's' : ''}`;

            // Save to localStorage
            saveVotes();
            localStorage.setItem('userVotes', JSON.stringify(userVotes));
        });
    });

    // Card Expansion on Click (smoother animation)
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't expand if clicking on buttons or carousel controls
            if (e.target.closest('.vote-button') || e.target.closest('.carousel-btn')) {
                return;
            }

            // Toggle expanded state
            const isExpanded = card.classList.contains('expanded');

            // Remove expanded from all cards with smooth transition
            document.querySelectorAll('.product-card').forEach(c => {
                if (c !== card) {
                    c.classList.remove('expanded');
                }
            });

            // Add expanded to clicked card if it wasn't expanded
            if (!isExpanded) {
                card.classList.add('expanded');
            } else {
                card.classList.remove('expanded');
            }
        });
    });

    // Carousel Logic with 5-second intervals
    const products = document.querySelectorAll('.product-card');

    products.forEach(card => {
        const images = JSON.parse(card.dataset.images || '[]');
        if (images.length === 0) return;

        const imgElement = card.querySelector('.product-image');
        let currentIndex = 0;
        let interval;

        const updateImage = () => {
            imgElement.style.opacity = '0';
            setTimeout(() => {
                imgElement.src = images[currentIndex];
                imgElement.style.opacity = '1';
            }, 300);
        };

        const nextImage = () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateImage();
        };

        const prevImage = () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateImage();
        };

        // Auto-switch every 5 seconds (updated from 3s)
        if (images.length > 1) {
            interval = setInterval(nextImage, 5000);
        }

        // Manual controls
        const nextBtn = card.querySelector('.next');
        const prevBtn = card.querySelector('.prev');

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearInterval(interval);
                nextImage();
                if (images.length > 1) {
                    interval = setInterval(nextImage, 5000);
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearInterval(interval);
                prevImage();
                if (images.length > 1) {
                    interval = setInterval(nextImage, 5000);
                }
            });
        }

        // Pause on hover
        card.addEventListener('mouseenter', () => clearInterval(interval));
        card.addEventListener('mouseleave', () => {
            if (images.length > 1) {
                interval = setInterval(nextImage, 5000);
            }
        });
    });

    // Horizontal Collection Scrolling
    const productCarousel = document.getElementById('productCarousel');
    const prevScrollBtn = document.querySelector('.prev-scroll');
    const nextScrollBtn = document.querySelector('.next-scroll');

    if (prevScrollBtn && nextScrollBtn && productCarousel) {
        const scrollAmount = 400;

        prevScrollBtn.addEventListener('click', () => {
            productCarousel.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        nextScrollBtn.addEventListener('click', () => {
            productCarousel.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Optional: Hide buttons at scroll boundaries
        productCarousel.addEventListener('scroll', () => {
            const scrollLeft = productCarousel.scrollLeft;
            const maxScroll = productCarousel.scrollWidth - productCarousel.clientWidth;

            prevScrollBtn.style.opacity = scrollLeft <= 0 ? '0.3' : '0.9';
            nextScrollBtn.style.opacity = scrollLeft >= maxScroll ? '0.3' : '0.9';
        });
    }

    // Smooth scroll for navigation links
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

    // Floating Search Bar
    const searchBar = document.querySelector('.floating-search-bar');
    const searchInput = document.querySelector('.search-input');

    if (searchBar && searchInput) {
        // Expand on click
        searchBar.addEventListener('click', () => {
            searchBar.classList.add('expanded');
            searchInput.focus();
        });

        // Expand on focus
        searchInput.addEventListener('focus', () => {
            searchBar.classList.add('expanded');
        });

        // Collapse on blur (when clicking away)
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (document.activeElement !== searchInput) {
                    searchBar.classList.remove('expanded');
                    searchInput.value = '';
                }
            }, 200);
        });

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const productCards = document.querySelectorAll('.product-card');

            productCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('.product-info p').textContent.toLowerCase();

                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                } else {
                    card.style.opacity = '0.3';
                }
            });

            // Reset if search is empty
            if (searchTerm === '') {
                productCards.forEach(card => {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                });
            }
        });
    }
});
