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

    // EmailJS 초기화 (실제 Public Key로 변경 필요)
    // 사용법: https://www.emailjs.com/ 에서 계정 생성 후 설정
    const EMAILJS_SERVICE_ID = 'service_ibs2024';  // EmailJS 서비스 ID
    const EMAILJS_TEMPLATE_ID = 'template_ibs_contact'; // EmailJS 템플릿 ID
    const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // EmailJS Public Key
    
    // Google Sheets 설정 (Google Apps Script Web App URL)
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyU2hD-__cBsO2mGB4XaaPFdmXp8S4SLqKfCedG3NPbog45quQ9zoNSqVGNJkA3x4Yt/exec';
    
    // 캐시 무효화를 위한 타임스탬프 추가
    console.log('🔄 Google Apps Script URL 업데이트됨:', new Date().toISOString());
    console.log('📍 현재 사용 URL:', GOOGLE_SHEETS_URL);
    
    // EmailJS 초기화 (실제 사용 시 올바른 Public Key 입력 필요)
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    // Google Sheets에 데이터 저장 함수
    async function sendToGoogleSheets(formData) {
        try {
            console.log('📊 Google Sheets로 데이터 전송 시작...');
            console.log('📍 사용할 URL:', GOOGLE_SHEETS_URL);
            console.log('📋 전송할 데이터:', formData);
            
            // Form submit 방식으로 CORS 우회
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = GOOGLE_SHEETS_URL;
            form.target = 'hidden_iframe';
            form.style.display = 'none';

            // 각 폼 데이터를 개별 input으로 추가 (더 확실한 방법)
            Object.keys(formData).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = formData[key] || '';
                form.appendChild(input);
            });

            // 추가로 JSON 형태도 보내기
            const jsonInput = document.createElement('input');
            jsonInput.type = 'hidden';
            jsonInput.name = 'data';
            jsonInput.value = JSON.stringify(formData);
            form.appendChild(jsonInput);

            // Hidden iframe 생성 (응답 받기용)
            let iframe = document.getElementById('hidden_iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'hidden_iframe';
                iframe.name = 'hidden_iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            // iframe load 이벤트로 응답 확인
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.log('⚠️ 타임아웃: 5초 내에 응답 없음');
                    resolve({ success: true, timeout: true });
                }, 5000);

                iframe.onload = function() {
                    clearTimeout(timeout);
                    console.log('✅ iframe 로드 완료 - doPost 호출됨');
                    resolve({ success: true });
                };

                // Form을 DOM에 추가하고 submit
                document.body.appendChild(form);
                console.log('🚀 Form submit 실행...');
                form.submit();

                // Form 제거
                setTimeout(() => {
                    if (document.body.contains(form)) {
                        document.body.removeChild(form);
                    }
                }, 1000);
            });

        } catch (error) {
            console.error('❌ Google Sheets 전송 실패:', error);
            throw error;
        }
    }

    // 연락처 폼 처리 (EmailJS로 실제 이메일 전송)
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 폼 데이터 수집
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const company = document.getElementById('company').value;
            const message = document.getElementById('message').value;
            
            // 더 관대한 유효성 검사
            console.log('📝 폼 데이터 확인:', { name, email, phone, company, message });
            
            if (!name || !email || !message) {
                showNotification('이름, 이메일, 문의내용은 필수입니다.', 'error');
                return;
            }
            
            if (email && !isValidEmail(email)) {
                showNotification('올바른 이메일 주소를 입력해주세요.', 'error');
                return;
            }
            
            console.log('✅ 유효성 검사 통과');

            // 전송 중 상태 표시
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '전송 중...';
            submitBtn.disabled = true;

            // 폼 데이터 객체 생성
            const formData = { name, email, phone, company, message };

            // Google Sheets에 먼저 저장 (로컬 백업용)
            const sheetsSuccess = await sendToGoogleSheets(formData);

            // EmailJS로 이메일 전송 (일단 Google Sheets만 사용)
            if (false && typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
                // EmailJS 파라미터 설정
                const templateParams = {
                    from_name: name,
                    from_email: email,
                    phone: phone,
                    company: company,
                    message: message,
                    to_email: 'ibs@ibs-info.com', // 받는 이메일
                    reply_to: email
                };

                // EmailJS로 이메일 전송
                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                    .then(function(response) {
                        console.log('SUCCESS!', response.status, response.text);
                        
                        if (sheetsSuccess) {
                            showNotification('문의가 성공적으로 전송되었습니다! 관리 시트에도 저장되었습니다. 빠른 시일 내에 답변드리겠습니다.', 'success');
                        } else {
                            showNotification('문의가 성공적으로 전송되었습니다! 빠른 시일 내에 답변드리겠습니다.', 'success');
                        }
                        
                        // 폼 초기화
                        contactForm.reset();
                        
                        // 라벨 위치 초기화
                        const labels = contactForm.querySelectorAll('label');
                        labels.forEach(label => {
                            animateLabel(label, false);
                        });
                        
                    }, function(error) {
                        console.log('FAILED...', error);
                        
                        if (sheetsSuccess) {
                            showNotification('이메일 전송은 실패했지만 문의 내용이 시트에 저장되었습니다. 직접 연락처로 문의해 주세요.', 'error');
                        } else {
                            showNotification('전송에 실패했습니다. 직접 연락처로 문의해 주세요.', 'error');
                        }
                        
                        // 대체 방법: 직접 연락처 표시
                        setTimeout(() => {
                            showContactAlternative();
                        }, 2000);
                    })
                    .finally(function() {
                        // 버튼 상태 복원
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    });
            } else {
                // 현재는 Google Sheets 저장 + 직접 연락 안내 방식
                if (sheetsSuccess) {
                    showNotification('✅ 문의가 접수되었습니다! 시트에 저장되었으며, 빠른 시일 내에 연락드리겠습니다.', 'success');
                    
                    // 폼 초기화
                    contactForm.reset();
                    
                    // 라벨 위치 초기화
                    const labels = contactForm.querySelectorAll('label');
                    labels.forEach(label => {
                        animateLabel(label, false);
                    });
                    
                } else {
                    showNotification('❌ 자동 접수에 실패했습니다. 아래 연락처로 직접 문의해 주세요.', 'error');
                    
                    // 연락처 정보 표시
                    setTimeout(() => {
                        showContactAlternative();
                    }, 1000);
                }
                
                // 버튼 상태 복원
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // 폼 필드 이벤트 처리 추가
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

    // 대체 연락 방법 안내 함수
    function showContactAlternative() {
        const alternativeHtml = `
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-top: 1rem; border: 1px solid #e2e8f0;">
                <h4 style="color: #2563eb; margin-bottom: 1rem;">
                    <i class="fas fa-phone"></i> 빠른 연락 방법
                </h4>
                <div style="display: grid; gap: 0.8rem;">
                    <a href="tel:010-3664-6268" style="color: #2563eb; text-decoration: none; font-weight: 500;">
                        📞 이준로 대표: 010-3664-6268
                    </a>
                    <a href="mailto:ibs@ibs-info.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">
                        📧 ibs@ibs-info.com
                    </a>
                </div>
            </div>
        `;
        
        const contactForm = document.getElementById('contactForm');
        if (contactForm && !contactForm.querySelector('.contact-alternative')) {
            const altDiv = document.createElement('div');
            altDiv.className = 'contact-alternative';
            altDiv.innerHTML = alternativeHtml;
            contactForm.appendChild(altDiv);
        }
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