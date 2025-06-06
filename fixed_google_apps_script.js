// Google Apps Script - I.B.S 문의 폼 (CORS 문제 해결 버전)
const SPREADSHEET_ID = '1pnvmPgSbv0yzXErNDCQbItnGBOF_jqxk3qtq-Y3kco0';
const SHEET_NAME = 'I.B.S 문의내역';

function doPost(e) {
  try {
    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'addInquiry') {
      return addInquiry(data.data);
    }
    
    return createJsonResponse({success: false, error: 'Invalid action'});
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createJsonResponse({success: false, error: error.toString()});
  }
}

function addInquiry(inquiryData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      setupPrettyTable(sheet);
    }
    
    const newRow = [
      inquiryData.timestamp,
      inquiryData.name,
      inquiryData.email,
      inquiryData.company,
      inquiryData.message,
      '🆕 신규'
    ];
    
    sheet.appendRow(newRow);
    
    const lastRow = sheet.getLastRow();
    stylizeNewRow(sheet, lastRow);
    
    Logger.log('✅ 문의 저장 완료: ' + inquiryData.name);
    
    return createJsonResponse({
      success: true, 
      message: '문의가 성공적으로 저장되었습니다.',
      row: lastRow
    });
      
  } catch (error) {
    Logger.log('❌ 문의 저장 실패: ' + error.toString());
    return createJsonResponse({
      success: false, 
      error: error.toString()
    });
  }
}

// JSON 응답 생성 함수 (CORS 허용)
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  // CORS 허용 헤더는 Google Apps Script에서 자동 처리됨
  return output;
}

function setupPrettyTable(sheet) {
  const headers = ['📅 접수일시', '👤 이름', '📧 이메일', '🏢 회사명', '💬 문의내용', '📊 상태'];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1a73e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(12);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  
  headerRange.setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 350);
  sheet.setColumnWidth(6, 100);
  
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);
  
  addConditionalFormatting(sheet);
}

function stylizeNewRow(sheet, rowNumber) {
  const range = sheet.getRange(rowNumber, 1, 1, 6);
  
  if (rowNumber % 2 === 0) {
    range.setBackground('#f8f9fa');
  } else {
    range.setBackground('#ffffff');
  }
  
  range.setBorder(true, true, true, true, true, true, '#e0e0e0', SpreadsheetApp.BorderStyle.SOLID);
  range.setFontSize(10);
  range.setVerticalAlignment('middle');
  
  sheet.getRange(rowNumber, 1).setHorizontalAlignment('center');
  sheet.getRange(rowNumber, 2).setHorizontalAlignment('center');
  sheet.getRange(rowNumber, 3).setHorizontalAlignment('left');
  sheet.getRange(rowNumber, 4).setHorizontalAlignment('center');
  sheet.getRange(rowNumber, 5).setHorizontalAlignment('left');
  sheet.getRange(rowNumber, 6).setHorizontalAlignment('center');
  
  sheet.setRowHeight(rowNumber, 60);
  sheet.getRange(rowNumber, 5).setWrap(true);
}

function addConditionalFormatting(sheet) {
  const newRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('신규')
    .setBackground('#e3f2fd')
    .setRanges([sheet.getRange('F:F')])
    .build();
    
  const progressRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('진행중')
    .setBackground('#fff3e0')
    .setRanges([sheet.getRange('F:F')])
    .build();
    
  const doneRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('완료')
    .setBackground('#e8f5e8')
    .setRanges([sheet.getRange('F:F')])
    .build();
  
  const rules = [newRule, progressRule, doneRule];
  sheet.setConditionalFormatRules(rules);
}

function doGet() {
  return ContentService
    .createTextOutput('🚀 I.B.S 문의 폼 웹앱이 정상 작동 중입니다!')
    .setMimeType(ContentService.MimeType.TEXT);
}

// 테스트 함수
function testWebsiteData() {
  console.log('웹사이트 연동 테스트 시작');
  
  const testData = {
    timestamp: new Date().toLocaleString('ko-KR'),
    name: '웹사이트 테스트',
    email: 'website@test.com',
    company: '웹사이트 테스트 회사',
    message: '웹사이트에서 온 테스트 문의입니다'
  };
  
  const result = addInquiry(testData);
  console.log('테스트 결과:', result);
} 