// 🚀 I.B.S 견적서 자동화 시스템 - Google Sheets 설정
// 견적서 데이터베이스 + PDF 생성 + 자동 메일 전송

// === 설정 === 
const SPREADSHEET_ID = '여기에_새로운_견적서_시트_ID_입력'; // 새로 만들 견적서 전용 시트
const QUOTES_SHEET = '견적서_목록';
const TEMPLATES_SHEET = '템플릿_설정';

// === 1. 견적서 시트 초기 설정 ===
function setupQuotationSheets() {
  try {
    Logger.log('📊 견적서 시트 설정 시작...');
    
    // 새 스프레드시트 생성 (수동으로 만들고 ID 복사해서 위에 입력)
    // const spreadsheet = SpreadsheetApp.create('I.B.S 견적서 관리 시스템');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. 견적서 목록 시트 생성
    createQuotesSheet(spreadsheet);
    
    // 2. 템플릿 설정 시트 생성  
    createTemplatesSheet(spreadsheet);
    
    // 3. 조건부 서식 및 데이터 검증 추가
    setupFormatting(spreadsheet);
    
    Logger.log('✅ 견적서 시트 설정 완료!');
    Logger.log('📋 스프레드시트 URL:', spreadsheet.getUrl());
    
  } catch (error) {
    Logger.log('❌ 설정 실패:', error.toString());
  }
}

// 견적서 목록 시트 생성
function createQuotesSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(QUOTES_SHEET);
  
  if (sheet) {
    spreadsheet.deleteSheet(sheet);
  }
  
  sheet = spreadsheet.insertSheet(QUOTES_SHEET);
  
  // 헤더 설정
  const headers = [
    '견적번호', '상태', '작성일', '고객사명', '담당자', '연락처', 
    '이메일', '견적일', '유효기간', '항목1_명', '항목1_사양', 
    '항목1_수량', '항목1_단가', '항목1_금액', '항목2_명', '항목2_사양',
    '항목2_수량', '항목2_단가', '항목2_금액', '항목3_명', '항목3_사양',
    '항목3_수량', '항목3_단가', '항목3_금액', '소계', '부가세', 
    '총금액', '특이사항', 'PDF_URL', '전송일', '승인일', '관리메모'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 헤더 스타일링
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1e3c72');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment('center');
  
  // 열 너비 설정
  sheet.setColumnWidth(1, 120); // 견적번호
  sheet.setColumnWidth(2, 80);  // 상태
  sheet.setColumnWidth(3, 100); // 작성일
  sheet.setColumnWidth(4, 150); // 고객사명
  sheet.setColumnWidth(5, 100); // 담당자
  sheet.setColumnWidth(6, 120); // 연락처
  sheet.setColumnWidth(7, 200); // 이메일
  
  // 데이터 검증 (상태 드롭다운)
  const statusRange = sheet.getRange('B:B');
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['작성중', '검토중', '전송완료', '승인', '거절', '만료'])
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(statusRule);
  
  Logger.log('✅ 견적서 목록 시트 생성 완료');
}

// 템플릿 설정 시트 생성
function createTemplatesSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(TEMPLATES_SHEET);
  
  if (sheet) {
    spreadsheet.deleteSheet(sheet);
  }
  
  sheet = spreadsheet.insertSheet(TEMPLATES_SHEET);
  
  // 기본 설정값들
  const settings = [
    ['설정 항목', '값', '설명'],
    ['회사명', 'InnoBridge SOLUTION', '견적서에 표시될 회사명'],
    ['사업자번호', '405-08-53668', '사업자등록번호'],
    ['대표자명', '이준로', '대표자 이름'],
    ['연락처', '010-3664-6268', '회사 대표 연락처'],
    ['이메일', 'jr.lee@ibs-info.com', '회사 대표 이메일'],
    ['주소', '경기도 수원시 장안구 덕영대로 417번길 52-5 나동 502호', '회사 주소'],
    ['홈페이지', 'web.ibs-info.com', '회사 홈페이지'],
    ['견적번호_접두사', 'IBS-Q-', '견적번호 앞에 붙을 접두사'],
    ['견적_유효기간', '30', '견적서 유효기간 (일)'],
    ['부가세율', '10', '부가세율 (%)'],
    ['기본_결제조건', '계약금 50%, 완료 후 잔금 50%', '기본 결제 조건'],
    ['기본_납기', '계약 후 2~4주', '기본 납기'],
    ['AS기간', '3개월', 'A/S 기간'],
  ];
  
  sheet.getRange(1, 1, settings.length, 3).setValues(settings);
  
  // 스타일링
  const headerRange = sheet.getRange(1, 1, 1, 3);
  headerRange.setBackground('#2a5298');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 250);
  
  Logger.log('✅ 템플릿 설정 시트 생성 완료');
}

// 조건부 서식 설정
function setupFormatting(spreadsheet) {
  const quotesSheet = spreadsheet.getSheetByName(QUOTES_SHEET);
  
  // 상태별 색상
  const rules = [];
  
  // 작성중 - 노란색
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('작성중')
    .setBackground('#fff3cd')
    .setRanges([quotesSheet.getRange('B:B')])
    .build());
    
  // 전송완료 - 파란색
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('전송완료')
    .setBackground('#cce5ff')
    .setRanges([quotesSheet.getRange('B:B')])
    .build());
    
  // 승인 - 초록색
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('승인')
    .setBackground('#d4edda')
    .setRanges([quotesSheet.getRange('B:B')])
    .build());
    
  // 거절 - 빨간색
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('거절')
    .setBackground('#f8d7da')
    .setRanges([quotesSheet.getRange('B:B')])
    .build());
  
  quotesSheet.setConditionalFormatRules(rules);
  
  Logger.log('✅ 조건부 서식 설정 완료');
}

