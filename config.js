// 🎯 IBS 통합 시스템 설정 파일
// 모든 HTML 파일에서 공통으로 사용하는 설정값들

const IBS_CONFIG = {
    // 🔗 Google Apps Script API URL (통일된 엔드포인트)
    API_URL: 'https://script.google.com/macros/s/AKfycbzXI3Aulv7fnx0DHP0DGUkgeDjHlNpMP7QpcxUwzyqlBR9IMw_s5Lpdbx3fyMcKYOEU8Q/exec',
    
    // 📊 구글시트 ID
    SPREADSHEET_ID: '1MUHiU8a0p1aBs0wU94gmmlugwmB9qSYO8NLl-qZ9-ho',
    
    // 📋 시트 이름들
    SHEETS: {
        QUOTATION: 'IBS_견적서_목록',
        TRANSACTION: 'IBS_거래명세서_목록', 
        INVOICE: 'IBS_인보이스_목록',
        STATS: 'IBS_통계_대시보드'
    },
    
    // ⏱️ 타임아웃 설정
    TIMEOUT: 5000, // 5초
    
    // 🔄 자동 새로고침 간격
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5분
    
    // 🏢 회사 정보
    COMPANY: {
        name: '아이비에스(I.B.S)',
        fullName: 'INNOVATION BRIDGE SOLUTION',
        ceo: '이준로',
        phone: '010-3664-6268',
        fax: '0504-440-6268',
        email: 'ibs@ibs-info.com',
        website: 'web.ibs-info.com',
        address: '경기도 수원시 장안구 덕영대로 417번길 52-5 나동 502호',
        businessNumber: '405-08-53668'
    },
    
    // 🛠️ 서비스 목록
    SERVICES: {
        'Wire Probe JIG 설계': {
            specs: '▶ 거버파일 분석 및 최적화 설계\n▶ 20년 경력 전문가 직접 설계\n▶ 3D 모델링 및 도면 제공\n▶ 설계 검증 및 시뮬레이션',
            price: 2000000
        },
        'JIG 제작 서비스': {
            specs: '▶ 설계 완료 후 완제품 제작\n▶ 품질 검증 및 테스트 완료\n▶ 1년 무상 A/S 포함\n▶ 현장 설치 및 교육',
            price: 3000000
        },
        'MEMS JIG 개발': {
            specs: '▶ 세계 최초 전기검사 MEMS JIG\n▶ 20~30㎛ 통합 Structure 설계\n▶ 고정밀 측정 솔루션\n▶ 완제품 제작 포함',
            price: 5000000
        },
        '소프트웨어 교육': {
            specs: '▶ IA-Station, EZ-Cat 교육\n▶ Cam350, AutoCAD 활용법\n▶ 1:1 맞춤 교육 (8시간)\n▶ 실습 자료 및 매뉴얼 제공',
            price: 500000
        },
        '기술 컨설팅': {
            specs: '▶ 20년 노하우 기반 기술 컨설팅\n▶ 설계 프로세스 최적화\n▶ 비용 절감 방안 제시\n▶ 정기 기술 지원',
            price: 1000000
        },
        'PCB 설계 서비스': {
            specs: '▶ 다층 PCB 설계 및 최적화\n▶ EMI/EMC 고려 설계\n▶ 부품 배치 최적화\n▶ 제조성 검토 포함',
            price: 1500000
        },
        '테스트 픽스처 제작': {
            specs: '▶ ICT/FCT 테스트 픽스처\n▶ 정밀 가공 및 조립\n▶ 성능 검증 완료\n▶ 유지보수 매뉴얼 제공',
            price: 2500000
        },
        '프로그래밍 서비스': {
            specs: '▶ 테스트 프로그램 개발\n▶ 자동화 시스템 구축\n▶ 디버깅 및 최적화\n▶ 기술 문서 작성',
            price: 800000
        }
    }
};

// 🔧 공통 유틸리티 함수들
const IBS_UTILS = {
    // 천단위 콤마 포맷팅
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    // 콤마 제거하여 숫자로 변환
    parseNumber: (str) => {
        return parseFloat(str.toString().replace(/,/g, '')) || 0;
    },
    
    // 오늘 날짜 반환
    getTodayDate: () => {
        return new Date().toISOString().split('T')[0];
    },
    
    // 날짜 + 일수 계산
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    },
    
    // 메시지 표시
    showMessage: (message, type = 'info') => {
        const alertClass = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
        alert(`${alertClass} ${message}`);
    },
    
    // 로딩 상태 표시
    showLoading: (show, element = null) => {
        if (element) {
            element.disabled = show;
            if (show) {
                element.dataset.originalText = element.textContent;
                element.textContent = '🔄 처리 중...';
            } else {
                element.textContent = element.dataset.originalText || element.textContent;
            }
        }
    }
};

// 🌐 API 호출 공통 함수
const IBS_API = {
    // GET 요청
    get: async (action, params = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), IBS_CONFIG.TIMEOUT);
        
        try {
            const url = new URL(IBS_CONFIG.API_URL);
            url.searchParams.append('action', action);
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            clearTimeout(timeoutId);
            console.error(`API GET 오류 (${action}):`, error);
            throw error;
        }
    },
    
    // POST 요청
    post: async (data) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), IBS_CONFIG.TIMEOUT);
        
        try {
            const response = await fetch(IBS_CONFIG.API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('API POST 오류:', error);
            throw error;
        }
    }
};

console.log('✅ IBS 통합 설정 파일 로드 완료'); 