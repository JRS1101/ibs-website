// Google Apps Script - I.B.S 문의 폼 데이터 저장용 (전화번호 필드 추가 버전)
// 더 예쁜 테이블 형태로 저장됩니다!

// 스프레드시트 설정
const SPREADSHEET_ID = '1fhKd8YPktuykVcJiE7mTah98IxJtj5w4usMoa29PwF4'; // Google Sheets ID
const SHEET_NAME = 'I.B.S 문의내역'; // 시트 이름

function doPost(e) {
  try {
    // 폼 데이터 파싱 (form submit 방식 지원)
    let inquiryData;
    
    if (e.postData && e.postData.contents) {
      // JSON 방식
      const data = JSON.parse(e.postData.contents);
      if (data.action === 'addInquiry') {
        inquiryData = data.data;
      } else {
        inquiryData = data;
      }
    } else if (e.parameter && e.parameter.data) {
      // Form submit 방식 (CORS 우회용)
      inquiryData = JSON.parse(e.parameter.data);
    } else {
      throw new Error('No valid data found');
    }
    
    // 타임스탬프 추가
    inquiryData.timestamp = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    return addInquiry(inquiryData);
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addInquiry(inquiryData) {
  try {
    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // 시트가 없으면 생성하고 예쁘게 설정
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      setupPrettyTable(sheet);
    }
    
    // 새 행 추가 (전화번호 포함)
    const newRow = [
      inquiryData.timestamp,
      inquiryData.name,
      inquiryData.email,
      inquiryData.phone,
      inquiryData.company,
      inquiryData.message,
      '🆕 신규' // 이모지 추가
    ];
    
    sheet.appendRow(newRow);
    
    // 방금 추가된 행을 예쁘게 스타일링
    const lastRow = sheet.getLastRow();
    stylizeNewRow(sheet, lastRow);
    
    Logger.log('✅ 문의 저장 완료: ' + inquiryData.name);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true, 
        message: '문의가 성공적으로 저장되었습니다.',
        row: lastRow
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('❌ 문의 저장 실패: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 예쁜 테이블 초기 설정 (전화번호 포함)
function setupPrettyTable(sheet) {
  // 헤더 데이터 (전화번호 추가)
  const headers = ['📅 접수일시', '👤 이름', '📧 이메일', '📞 전화번호', '🏢 회사명', '💬 문의내용', '📊 상태'];
  
  // 헤더 추가
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 헤더 스타일링 (더 예쁘게!)
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1a73e8'); // 구글 블루
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(12);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  
  // 헤더에 테두리 추가
  headerRange.setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  // 열 너비 최적화 (전화번호 포함)
  sheet.setColumnWidth(1, 160); // 접수일시
  sheet.setColumnWidth(2, 80);  // 이름
  sheet.setColumnWidth(3, 200); // 이메일
  sheet.setColumnWidth(4, 130); // 전화번호
  sheet.setColumnWidth(5, 130); // 회사명
  sheet.setColumnWidth(6, 300); // 문의내용 - 가장 넓게
  sheet.setColumnWidth(7, 80);  // 상태
  
  // 행 높이 설정
  sheet.setRowHeight(1, 40); // 헤더 행 높이
  
  // 시트 전체 스타일 설정
  sheet.setFrozenRows(1); // 헤더 행 고정
  
  // 조건부 서식 추가 (상태별 색상)
  addConditionalFormatting(sheet);
}

// 새 행 스타일링 (7개 컬럼 대응)
function stylizeNewRow(sheet, rowNumber) {
  const range = sheet.getRange(rowNumber, 1, 1, 7);
  
  // 교대로 배경색 설정 (더 예쁜 색상)
  if (rowNumber % 2 === 0) {
    range.setBackground('#f8f9fa'); // 연한 회색
  } else {
    range.setBackground('#ffffff'); // 흰색
  }
  
  // 테두리 추가
  range.setBorder(true, true, true, true, true, true, '#e0e0e0', SpreadsheetApp.BorderStyle.SOLID);
  
  // 폰트 설정
  range.setFontSize(10);
  range.setVerticalAlignment('middle');
  
  // 각 열별 정렬 설정
  sheet.getRange(rowNumber, 1).setHorizontalAlignment('center'); // 접수일시 - 중앙
  sheet.getRange(rowNumber, 2).setHorizontalAlignment('center'); // 이름 - 중앙
  sheet.getRange(rowNumber, 3).setHorizontalAlignment('left');   // 이메일 - 왼쪽
  sheet.getRange(rowNumber, 4).setHorizontalAlignment('center'); // 전화번호 - 중앙
  sheet.getRange(rowNumber, 5).setHorizontalAlignment('center'); // 회사명 - 중앙
  sheet.getRange(rowNumber, 6).setHorizontalAlignment('left');   // 문의내용 - 왼쪽
  sheet.getRange(rowNumber, 7).setHorizontalAlignment('center'); // 상태 - 중앙
  
  // 행 높이 설정 (내용에 따라 자동 조정)
  sheet.setRowHeight(rowNumber, 60);
  
  // 문의내용 셀 텍스트 자동 줄바꿈
  sheet.getRange(rowNumber, 6).setWrap(true);
}

// 조건부 서식 (상태별 색상) - G열로 수정
function addConditionalFormatting(sheet) {
  // 신규 상태 - 연한 파란색
  const newRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('신규')
    .setBackground('#e3f2fd')
    .setRanges([sheet.getRange('G:G')])
    .build();
    
  // 진행중 상태 - 연한 주황색
  const progressRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('진행중')
    .setBackground('#fff3e0')
    .setRanges([sheet.getRange('G:G')])
    .build();
    
  // 완료 상태 - 연한 초록색
  const doneRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('완료')
    .setBackground('#e8f5e8')
    .setRanges([sheet.getRange('G:G')])
    .build();
  
  // 규칙 적용
  const rules = [newRule, progressRule, doneRule];
  sheet.setConditionalFormatRules(rules);
}

// GET 요청 처리 (테스트용)
function doGet() {
  return ContentService
    .createTextOutput('🚀 I.B.S 문의 폼 웹앱이 정상 작동 중입니다!')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ⭐ 중요: 시트 재설정 함수 (전화번호 컬럼 추가용)
// Google Apps Script 에디터에서 이 함수를 직접 실행하세요!
function resetPrettyTable() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (sheet) {
      // 기존 시트 삭제
      spreadsheet.deleteSheet(sheet);
    }
    
    // 새 시트 생성 및 예쁜 테이블 설정 (전화번호 포함)
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    setupPrettyTable(sheet);
    
    Logger.log('✅ 전화번호 포함 테이블이 새로 생성되었습니다!');
    
  } catch (error) {
    Logger.log('❌ 테이블 재설정 실패: ' + error.toString());
  }
}

// 기존 시트에 전화번호 컬럼만 추가하는 함수 (데이터 유지)
function addPhoneColumnToExistingSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('시트를 찾을 수 없습니다.');
      return;
    }
    
    // D열(회사명) 앞에 새 열 삽입
    sheet.insertColumnBefore(4);
    
    // 새 헤더 추가
    sheet.getRange(1, 4).setValue('📞 전화번호');
    
    // 헤더 스타일링
    const headerCell = sheet.getRange(1, 4);
    headerCell.setBackground('#1a73e8');
    headerCell.setFontColor('#ffffff');
    headerCell.setFontWeight('bold');
    headerCell.setFontSize(12);
    headerCell.setHorizontalAlignment('center');
    headerCell.setVerticalAlignment('middle');
    headerCell.setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    
    // 열 너비 설정
    sheet.setColumnWidth(4, 130);
    
    Logger.log('✅ 전화번호 컬럼이 추가되었습니다!');
    
  } catch (error) {
    Logger.log('❌ 컬럼 추가 실패: ' + error.toString());
  }
}

// 문의 상태 업데이트 함수 (7열로 수정)
function updateInquiryStatus(row, status) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    sheet.getRange(row, 7).setValue(status); // 7번째 열이 상태 열
    
    return {success: true, message: '상태가 업데이트되었습니다.'};
  } catch (error) {
    return {success: false, error: error.toString()};
  }
} 