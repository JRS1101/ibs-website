// 🔥 완전 해결된 Google Apps Script - 데이터 파싱 문제 해결
// Form submit 방식 완벽 지원

const SPREADSHEET_ID = '1Mnj5c6-IKiHqpY9YsakRAv6Y9KjiL-woaz_0KoXQaZY';
const SHEET_NAME = 'IBS_Inquiry';

function doPost(e) {
  Logger.log('🚀 doPost 함수 시작!');
  
  try {
    Logger.log('📥 받은 전체 이벤트 객체:', e);
    Logger.log('📥 postData:', e.postData);
    Logger.log('📥 parameter:', e.parameter);
    
    let data = {};
    
    // 1. Form 데이터로 먼저 시도 (form submit 방식)
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      Logger.log('📝 Form parameter 방식으로 데이터 처리');
      data = e.parameter;
      
      // hidden input으로 온 JSON 데이터 파싱 시도
      if (data.data) {
        try {
          const parsedData = JSON.parse(data.data);
          Logger.log('✅ Hidden input JSON 파싱 성공:', parsedData);
          data = parsedData;
        } catch (err) {
          Logger.log('⚠️ Hidden input JSON 파싱 실패, Form 데이터 사용');
        }
      }
    }
    // 2. POST body JSON으로 시도
    else if (e.postData && e.postData.contents) {
      Logger.log('📝 POST body JSON 방식으로 데이터 처리');
      try {
        data = JSON.parse(e.postData.contents);
        Logger.log('✅ POST body JSON 파싱 성공:', data);
      } catch (jsonError) {
        Logger.log('❌ POST body JSON 파싱 실패:', jsonError.toString());
        throw new Error('JSON 파싱 실패: ' + jsonError.toString());
      }
    }
    // 3. 그 외의 경우
    else {
      Logger.log('❌ 유효한 데이터가 없음');
      throw new Error('전송된 데이터가 없습니다');
    }

    Logger.log('🔍 최종 파싱된 데이터:', data);

    // 데이터 유효성 검사
    if (!data || Object.keys(data).length === 0) {
      throw new Error('빈 데이터 객체');
    }

    // 타임스탬프 생성
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    Logger.log('⏰ 타임스탬프:', timestamp);

    // 시트 접근
    Logger.log('📊 시트 접근 시도...');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ 스프레드시트 열기 성공');
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // 시트가 없으면 생성
    if (!sheet) {
      Logger.log('📋 시트가 없어서 새로 생성');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // 헤더 추가
      sheet.getRange(1, 1, 1, 7).setValues([
        ['접수일시', '이름', '이메일', '전화번호', '회사명', '문의내용', '상태']
      ]);
    }
    
    Logger.log('✅ 시트 접근 성공');

    // 데이터 추출 (더 안전하게)
    const name = (data.name || '').toString().trim();
    const email = (data.email || '').toString().trim();
    const phone = (data.phone || '').toString().trim();
    const company = (data.company || '').toString().trim();
    const message = (data.message || '').toString().trim();
    
    Logger.log('📝 추출된 개별 데이터:');
    Logger.log('  - 이름:', name);
    Logger.log('  - 이메일:', email);
    Logger.log('  - 전화번호:', phone);
    Logger.log('  - 회사명:', company);
    Logger.log('  - 문의내용:', message);

    // 필수 데이터 확인
    if (!name || !email || !message) {
      throw new Error('필수 데이터 누락: 이름, 이메일, 문의내용은 필수입니다');
    }

    // 새 행 데이터 준비
    const newRowData = [timestamp, name, email, phone, company, message, '신규'];
    Logger.log('📋 저장할 행 데이터:', newRowData);

    // 시트에 추가
    Logger.log('💾 시트에 데이터 저장 중...');
    sheet.appendRow(newRowData);
    
    const lastRow = sheet.getLastRow();
    Logger.log('✅ 시트 저장 완료! 새 행 번호:', lastRow);

    // 성공 응답
    Logger.log('🎉 모든 작업 완료 - 성공!');
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: '문의가 성공적으로 저장되었습니다',
        timestamp: timestamp,
        row: lastRow,
        data: { name, email, phone, company, message }
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ 오류 발생:', error.toString());
    Logger.log('❌ 오류 상세:', error.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (테스트용)
function doGet(e) {
  Logger.log('🌐 GET 요청 받음');
  return ContentService
    .createTextOutput('🚀 I.B.S 문의 시스템이 정상 작동 중입니다!')
    .setMimeType(ContentService.MimeType.TEXT);
}

// 강화된 테스트 함수
function enhancedTest() {
  Logger.log('🧪 강화된 테스트 시작');
  
  try {
    // 1. 시트 접근 테스트
    Logger.log('📊 스프레드시트 ID:', SPREADSHEET_ID);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ 스프레드시트 열기 성공');
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('📋 시트가 없어서 새로 생성');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 7).setValues([
        ['접수일시', '이름', '이메일', '전화번호', '회사명', '문의내용', '상태']
      ]);
    }
    
    Logger.log('✅ 시트 접근 성공');
    Logger.log('📊 현재 행 수:', sheet.getLastRow());
    
    // 2. Form 데이터 방식 테스트
    const formEvent = {
      parameter: {
        data: JSON.stringify({
          name: 'Form테스트',
          email: 'form@test.com', 
          phone: '010-1111-2222',
          company: 'Form테스트회사',
          message: 'Form 방식 테스트입니다'
        })
      }
    };
    
    Logger.log('🔄 Form 방식 테스트 실행...');
    const formResult = doPost(formEvent);
    Logger.log('📄 Form 테스트 결과:', formResult.getContent());
    
    // 3. JSON 방식 테스트  
    const jsonEvent = {
      postData: {
        contents: JSON.stringify({
          name: 'JSON테스트',
          email: 'json@test.com',
          phone: '010-3333-4444', 
          company: 'JSON테스트회사',
          message: 'JSON 방식 테스트입니다'
        })
      }
    };
    
    Logger.log('🔄 JSON 방식 테스트 실행...');
    const jsonResult = doPost(jsonEvent);
    Logger.log('📄 JSON 테스트 결과:', jsonResult.getContent());
    
    Logger.log('🎉 모든 테스트 완료');
    
  } catch (error) {
    Logger.log('❌ 테스트 실패:', error.toString());
    Logger.log('❌ 오류 상세:', error.stack);
  }
} 