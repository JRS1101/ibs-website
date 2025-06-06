# I.B.S 문의 폼 → Google Sheets 자동 저장 설정 가이드

## 🎯 목표
고객이 웹사이트 문의 폼을 작성하면:
1. **자동으로 ibs@ibs-info.com 이메일 전송**
2. **동시에 Google Sheets에 자동 저장** (엑셀로 다운로드 가능)
3. **실시간 문의 내역 관리**

## 📝 현재 상황
- ✅ EmailJS 설정 준비됨 (emailjs_setup_guide.md 참고)
- ✅ Google Sheets 저장 코드 구현됨
- ⚠️ **Google Apps Script 웹앱 배포 필요**

---

## 🚀 1단계: Google Sheets 생성

### 1. Google Drive 접속
1. [Google Drive](https://drive.google.com) 접속
2. **새로 만들기** → **Google Sheets** → **빈 스프레드시트**

### 2. 스프레드시트 설정
1. 이름을 **"I.B.S 문의 관리 시트"**로 변경
2. 첫 번째 시트 이름을 **"I.B.S 문의내역"**으로 변경

### 3. 스프레드시트 ID 복사
- URL에서 스프레드시트 ID 복사
- 예: `https://docs.google.com/spreadsheets/d/[이_부분이_ID]/edit`

---

## 🛠️ 2단계: Google Apps Script 설정

### 1. Apps Script 프로젝트 생성
1. [Google Apps Script](https://script.google.com) 접속
2. **새 프로젝트** 클릭
3. 프로젝트 이름을 **"I.B.S 문의 폼 연동"**으로 변경

### 2. 코드 복사
1. `google_apps_script.js` 파일의 모든 내용 복사
2. Apps Script 편집기에 붙여넣기
3. **첫 번째 줄의 SPREADSHEET_ID 수정**:
   ```javascript
   const SPREADSHEET_ID = '1단계에서_복사한_스프레드시트_ID';
   ```

### 3. 권한 설정
1. **저장** 버튼 클릭
2. **실행** 버튼 클릭 (setupSpreadsheet 함수)
3. 권한 승인 팝업에서 **허용** 클릭

---

## 🌐 3단계: 웹앱 배포

### 1. 배포 설정
1. Apps Script에서 **배포** → **새 배포** 클릭
2. **설정**:
   - **유형**: 웹앱
   - **설명**: I.B.S 문의 폼 연동
   - **실행 계정**: 나
   - **액세스 권한**: 누구나

### 2. 웹앱 URL 복사
1. **배포** 버튼 클릭
2. **웹앱 URL** 복사 (매우 중요!)
3. 예: `https://script.google.com/macros/s/ABC123.../exec`

---

## 💻 4단계: 웹사이트 코드 업데이트

### 1. script.js 파일 수정
1. `script.js` 파일 열기
2. **GOOGLE_SHEETS_URL 수정**:
   ```javascript
   const GOOGLE_SHEETS_URL = '3단계에서_복사한_웹앱_URL';
   ```

### 2. EmailJS 설정 (이미 했다면 건너뛰기)
1. `emailjs_setup_guide.md` 파일 참고
2. EmailJS 설정 완료 후 script.js의 EmailJS 설정값 수정

---

## 🧪 5단계: 테스트

### 1. 기능 테스트
1. 웹사이트 문의 폼에 테스트 데이터 입력
2. **문의 보내기** 버튼 클릭
3. 다음 확인:
   - ✅ 성공 메시지 표시
   - ✅ Google Sheets에 데이터 저장됨
   - ✅ ibs@ibs-info.com으로 이메일 수신

### 2. 문제 해결
- **Google Sheets에 저장 안됨**: 웹앱 URL과 스프레드시트 ID 재확인
- **이메일 전송 안됨**: EmailJS 설정 재확인
- **콘솔 오류**: 브라우저 개발자 도구에서 오류 메시지 확인

---

## 📊 6단계: 문의 관리

### Google Sheets에서 확인 가능한 정보:
- **접수일시**: 문의 접수 시간
- **이름**: 문의자 이름
- **이메일**: 문의자 이메일
- **회사명**: 문의자 회사
- **문의내용**: 전체 문의 내용
- **상태**: 신규/진행중/완료 등

### 엑셀로 다운로드:
1. Google Sheets에서 **파일** → **다운로드** → **Microsoft Excel(.xlsx)**

### 문의 상태 관리:
- **상태** 열에서 '신규' → '진행중' → '완료'로 직접 수정 가능

---

## 🎁 추가 기능

### 자동 알림 설정 (선택사항):
1. Google Sheets에서 **도구** → **알림 규칙**
2. 새 행 추가 시 이메일 알림 설정

### 문의 분석:
- Google Sheets의 차트 기능으로 월별 문의 통계 생성
- 회사별, 문의 유형별 분석 가능

---

## 🚨 보안 및 백업

### 보안:
- Google Apps Script 웹앱은 HTTPS로 암호화됨
- 스프레드시트는 본인만 접근 가능 (다른 계정과 공유 안 함)

### 백업:
- Google Drive에 자동 백업됨
- 추가 백업이 필요하면 정기적으로 엑셀 다운로드

---

## 📞 완료 후 이점

### 고객 입장:
- 📱 **간편한 문의**: 폼 작성 후 바로 전송
- ⚡ **빠른 처리**: 메일 앱 실행 불필요

### 관리자 입장:
- 📊 **체계적 관리**: 모든 문의가 시트에 자동 정리
- 📈 **통계 분석**: 월별, 회사별 문의 현황 파악
- 💼 **백업 완료**: 데이터 손실 위험 없음
- 📧 **이중 확보**: 이메일 + 시트 저장

---

## ❓ 문의사항

설정 중 문제 발생 시:
- **이준로 대표**: 010-3664-6268
- **이메일**: ibs@ibs-info.com

---

**🎯 이 설정을 완료하면 고객 문의가 자동으로 이메일 전송 + 엑셀 시트 저장됩니다!** 