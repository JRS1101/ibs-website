// 🎯 IBS 견적서 구글시트 연동 스크립트 (4개 항목 고정 버전)
// ✅ 상태 드롭다운, 정확한 열 참조, 완벽한 통계 시스템
// ✅ 항상 정확히 4개 항목으로 고정 (HTML과 완벽 연동)

const SPREADSHEET_ID = '1MUHiU8a0p1aBs0wU94gmmlugwmB9qSYO8NLl-qZ9-ho'; 
const MAIN_SHEET_NAME = 'IBS_견적서_목록';
const STATS_SHEET_NAME = 'IBS_통계_대시보드';
const MONTHLY_SHEET_NAME = 'IBS_월별_요약';

function doPost(e) {
  // OPTIONS 요청은 Google Apps Script에서 자동 처리됨

  try {
    Logger.log('📋 견적서 저장 요청 시작');
    
    Logger.log('📥 받은 원본 데이터:', e.postData.contents);
    
    let data;
    
    // 데이터 파싱
    if (e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        Logger.log('✅ JSON 파싱 성공:', data);
      } catch (jsonError) {
        Logger.log('⚠️ JSON 파싱 실패, Form 데이터로 시도');
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    // 데이터 검증
    if (!data || Object.keys(data).length === 0) {
      throw new Error('전송된 견적서 데이터가 없습니다');
    }

    // 타임스탬프 생성
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const dateObj = new Date();
    const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

    // 스프레드시트 접근
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 시트 설정
    let mainSheet = spreadsheet.getSheetByName(MAIN_SHEET_NAME);
    if (!mainSheet) {
      mainSheet = createMainSheet(spreadsheet);
    }
    
    let statsSheet = spreadsheet.getSheetByName(STATS_SHEET_NAME);
    if (!statsSheet) {
      statsSheet = createStatsSheet(spreadsheet);
    }
    
    let monthlySheet = spreadsheet.getSheetByName(MONTHLY_SHEET_NAME);
    if (!monthlySheet) {
      monthlySheet = createMonthlySheet(spreadsheet);
    }

    // 데이터 추출 및 정리
    const quoteNumber = data.quoteNumber || '';
    const quoteDate = data.quoteDate || '';
    const projectName = data.projectName || '';
    const deliveryDays = data.deliveryDays || '';
    const paymentTerms = data.paymentTerms || '';
    const clientCompany = data.clientCompany || '';
    const clientContact = data.clientContact || '';
    const clientPhone = data.clientPhone || '';
    const clientEmail = data.clientEmail || '';
    const clientAddress = data.clientAddress || '';
    const quoteStatus = data.quoteStatus || '견적 발행';
    
    // 금액 데이터 (쉼표 제거 후 숫자 변환)
    const discountAmount = parseInt((data.discountAmount || '0').toString().replace(/,/g, '')) || 0;
    const additionalAmount = parseInt((data.additionalAmount || '0').toString().replace(/,/g, '')) || 0;
    const subtotal = parseInt((data.subtotal || '0').toString().replace(/,/g, '')) || 0;
    const vat = parseInt((data.vat || '0').toString().replace(/,/g, '')) || 0;
    const finalTotal = parseInt((data.finalTotal || '0').toString().replace(/,/g, '')) || 0;
    
    // 견적 항목들 파싱 (항상 정확히 4개 고정)
    let items = [];
    let itemsSummary = '';
    
    if (data.items && Array.isArray(data.items)) {
      // 정확히 4개만 처리 (HTML에서 항상 4개 전송됨)
      items = data.items.slice(0, 4);
      // 빈 항목이 아닌 것만 요약에 포함
      itemsSummary = items
        .filter(item => item && item.service && item.service.trim() !== '')
        .map(item => item.service)
        .join(', ');
    }
    
    // 항목 데이터 배열 생성 (정확히 4개×5컬럼 = 20컬럼)
    let itemsData = [];
    for (let i = 0; i < 4; i++) {
      const item = items[i] || {};
      itemsData.push(
        item.service || '',                                                    // 서비스명
        item.spec || '',                                                       // 규격/사양
        parseInt(item.quantity || '1') || 1,                                   // 수량 (기본값 1)
        parseInt((item.price || '0').toString().replace(/,/g, '')) || 0,       // 단가
        parseInt((item.amount || '0').toString().replace(/,/g, '')) || 0       // 금액
      );
    }
    
    Logger.log('📋 처리된 항목 개수:', items.length);
    Logger.log('📋 항목 데이터 길이:', itemsData.length, '(예상: 20개)');

    // 메인 시트에 데이터 추가 (총 39개 컬럼 - 4개 항목 고정)
    const newRowData = [
      timestamp,           // A: 접수일시
      quoteNumber,         // B: 견적번호
      quoteDate,           // C: 견적일자
      monthYear,           // D: 년월
      projectName,         // E: 프로젝트명
      clientCompany,       // F: 고객업체
      clientContact,       // G: 담당자
      clientPhone,         // H: 연락처
      clientEmail,         // I: 이메일
      clientAddress,       // J: 주소
      itemsSummary,        // K: 서비스요약
      deliveryDays,        // L: 납품기한
      paymentTerms,        // M: 결제조건
      ...itemsData,        // N-AG: 정확히 4개 항목 (4×5컬럼 = 20컬럼)
      discountAmount,      // AH: 할인금액
      additionalAmount,    // AI: 추가서비스금액
      subtotal,            // AJ: 견적금액
      vat,                 // AK: 부가세
      finalTotal,          // AL: 총계약금액 (38번째)
      quoteStatus          // AM: 상태 (39번째)
    ];
    
    // 데이터 검증: 정확히 39개 컬럼인지 확인
    if (newRowData.length !== 39) {
      Logger.log('⚠️ 경고: 예상 컬럼 수(39)와 실제 데이터 길이가 다릅니다:', newRowData.length);
    }
    
    Logger.log('📋 저장할 행 데이터 길이:', newRowData.length);
    Logger.log('📋 총계약금액:', finalTotal, '상태:', quoteStatus);

    // 메인 시트에 추가
    const lastRow = mainSheet.getLastRow();
    const newRow = lastRow + 1;
    mainSheet.getRange(newRow, 1, 1, newRowData.length).setValues([newRowData]);
    
    // 새 행 서식 적용
    formatNewRow(mainSheet, newRow, newRowData.length);
    
    // 통계 업데이트
    updateStatistics(spreadsheet, statsSheet, monthlySheet);

    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: `견적서 "${quoteNumber}"이 구글시트에 저장되었습니다`,
        timestamp: timestamp,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ 오류 발생:', error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 메인 견적서 목록 시트 생성
function createMainSheet(spreadsheet) {
  Logger.log('📋 메인 견적서 시트 생성');
  
  const sheets = spreadsheet.getSheets();
  let mainSheet;
  
  if (sheets.length > 0 && sheets[0].getName() === 'IBS_Quotations') {
    mainSheet = sheets[0];
    mainSheet.setName(MAIN_SHEET_NAME);
  } else {
    mainSheet = spreadsheet.insertSheet(MAIN_SHEET_NAME);
  }
  
  // 헤더 생성 (총 39개)
  const headers = [
    '접수일시', '견적번호', '견적일자', '년월', '프로젝트명',                    // A-E (5개)
    '고객업체', '담당자', '연락처', '이메일', '주소',                          // F-J (5개)
    '서비스요약', '납품기한', '결제조건',                                      // K-M (3개)
    '항목1_서비스명', '항목1_규격', '항목1_수량', '항목1_단가', '항목1_금액',   // N-R (5개)
    '항목2_서비스명', '항목2_규격', '항목2_수량', '항목2_단가', '항목2_금액',   // S-W (5개)
    '항목3_서비스명', '항목3_규격', '항목3_수량', '항목3_단가', '항목3_금액',   // X-AB (5개)
    '항목4_서비스명', '항목4_규격', '항목4_수량', '항목4_단가', '항목4_금액',   // AC-AG (5개)
    '할인금액', '추가서비스', '견적금액', '부가세', '총계약금액', '상태'         // AH-AM (6개)
  ];
  
  Logger.log('📋 헤더 개수:', headers.length);
  
  mainSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 헤더 스타일링
  const headerRange = mainSheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2c5aa0');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(9);
  headerRange.setHorizontalAlignment('center');
  
  // 열 너비 조정
  mainSheet.setColumnWidth(1, 120); // 접수일시
  mainSheet.setColumnWidth(2, 100); // 견적번호
  mainSheet.setColumnWidth(5, 150); // 프로젝트명
  mainSheet.setColumnWidth(6, 120); // 고객업체
  mainSheet.setColumnWidth(11, 200); // 서비스요약
  mainSheet.setColumnWidth(headers.length, 80); // 상태
  
  // 고정 행 설정
  mainSheet.setFrozenRows(1);
  mainSheet.setFrozenColumns(6);
  
  return mainSheet;
}

// 통계 대시보드 시트 생성
function createStatsSheet(spreadsheet) {
  Logger.log('📊 통계 대시보드 시트 생성');
  
  const statsSheet = spreadsheet.insertSheet(STATS_SHEET_NAME);
  
  // 대시보드 제목
  statsSheet.getRange('A1').setValue('🎯 IBS 견적서 관리 대시보드');
  statsSheet.getRange('A1').setFontSize(16).setFontWeight('bold').setBackground('#2c5aa0').setFontColor('#ffffff');
  statsSheet.getRange('A1:G1').merge();
  
  // 정확한 열 참조 - AL: 총계약금액 (38번째), AM: 상태 (39번째)
  const totalAmountCol = 'AL';
  const statusCol = 'AM';
  
  // 주요 통계 섹션 (완전히 수정된 안전한 수식)
  const statsLabels = [
    ['📊 주요 통계', '', '', '', '', '', ''],
    ['총 견적서 수:', '=COUNTA(IBS_견적서_목록!B2:B1000)', '', '이번 달 견적서:', '=COUNTIF(IBS_견적서_목록!D2:D1000,TEXT(TODAY(),"yyyy-mm"))', '', ''],
    ['총 견적금액:', `=SUMIF(IBS_견적서_목록!B2:B1000,"<>",IBS_견적서_목록!${totalAmountCol}2:${totalAmountCol}1000)`, '', '평균 견적금액:', `=IF(COUNTA(IBS_견적서_목록!B2:B1000)>0,SUMIF(IBS_견적서_목록!B2:B1000,"<>",IBS_견적서_목록!${totalAmountCol}2:${totalAmountCol}1000)/COUNTA(IBS_견적서_목록!B2:B1000),0)`, '', ''],
    ['견적 발행:', `=COUNTIF(IBS_견적서_목록!${statusCol}2:${statusCol}1000,"견적 발행")`, '', '견적 진행중:', `=COUNTIF(IBS_견적서_목록!${statusCol}2:${statusCol}1000,"견적 진행중")`, '', ''],
    ['계약 성사:', `=COUNTIF(IBS_견적서_목록!${statusCol}2:${statusCol}1000,"계약 성사")`, '', '계약 성사율:', `=IF(COUNTA(IBS_견적서_목록!B2:B1000)>0,ROUND(COUNTIF(IBS_견적서_목록!${statusCol}2:${statusCol}1000,"계약 성사")/COUNTA(IBS_견적서_목록!B2:B1000)*100,1)&"%","0%")`, '', ''],
    ['', '', '', '', '', '', ''],
    ['📈 월별 견적 현황', '', '', '', '', '', ''],
    ['년월', '견적수', '총금액', '평균금액', '견적발행', '진행중', '계약성사']
  ];
  
  statsSheet.getRange(3, 1, statsLabels.length, 7).setValues(statsLabels);
  
  // 스타일 적용
  statsSheet.getRange('A3:G3').setBackground('#4a90e2').setFontColor('#ffffff').setFontWeight('bold');
  statsSheet.getRange('A9:G9').setBackground('#4a90e2').setFontColor('#ffffff').setFontWeight('bold');
  
  // 숫자 서식 적용
  statsSheet.getRange('B4:B7').setNumberFormat('#,##0');
  statsSheet.getRange('E4:E7').setNumberFormat('#,##0');
  statsSheet.getRange('B5:B5').setNumberFormat('#,##0"원"'); // 총 견적금액
  statsSheet.getRange('E5:E5').setNumberFormat('#,##0"원"'); // 평균 견적금액
  
  // 열 너비 조정
  statsSheet.setColumnWidth(1, 120);
  statsSheet.setColumnWidth(2, 150);
  statsSheet.setColumnWidth(3, 50);
  statsSheet.setColumnWidth(4, 120);
  statsSheet.setColumnWidth(5, 150);
  
  return statsSheet;
}

// 월별 요약 시트 생성
function createMonthlySheet(spreadsheet) {
  Logger.log('📅 월별 요약 시트 생성');
  
  const monthlySheet = spreadsheet.insertSheet(MONTHLY_SHEET_NAME);
  
  // 제목
  monthlySheet.getRange('A1').setValue('📅 월별 견적 요약');
  monthlySheet.getRange('A1').setFontSize(14).setFontWeight('bold').setBackground('#2c5aa0').setFontColor('#ffffff');
  monthlySheet.getRange('A1:G1').merge();
  
  // 헤더
  const headers = ['년월', '견적수', '총견적금액', '평균금액', '견적발행', '진행중', '계약성사'];
  monthlySheet.getRange(3, 1, 1, headers.length).setValues([headers]);
  monthlySheet.getRange(3, 1, 1, headers.length).setBackground('#4a90e2').setFontColor('#ffffff').setFontWeight('bold');
  
  return monthlySheet;
}

// 새 행 서식 적용
function formatNewRow(sheet, rowNum, colCount) {
  const range = sheet.getRange(rowNum, 1, 1, colCount);
  
  // 교대로 배경색 적용
  if (rowNum % 2 === 0) {
    range.setBackground('#f8f9fa');
  }
  
  // 테두리 적용
  range.setBorder(true, true, true, true, null, null);
  
  // 금액 컬럼 서식 (할인금액부터 총계약금액까지: AH-AL, 34-38번째)
  sheet.getRange(rowNum, 34, 1, 5).setNumberFormat('#,##0"원"');
  
  // 상태 컬럼 서식 및 드롭다운 설정 (39번째)
  const statusCell = sheet.getRange(rowNum, 39);
  statusCell.setHorizontalAlignment('center');
  statusCell.setBackground('#fff3cd');
  statusCell.setFontWeight('bold');
  
  // 상태 드롭다운 목록 설정
  const statusOptions = ['견적 발행', '견적 진행중', '계약 성사'];
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusOptions, true)
    .setAllowInvalid(false)
    .setHelpText('상태를 선택하세요: 견적 발행, 견적 진행중, 계약 성사')
    .build();
  statusCell.setDataValidation(rule);
}

// 통계 업데이트
function updateStatistics(spreadsheet, statsSheet, monthlySheet) {
  Logger.log('📊 통계 업데이트 시작');
  
  try {
    const mainSheet = spreadsheet.getSheetByName(MAIN_SHEET_NAME);
    const data = mainSheet.getDataRange().getValues();
    
    if (data.length <= 1) return; // 헤더만 있으면 종료
    
    // 월별 데이터 집계
    const monthlyData = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const yearMonth = row[3]; // D열: 년월
      const finalTotal = row[37] || 0; // AL열: 총계약금액 (38번째, 인덱스 37)
      const status = row[38] || '견적 발행'; // AM열: 상태 (39번째, 인덱스 38)
      
      if (!monthlyData[yearMonth]) {
        monthlyData[yearMonth] = {
          count: 0,
          totalAmount: 0,
          new: 0,
          inProgress: 0,
          completed: 0
        };
      }
      
      monthlyData[yearMonth].count++;
      monthlyData[yearMonth].totalAmount += parseInt(finalTotal) || 0;
      
      if (status === '견적 발행') monthlyData[yearMonth].new++;
      else if (status === '견적 진행중') monthlyData[yearMonth].inProgress++;
      else if (status === '계약 성사') monthlyData[yearMonth].completed++;
    }
    
    // 월별 시트 업데이트
    monthlySheet.getRange('A4:G100').clear();
    
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    const monthlyRows = [];
    
    sortedMonths.forEach(month => {
      const data = monthlyData[month];
      const avgAmount = data.count > 0 ? Math.round(data.totalAmount / data.count) : 0;
      
      monthlyRows.push([
        month,
        data.count,
        data.totalAmount,
        avgAmount,
        data.new,
        data.inProgress,
        data.completed
      ]);
    });
    
    if (monthlyRows.length > 0) {
      monthlySheet.getRange(4, 1, monthlyRows.length, 7).setValues(monthlyRows);
      
      // 서식 적용
      monthlySheet.getRange(4, 2, monthlyRows.length, 1).setNumberFormat('#,##0');
      monthlySheet.getRange(4, 3, monthlyRows.length, 2).setNumberFormat('#,##0"원"');
      monthlySheet.getRange(4, 5, monthlyRows.length, 3).setNumberFormat('#,##0');
    }
    
    Logger.log('✅ 통계 업데이트 완료');
    
  } catch (error) {
    Logger.log('❌ 통계 업데이트 오류:', error.toString());
  }
}

// GET 요청 처리
function doGet(e) {
  return ContentService
    .createTextOutput('🎯 IBS 견적서 관리 시스템이 정상 작동 중입니다!')
    .setMimeType(ContentService.MimeType.TEXT);
}

// 수동 통계 업데이트 함수
function manualUpdateStats() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const statsSheet = spreadsheet.getSheetByName(STATS_SHEET_NAME);
    const monthlySheet = spreadsheet.getSheetByName(MONTHLY_SHEET_NAME);
    
    if (!statsSheet) createStatsSheet(spreadsheet);
    if (!monthlySheet) createMonthlySheet(spreadsheet);
    
    updateStatistics(spreadsheet, statsSheet, monthlySheet);
    Logger.log('✅ 수동 통계 업데이트 완료');
    
  } catch (error) {
    Logger.log('❌ 수동 통계 업데이트 실패:', error.toString());
  }
}

