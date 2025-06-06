// Google Apps Script - I.B.S 문의 폼 데이터 저장용
// 이 스크립트를 Google Apps Script에 복사하여 웹앱으로 배포하세요

// 스프레드시트 설정
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Google Sheets ID
const SHEET_NAME = 'I.B.S 문의내역'; // 시트 이름

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'addInquiry') {
      return addInquiry(data.data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
      
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
    
    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // 헤더 추가
      const headers = ['접수일시', '이름', '이메일', '회사명', '문의내용', '상태'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
    }
    
    // 새 행 추가
    const newRow = [
      inquiryData.timestamp,
      inquiryData.name,
      inquiryData.email,
      inquiryData.company,
      inquiryData.message,
      '신규' // 기본 상태
    ];
    
    sheet.appendRow(newRow);
    
    // 방금 추가된 행 스타일링
    const lastRow = sheet.getLastRow();
    const range = sheet.getRange(lastRow, 1, 1, 6);
    
    // 교대로 배경색 설정
    if (lastRow % 2 === 0) {
      range.setBackground('#f8f9fa');
    }
    
    // 열 너비 자동 조정
    sheet.autoResizeColumns(1, 6);
    
    Logger.log('문의 저장 완료: ' + inquiryData.name);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true, 
        message: '문의가 성공적으로 저장되었습니다.',
        row: lastRow
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('문의 저장 실패: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (테스트용)
function doGet() {
  return ContentService
    .createTextOutput('I.B.S 문의 폼 웹앱이 정상 작동 중입니다.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// 문의 상태 업데이트 함수 (선택사항)
function updateInquiryStatus(row, status) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    sheet.getRange(row, 6).setValue(status); // 6번째 열이 상태 열
    
    return {success: true, message: '상태가 업데이트되었습니다.'};
  } catch (error) {
    return {success: false, error: error.toString()};
  }
}

// 스프레드시트 생성 및 초기 설정 함수 (최초 1회 실행)
function setupSpreadsheet() {
  try {
    // 새 스프레드시트 생성
    const spreadsheet = SpreadsheetApp.create('I.B.S 문의 관리 시트');
    const sheet = spreadsheet.getActiveSheet();
    sheet.setName(SHEET_NAME);
    
    // 헤더 설정
    const headers = ['접수일시', '이름', '이메일', '회사명', '문의내용', '상태'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // 헤더 스타일링
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // 열 너비 설정
    sheet.setColumnWidth(1, 150); // 접수일시
    sheet.setColumnWidth(2, 100); // 이름
    sheet.setColumnWidth(3, 200); // 이메일
    sheet.setColumnWidth(4, 150); // 회사명
    sheet.setColumnWidth(5, 300); // 문의내용
    sheet.setColumnWidth(6, 80);  // 상태
    
    Logger.log('스프레드시트 생성 완료');
    Logger.log('스프레드시트 ID: ' + spreadsheet.getId());
    Logger.log('스프레드시트 URL: ' + spreadsheet.getUrl());
    
    return {
      success: true,
      spreadsheetId: spreadsheet.getId(),
      url: spreadsheet.getUrl()
    };
    
  } catch (error) {
    Logger.log('스프레드시트 생성 실패: ' + error.toString());
    return {success: false, error: error.toString()};
  }
} 