// === 2. 견적번호 자동 생성 ===
function generateQuoteNumber() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(QUOTES_SHEET);
    const templatesSheet = spreadsheet.getSheetByName(TEMPLATES_SHEET);
    
    // 접두사 가져오기
    const prefix = templatesSheet.getRange('B9').getValue(); // IBS-Q-
    
    // 오늘 날짜
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // 기존 견적번호들 확인해서 일련번호 생성
    const lastRow = quotesSheet.getLastRow();
    let maxNumber = 0;
    
    if (lastRow > 1) {
      const quoteNumbers = quotesSheet.getRange(2, 1, lastRow - 1, 1).getValues();
      const todayPrefix = `${prefix}${year}${month}`;
      
      quoteNumbers.forEach(row => {
        const quoteNumber = row[0].toString();
        if (quoteNumber.startsWith(todayPrefix)) {
          const number = parseInt(quoteNumber.split('-').pop());
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });
    }
    
    const newNumber = String(maxNumber + 1).padStart(3, '0');
    const newQuoteNumber = `${prefix}${year}${month}-${newNumber}`;
    
    Logger.log('✅ 새 견적번호 생성:', newQuoteNumber);
    return newQuoteNumber;
    
  } catch (error) {
    Logger.log('❌ 견적번호 생성 실패:', error.toString());
    return 'IBS-Q-' + new Date().getTime(); // 오류 시 타임스탬프 사용
  }
}

// === 3. 새 견적서 추가 ===
function addNewQuote(quoteData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(QUOTES_SHEET);
    
    // 견적번호 자동 생성
    const quoteNumber = generateQuoteNumber();
    
    // 기본값 설정
    const today = new Date();
    const quoteDate = quoteData.quoteDate || today;
    const validUntil = new Date(quoteDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30일 후
    
    // 새 행 데이터
    const newRow = [
      quoteNumber, // A: 견적번호
      '작성중',     // B: 상태
      today,       // C: 작성일
      quoteData.customerName || '', // D: 고객사명
      quoteData.customerContact || '', // E: 담당자
      quoteData.customerPhone || '', // F: 연락처
      quoteData.customerEmail || '', // G: 이메일
      quoteDate,   // H: 견적일
      validUntil,  // I: 유효기간
      quoteData.item1_name || '', // J: 항목1_명
      quoteData.item1_spec || '', // K: 항목1_사양
      quoteData.item1_qty || 0,   // L: 항목1_수량
      quoteData.item1_price || 0, // M: 항목1_단가
      quoteData.item1_total || 0, // N: 항목1_금액
      quoteData.item2_name || '', // O: 항목2_명
      quoteData.item2_spec || '', // P: 항목2_사양
      quoteData.item2_qty || 0,   // Q: 항목2_수량
      quoteData.item2_price || 0, // R: 항목2_단가
      quoteData.item2_total || 0, // S: 항목2_금액
      quoteData.item3_name || '', // T: 항목3_명
      quoteData.item3_spec || '', // U: 항목3_사양
      quoteData.item3_qty || 0,   // V: 항목3_수량
      quoteData.item3_price || 0, // W: 항목3_단가
      quoteData.item3_total || 0, // X: 항목3_금액
      quoteData.subtotal || 0,    // Y: 소계
      quoteData.tax || 0,         // Z: 부가세
      quoteData.grandTotal || 0,  // AA: 총금액
      quoteData.notes || '',      // AB: 특이사항
      '',          // AC: PDF_URL (나중에 생성)
      '',          // AD: 전송일
      '',          // AE: 승인일
      ''           // AF: 관리메모
    ];
    
    quotesSheet.appendRow(newRow);
    
    Logger.log('✅ 새 견적서 추가 완료:', quoteNumber);
    return quoteNumber;
    
  } catch (error) {
    Logger.log('❌ 견적서 추가 실패:', error.toString());
    throw error;
  }
}

// === 테스트 함수 ===
function testQuotationSystem() {
  Logger.log('🧪 견적서 시스템 테스트 시작');
  
  try {
    // 1. 시트 설정 테스트
    setupQuotationSheets();
    
    // 2. 견적번호 생성 테스트
    const quoteNumber = generateQuoteNumber();
    Logger.log('📋 생성된 견적번호:', quoteNumber);
    
    // 3. 샘플 견적서 추가 테스트
    const sampleQuote = {
      customerName: '테스트 전자',
      customerContact: '김철수',
      customerPhone: '010-1234-5678',
      customerEmail: 'test@company.com',
      item1_name: 'Wire Probe JIG 설계',
      item1_spec: 'PCB 검사용 치공구\n맞춤형 설계',
      item1_qty: 1,
      item1_price: 1500000,
      item1_total: 1500000,
                  item2_name: 'IA-Station 교육',
      item2_spec: '기초부터 심화과정\n1:1 맞춤 교육',
      item2_qty: 1,
      item2_price: 800000,
      item2_total: 800000,
      subtotal: 2300000,
      tax: 230000,
      grandTotal: 2530000,
      notes: '견적 유효기간: 30일\n납기: 계약 후 2~4주'
    };
    
    const addedQuoteNumber = addNewQuote(sampleQuote);
    Logger.log('✅ 샘플 견적서 추가:', addedQuoteNumber);
    
    Logger.log('🎉 견적서 시스템 테스트 완료!');
    
  } catch (error) {
    Logger.log('❌ 테스트 실패:', error.toString());
  }
} 