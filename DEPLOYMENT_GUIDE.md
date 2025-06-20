# 🚀 IBS 견적서 시스템 - 고급 대시보드 배포 가이드

## 📋 배포 개요
새로운 고급 대시보드와 차트 기능을 사용하려면 Google Apps Script를 업데이트하고 재배포해야 합니다.

## 🔧 STEP 1: Google Apps Script 업데이트

### 1-1. Google Apps Script 접속
1. [https://script.google.com](https://script.google.com) 접속
2. 기존 IBS 견적서 프로젝트 열기

### 1-2. 코드 업데이트
1. 기존 코드를 모두 삭제
2. `quotation_google_apps_script_4ITEMS_FIXED.js` 파일의 전체 내용을 복사
3. Google Apps Script 에디터에 붙여넣기
4. **저장** (Ctrl+S)

### 1-3. 새 배포 생성
1. **배포** 버튼 클릭
2. **새 배포** 선택
3. **유형 선택**: 웹 앱
4. **설명**: "IBS 견적서 고급 대시보드 v2.0"
5. **액세스 권한**: "모든 사용자"
6. **배포** 클릭

### 1-4. 새 URL 확인
- 배포 완료 후 새로운 웹앱 URL을 복사해두세요
- 형식: `https://script.google.com/macros/s/[새로운ID]/exec`

## 🔧 STEP 2: HTML 파일 URL 업데이트 (필요시)

현재 HTML 파일에서 사용 중인 URL:
```
https://script.google.com/macros/s/AKfycby2lbf4M2wz6dKZUYb3xnbFR4kqQUfZHKTrtfnaTMF9eC1DWI63OrJukw8fjne0RsCu/exec
```

**만약 새로운 URL이 다르다면:**
1. `ibs_quotation_improved.html` 파일 열기
2. 3곳의 WEBAPP_URL을 새 URL로 교체
3. 파일 저장

## ✅ STEP 3: 테스트

### 3-1. 기본 기능 테스트
1. HTML 파일을 브라우저에서 열기
2. 견적서 작성 후 **📊 구글시트 저장** 클릭
3. 정상 저장 확인

### 3-2. 새 기능 테스트
1. **📊 고급 대시보드** 버튼 클릭
2. 성공 메시지 확인
3. **📈 차트 생성** 버튼 클릭
4. 성공 메시지 확인
5. 구글시트에서 새로운 대시보드와 차트 확인

## 🎯 새로운 기능 확인사항

### 고급 대시보드 확인:
- [ ] 📈 핵심 지표 (KPI) 섹션
- [ ] 📊 상태별 현황 섹션  
- [ ] 💰 금액 분석 섹션
- [ ] 📅 최근 활동 섹션
- [ ] 컬러풀한 디자인 적용

### 차트 확인:
- [ ] 📊 상태별 파이 차트
- [ ] 📈 월별 트렌드 라인 차트
- [ ] 💰 금액 분포 막대 차트

## 🚨 문제 해결

### 오류 발생 시:
1. **권한 오류**: Google Apps Script에서 권한 재승인
2. **URL 오류**: 새 배포 URL 확인 및 HTML 업데이트
3. **기능 오류**: 브라우저 캐시 삭제 후 재시도

### 지원:
- 문제 발생 시 개발자에게 연락
- 오류 메시지 스크린샷 첨부 권장

---
**배포 완료 후 강력한 비즈니스 인텔리전스 대시보드를 활용하세요! 🎉** 