# I.B.S 회사 웹사이트

## 개요

I.B.S(Innovation Beyond Standard)는 반도체 PCB JIG 설계 전문 기업의 공식 웹사이트입니다. 20년 경력의 JIG 설계 전문가가 제공하는 혁신적인 솔루션을 소개합니다.

## 주요 특징

### 🎨 현대적인 디자인
- 반응형 웹 디자인으로 모든 기기에서 최적화
- 전문적인 블루 컬러 테마
- 부드러운 애니메이션과 인터랙션

### 🔧 핵심 기능
- **회사 소개**: I.B.S의 비전과 전문성 소개
- **전문 서비스**: JIG 설계, 기술 컨설팅, 기술영업 지원
- **포트폴리오**: 주요 프로젝트 및 성과 소개
- **연락처**: 문의 폼과 연락처 정보

### 📱 반응형 디자인
- 데스크톱, 태블릿, 모바일 완벽 지원
- 모바일 네비게이션 메뉴
- 터치 친화적 인터페이스

## 파일 구조

```
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일시트
├── script.js           # JavaScript 기능
└── README.md           # 프로젝트 설명서
```

## 주요 섹션

### 1. 네비게이션
- 고정 헤더로 항상 접근 가능
- 부드러운 스크롤 이동
- 모바일 햄버거 메뉴

### 2. 히어로 섹션
- 강력한 첫인상을 주는 메인 배너
- 핵심 통계 정보 (20년 경력, 100+ 프로젝트, 세계최초 MEMS JIG)
- 액션 버튼으로 바로 연결

### 3. 회사 소개
- I.B.S의 비전과 미션
- 대표 프로필 및 경력 사항
- 핵심 역량 소개

### 4. 전문 서비스
- JIG 설계 및 개발
- 기술 컨설팅
- 기술영업 지원

### 5. 포트폴리오
- Wire Probe JIG 개발 (2024-2025)
- MEMS JIG 개발 (2020-2022)
- 30um Probe JIG 개발 (2021)
- Probe Stagger Process 개선

### 6. 연락처
- 실시간 문의 폼
- 이메일 자동 연결
- 회사 정보

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, 애니메이션
- **JavaScript ES6+**: 모던 자바스크립트
- **Font Awesome**: 아이콘
- **Google Fonts**: 웹 폰트 (Noto Sans KR)

## 브라우저 호환성

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- 모바일 브라우저 완벽 지원

## 설치 및 실행

1. 프로젝트 파일을 다운로드합니다.
2. `index.html` 파일을 웹 브라우저에서 열어주세요.
3. 로컬 서버를 사용하는 경우:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # Live Server (VS Code 확장)
   Live Server로 실행
   ```

## 문의 기능

### 이메일 연동
- 문의 폼 제출 시 사용자의 기본 이메일 클라이언트가 실행됩니다
- 수신자: `ibs@ibs-info.com`
- 자동으로 제목과 내용이 구성됩니다

### 폼 검증
- 모든 필드 필수 입력
- 이메일 형식 검증
- 실시간 알림 메시지

## 커스터마이징

### 색상 변경
`styles.css`의 `:root` 섹션에서 CSS 변수를 수정하세요:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    --accent-color: #3b82f6;
    /* 기타 색상 변수들... */
}
```

### 내용 수정
`index.html`에서 텍스트 내용을 직접 수정할 수 있습니다.

### 애니메이션 조정
`script.js`에서 애니메이션 타이밍과 효과를 조정할 수 있습니다.

## 성능 최적화

- 이미지 lazy loading
- CSS/JS 최적화
- 웹 폰트 최적화
- 반응형 이미지

## SEO 최적화

- 시맨틱 HTML 구조
- 메타 태그 최적화
- 구조화된 데이터
- 접근성 준수

## 연락처

- **이메일**: ibs@ibs-info.com
- **회사명**: I.B.S (Innovation Beyond Standard)
- **전문분야**: 반도체 PCB JIG 설계 및 개발

---

© 2024 I.B.S. All rights reserved. 