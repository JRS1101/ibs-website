// ⭐ 완전 해결된 Google Apps Script - I.B.S 문의 폼
// 권한 문제 완전 해결 버전

const SPREADSHEET_ID = '1Mnj5c6-IKiHqpY9YsakRAv6Y9KjiL-woaz_0KoXQaZY';
const SHEET_NAME = 'IBS_Inquiry';

function doPost(e) {
  Logger.log('🚀 doPost 함수 시작!');
  
  try {
    Logger.log('📥 받은 원본 데이터:', e.postData.contents);
    
    let data;
    
    // 데이터 파싱 (여러 형태 지원)
    if (e.postData.contents) {
      try {
        // JSON 형태로 시도
        data = JSON.parse(e.postData.contents);
        Logger.log('✅ JSON 파싱 성공:', data);
      } catch (jsonError) {
        Logger.log('⚠️ JSON 파싱 실패, Form 데이터로 시도');
        // Form 데이터로 시도
        data = e.parameter;
        Logger.log('📝 Form 데이터:', data);
      }
    } else {
      data = e.parameter;
      Logger.log('📝 Parameter 데이터:', data);
    }

    // 데이터가 없으면 에러
    if (!data || Object.keys(data).length === 0) {
      throw new Error('전송된 데이터가 없습니다');
    }

    // 타임스탬프 생성
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    Logger.log('⏰ 타임스탬프:', timestamp);

    // 시트 접근 (더 안전한 방법)
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

    // 데이터 추출 (안전하게)
    const name = data.name || '';
    const email = data.email || '';
    const phone = data.phone || '';
    const company = data.company || '';
    const message = data.message || '';
    
    Logger.log('📝 추출된 데이터:', { name, email, phone, company, message });

    // 새 행 데이터
    const newRowData = [timestamp, name, email, phone, company, message, '신규'];
    Logger.log('📋 저장할 행 데이터:', newRowData);

    // 시트에 추가
    Logger.log('💾 시트에 데이터 저장 중...');
    sheet.appendRow(newRowData);
    Logger.log('✅ 시트 저장 완료!');

    // 성공 응답
    Logger.log('🎉 모든 작업 완료 - 성공!');
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: '문의가 성공적으로 저장되었습니다',
        timestamp: timestamp 
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

// 테스트 함수 (더 상세한 버전)
function detailedTest() {
  Logger.log('🧪 상세 테스트 시작');
  
  try {
    // 1. 스프레드시트 접근 테스트
    Logger.log('📊 스프레드시트 ID:', SPREADSHEET_ID);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ 스프레드시트 열기 성공');
    
    // 2. 시트 접근 테스트
    Logger.log('📋 시트 이름:', SHEET_NAME);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('📋 시트가 없어서 새로 생성');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // 헤더 추가
      sheet.getRange(1, 1, 1, 7).setValues([
        ['접수일시', '이름', '이메일', '전화번호', '회사명', '문의내용', '상태']
      ]);
    }
    
    Logger.log('✅ 시트 접근 성공');
    Logger.log('📊 현재 행 수:', sheet.getLastRow());
    
    // 3. 테스트 데이터 추가
    const testData = [
      new Date().toLocaleString('ko-KR'),
      '테스트 이름',
      'test@example.com',
      '010-1234-5678',
      '테스트 회사',
      '테스트 메시지입니다',
      '테스트'
    ];
    
    sheet.appendRow(testData);
    Logger.log('✅ 테스트 데이터 추가 성공');
    Logger.log('📊 새 행 수:', sheet.getLastRow());
    
  } catch (error) {
    Logger.log('❌ 테스트 실패:', error.toString());
    Logger.log('❌ 오류 상세:', error.stack);
  }
}

// 수동 실행 함수
function manualRun() {
  Logger.log('🔧 수동 실행 테스트');
  
  // 가짜 이벤트 객체 생성
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        name: '수동테스트',
        email: 'manual@test.com',
        phone: '010-0000-0000',
        company: '테스트회사',
        message: '수동 실행 테스트입니다'
      })
    }
  };
  
  const result = doPost(fakeEvent);
  Logger.log('🎯 수동 실행 결과:', result.getContent());
} 