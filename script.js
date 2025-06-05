// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 네비게이션 요소들
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // 모바일 네비게이션 토글
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // body 스크롤 제어 (모바일에서 메뉴 열릴 때)
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        // 햄버거 아이콘 애니메이션
        const spans = hamburger.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (hamburger.classList.contains('active')) {
                if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) span.style.opacity = '0';
                if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                span.style.transform = 'none';
                span.style.opacity = '1';
            }
        });
    });

    // 네비게이션 링크 클릭 시 모바일 메뉴 닫기
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            const spans = hamburger.querySelectorAll('span');
            spans.forEach(span => {
                span.style.transform = 'none';
                span.style.opacity = '1';
            });
        });
    });

    // 모바일에서 외부 클릭 시 메뉴 닫기
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                
                const spans = hamburger.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            }
        }
    });

    // 화면 크기 변경 시 메뉴 상태 초기화
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            const spans = hamburger.querySelectorAll('span');
            spans.forEach(span => {
                span.style.transform = 'none';
                span.style.opacity = '1';
            });
        }
    });

    // 스크롤 시 네비게이션 스타일 변경
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    let ticking = false;

    function updateNavbar() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }

        // 스크롤 애니메이션을 위한 요소들 관찰
        observeElements();
        
        lastScroll = currentScroll;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });

    // 스크롤 애니메이션
    function observeElements() {
        const animateElements = document.querySelectorAll('.service-card, .portfolio-item, .feature, .contact-item');
        
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = window.innerHeight * 0.8; // 모바일에서 더 빨리 나타나도록
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('fade-in-up');
            }
        });
    }

    // 부드러운 스크롤 (모바일 최적화)
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                const offsetTop = targetSection.offsetTop - navbarHeight;
                
                // 모바일에서 더 부드러운 스크롤
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 터치 이벤트 최적화 (모바일)
    if ('ontouchstart' in window) {
        // 터치 가능한 요소들에 터치 피드백 추가
        const touchElements = document.querySelectorAll('.btn-primary, .btn-secondary, .service-card, .portfolio-item, .contact-item');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }

    // 연락처 폼 처리
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 폼 데이터 수집
            const formData = new FormData(this);
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const company = document.getElementById('company').value;
            const message = document.getElementById('message').value;
            
            // 유효성 검사
            if (!name || !email || !company || !message) {
                showNotification('모든 필드를 채워주세요.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('올바른 이메일 주소를 입력해주세요.', 'error');
                return;
            }
            
            // 이메일 링크 생성 (실제 서버 없이 이메일 클라이언트로 전송)
            const emailSubject = encodeURIComponent(`I.B.S 문의 - ${company}에서 ${name}님`);
            const emailBody = encodeURIComponent(`
안녕하세요 I.B.S입니다.

문의자 정보:
- 이름: ${name}
- 이메일: ${email}
- 회사명: ${company}

문의내용:
${message}

감사합니다.
            `);
            
            const mailtoLink = `mailto:ibs@ibs-info.com?subject=${emailSubject}&body=${emailBody}`;
            
            // 이메일 클라이언트 열기
            window.location.href = mailtoLink;
            
            // 성공 메시지
            showNotification('문의가 성공적으로 전송되었습니다!', 'success');
            
            // 폼 초기화
            this.reset();
            
            // 라벨 위치 초기화
            const labels = this.querySelectorAll('label');
            labels.forEach(label => {
                label.style.top = '1rem';
                label.style.fontSize = '1rem';
                label.style.color = 'var(--gray-500)';
            });
        });
        
        // 폼 필드 이벤트 처리
        const formInputs = contactForm.querySelectorAll('input, textarea');
        
        formInputs.forEach(input => {
            // 포커스 이벤트
            input.addEventListener('focus', function() {
                const label = this.nextElementSibling;
                if (label && label.tagName === 'LABEL') {
                    animateLabel(label, true);
                }
            });
            
            // 블러 이벤트
            input.addEventListener('blur', function() {
                const label = this.nextElementSibling;
                if (label && label.tagName === 'LABEL' && !this.value) {
                    animateLabel(label, false);
                }
            });
            
            // 입력 이벤트
            input.addEventListener('input', function() {
                const label = this.nextElementSibling;
                if (label && label.tagName === 'LABEL') {
                    if (this.value) {
                        animateLabel(label, true);
                    }
                }
            });
        });
    }

    // 라벨 애니메이션
    function animateLabel(label, isActive) {
        if (isActive) {
            label.style.top = '-0.5rem';
            label.style.left = '0.5rem';
            label.style.fontSize = '0.8rem';
            label.style.color = 'var(--primary-color)';
        } else {
            label.style.top = '1rem';
            label.style.left = '1rem';
            label.style.fontSize = '1rem';
            label.style.color = 'var(--gray-500)';
        }
    }

    // 이메일 유효성 검사
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 알림 메시지 표시
    function showNotification(message, type = 'info') {
        // 기존 알림이 있다면 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // 스타일 적용
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        // 타입별 색상 설정
        if (type === 'success') {
            notification.style.background = 'var(--success-color)';
        } else if (type === 'error') {
            notification.style.background = '#ef4444';
        } else {
            notification.style.background = 'var(--primary-color)';
        }

        // DOM에 추가
        document.body.appendChild(notification);

        // 애니메이션으로 표시
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 닫기 버튼 이벤트
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            removeNotification(notification);
        });

        // 5초 후 자동 제거
        setTimeout(() => {
            if (document.body.contains(notification)) {
                removeNotification(notification);
            }
        }, 5000);
    }

    // 알림 제거
    function removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 300);
    }

    // 카운터 애니메이션
    function animateCounters() {
        const counters = document.querySelectorAll('.stat h3');
        
        counters.forEach(counter => {
            const target = counter.textContent.replace(/[^0-9]/g, '');
            if (target) {
                const increment = Math.ceil(target / 100);
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        if (current > target) current = target;
                        
                        // 원래 텍스트 형태 유지
                        const originalText = counter.textContent;
                        counter.textContent = originalText.replace(/[0-9]+/, current);
                        
                        setTimeout(updateCounter, 20);
                    }
                };
                
                updateCounter();
            }
        });
    }

    // 스크롤 시 카운터 애니메이션 트리거
    let counterAnimated = false;
    
    window.addEventListener('scroll', () => {
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats && !counterAnimated) {
            const rect = heroStats.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8) {
                animateCounters();
                counterAnimated = true;
            }
        }
    });

    // 페이지 로드 시 초기 애니메이션
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(30px)';
            heroContent.style.transition = 'all 0.8s ease';
            
            setTimeout(() => {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 500);
        }
    }, 100);

    // 초기 관찰 실행
    observeElements();
    
    console.log('I.B.S 웹사이트가 성공적으로 로드되었습니다!');
}); 