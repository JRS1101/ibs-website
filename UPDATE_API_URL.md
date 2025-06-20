# 🔧 API URL 업데이트 가이드

## 새 웹앱 URL을 받은 후 다음 파일들을 업데이트하세요:

### 1. interactive_delivery_statement.html
라인 ~1350 근처의 IBS_CONFIG에서:
```javascript
const IBS_CONFIG = {
    API_URL: '새로운_웹앱_URL_여기에_붙여넣기',
    TIMEOUT: 5000,
    REFRESH_INTERVAL: 5 * 60 * 1000
};
```

### 2. professional_invoice_a4_optimized.html  
라인 ~750 근처의 IBS_CONFIG에서:
```javascript
const IBS_CONFIG = {
    API_URL: '새로운_웹앱_URL_여기에_붙여넣기',
    TIMEOUT: 5000,
    REFRESH_INTERVAL: 5 * 60 * 1000
};
```

### 3. ibs_quotation_improved.html
라인 ~1715 근처의 WEBAPP_URL에서:
```javascript
const WEBAPP_URL = '새로운_웹앱_URL_여기에_붙여넣기';
```

## 테스트 방법:
1. 브라우저 새로고침 (F5)
2. 견적서 목록 조회 테스트
3. 실제 구글시트 데이터가 나타나는지 확인

## 성공 시 나타날 메시지:
- "✅ 11개의 견적서를 불러왔습니다"
- "✅ Google Sheets 연결 성공" 