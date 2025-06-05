# I.B.S 웹사이트 호스팅 가이드

## 🌐 웹사이트를 인터넷에 올리는 방법

### 🆓 방법 1: GitHub Pages (무료, 추천)

#### 1단계: GitHub 계정 만들기
1. https://github.com 접속
2. "Sign up" 클릭해서 계정 생성

#### 2단계: 새 저장소 만들기
1. GitHub 로그인 후 "New repository" 클릭
2. Repository name: `ibs-website` (또는 원하는 이름)
3. "Public" 선택
4. "Create repository" 클릭

#### 3단계: 파일 업로드
1. "uploading an existing file" 클릭
2. 우리가 만든 파일들 드래그 앤 드롭:
   - index.html
   - styles.css  
   - script.js
   - README.md
3. "Commit changes" 클릭

#### 4단계: GitHub Pages 활성화
1. 저장소에서 "Settings" 탭 클릭
2. 왼쪽 메뉴에서 "Pages" 클릭
3. Source에서 "Deploy from a branch" 선택
4. Branch: "main" 선택
5. "Save" 클릭

#### 5단계: 웹사이트 주소 확인
- 몇 분 후 `https://[username].github.io/ibs-website` 주소로 접속 가능

### 💰 방법 2: Cafe24 호스팅 (유료)

#### 웹호스팅 신청
1. https://www.cafe24.com 접속
2. "웹호스팅" → "리눅스 웹호스팅" 선택
3. 기본형 (월 1,100원) 또는 표준형 선택
4. 신청 및 결제

#### 파일 업로드
1. 호스팅 관리자 페이지 로그인
2. "파일관리자" 접속
3. `public_html` 폴더에 파일 업로드:
   - index.html
   - styles.css
   - script.js

### 🔗 방법 3: 기존 도메인 연결

#### 현재 상황 확인 필요:
1. **도메인 구매처**: 어디서 ibs-info.com을 구매했나요?
2. **네임서버 설정**: 도메인이 어떤 호스팅을 가리키고 있나요?
3. **호스팅 계정**: 웹호스팅 서비스를 신청했나요?

#### 도메인 연결 단계:
1. 웹호스팅 서비스 신청
2. 호스팅 업체에서 제공하는 네임서버 정보 확인
3. 도메인 관리 페이지에서 네임서버 변경
4. 호스팅에 HTML 파일 업로드

## 🚀 추천 순서

### 1단계: 임시로 GitHub Pages 사용
- 무료로 바로 웹사이트 올리기
- 주소: `https://[username].github.io/ibs-website`

### 2단계: 도메인 연결 준비
- Cafe24 등에서 웹호스팅 신청
- 도메인 네임서버 설정
- www.ibs-info.com으로 접속 가능하게 만들기

## 🛠️ 즉시 확인할 방법

### 로컬에서 테스트 서버 실행:
```bash
# 파일이 있는 폴더에서
python -m http.server 8000
```
→ http://localhost:8000 에서 확인 가능

## 📞 필요한 정보

ibs-info.com 도메인을 완전히 연결하려면:
1. **도메인 구매처** (가비아, 후이즈, GoDaddy 등)
2. **현재 네임서버 설정** 상태
3. **웹호스팅 계획** (무료 vs 유료)

## ⚡ 빠른 시작

**지금 당장 웹사이트 보고 싶다면:**
1. GitHub 계정 만들기 (5분)
2. 파일 업로드 (5분)  
3. GitHub Pages 활성화 (2분)
4. 완성! 🎉

**도메인 연결은 나중에 차근차근 설정하기** 