// 강제 시트 재생성 함수 (문제 해결용)
function forceRecreateSheets() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 기존 통계 시트들 삭제
    const sheets = spreadsheet.getSheets();
    sheets.forEach(sheet => {
      const name = sheet.getName();
      if (name === STATS_SHEET_NAME || name === MONTHLY_SHEET_NAME) {
        spreadsheet.deleteSheet(sheet);
        Logger.log(`🗑️ ${name} 시트 삭제됨`);
      }
    });
    
    // 새로 생성
    const statsSheet = createStatsSheet(spreadsheet);
    const monthlySheet = createMonthlySheet(spreadsheet);
    
    // 통계 업데이트
    updateStatistics(spreadsheet, statsSheet, monthlySheet);
    
    Logger.log('🎯 모든 통계 시트가 강제로 재생성되었습니다!');
    
    return '✅ 통계 대시보드와 월별 요약이 완전히 새로 생성되었습니다!';
    
  } catch (error) {
    Logger.log('❌ 강제 재생성 실패:', error.toString());
    return '❌ 오류: ' + error.toString();
  }
}

// 기존 데이터에 드롭다운 적용 함수
function applyDropdownToExistingData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const mainSheet = spreadsheet.getSheetByName(MAIN_SHEET_NAME);
    
    if (!mainSheet) {
      Logger.log('❌ 메인 시트를 찾을 수 없습니다');
      return;
    }
    
    const lastRow = mainSheet.getLastRow();
    
    if (lastRow > 1) { // 헤더 제외하고 데이터가 있는 경우
      // 상태 열(AM열, 39번째)에 드롭다운 적용
      const statusRange = mainSheet.getRange(2, 39, lastRow - 1, 1); // 2행부터 마지막 행까지
      
      const statusOptions = ['견적 발행', '견적 진행중', '계약 성사'];
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(statusOptions, true)
        .setAllowInvalid(false)
        .setHelpText('상태를 선택하세요: 견적 발행, 견적 진행중, 계약 성사')
        .build();
      
      statusRange.setDataValidation(rule);
      
      Logger.log(`✅ ${lastRow - 1}개 행에 상태 드롭다운이 적용되었습니다`);
      return `✅ ${lastRow - 1}개 행에 상태 드롭다운이 적용되었습니다`;
    } else {
      Logger.log('📝 적용할 데이터가 없습니다');
      return '📝 적용할 데이터가 없습니다';
    }
    
  } catch (error) {
    Logger.log('❌ 드롭다운 적용 실패:', error.toString());
    return '❌ 오류: ' + error.toString();
  }
} 