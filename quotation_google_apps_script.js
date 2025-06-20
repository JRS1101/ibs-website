// 🎯 IBS 견적서 구글시트 연동 스크립트 (고급 관리 시스템)
// 견적서 데이터를 구글시트에 자동 저장 + 통계 및 대시보드 기능

const SPREADSHEET_ID = '1MUHiU8a0p1aBs0wU94gmmlugwmB9qSYO8NLl-qZ9-ho'; 
const MAIN_SHEET_NAME = 'IBS_견적서_목록'; // 메인 견적서 목록
const STATS_SHEET_NAME = 'IBS_통계_대시보드'; // 통계 대시보드
const MONTHLY_SHEET_NAME = 'IBS_월별_요약'; // 월별 요약

function doPost(e) {
  Logger.log('🎯 견적서 데이터 수신 시작');
  
  try {
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
        Logger.log('📝 Form 데이터:', data);
      }
    } else {
      data = e.parameter;
      Logger.log('📝 Parameter 데이터:', data);
    }

    // 데이터 검증
    if (!data || Object.keys(data).length === 0) {
      throw new Error('전송된 견적서 데이터가 없습니다');
    }

    // 타임스탬프 생성
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const dateObj = new Date();
    const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    Logger.log('⏰ 타임스탬프:', timestamp);

    // 스프레드시트 접근
    Logger.log('📊 시트 접근 시도...');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ 스프레드시트 열기 성공');
    
    // 메인 시트 설정
    let mainSheet = spreadsheet.getSheetByName(MAIN_SHEET_NAME);
    if (!mainSheet) {
      mainSheet = createMainSheet(spreadsheet);
    }
    
    // 통계 시트 설정
    let statsSheet = spreadsheet.getSheetByName(STATS_SHEET_NAME);
    if (!statsSheet) {
      statsSheet = createStatsSheet(spreadsheet);
    }
    
    // 월별 요약 시트 설정
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
    const discountAmount = parseInt(data.discountAmount || '0');
    const additionalAmount = parseInt(data.additionalAmount || '0');
    const subtotal = parseInt(data.subtotal || '0');
    const vat = parseInt(data.vat || '0');
    const finalTotal = parseInt(data.finalTotal || '0');
    
    // 견적 항목들 파싱 (최대 4개)
    let items = [];
    let itemsSummary = '';
    if (data.items && Array.isArray(data.items)) {
      items = data.items.slice(0, 4);
      itemsSummary = items.filter(item => item.service).map(item => item.service).join(', ');
    }
    
    // 항목 데이터 배열 생성 (4개 고정)
    let itemsData = [];
    for (let i = 0; i < 4; i++) {
      if (items[i]) {
        itemsData.push(
          items[i].service || '',
          items[i].spec || '',
          parseInt(items[i].quantity || '0'),
          parseInt(items[i].price || '0'),
          parseInt(items[i].amount || '0')
        );
      } else {
        itemsData.push('', '', 0, 0, 0);
      }
    }
    
    Logger.log('📝 추출된 데이터:', { 
      quoteNumber, projectName, clientCompany, itemsCount: items.length 
    });

    // 메인 시트에 데이터 추가
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
      ...itemsData,        // N-AR: 항목들 (4개×5컬럼 = 20컬럼)
      discountAmount,      // AS: 할인금액
      additionalAmount,    // AT: 추가서비스금액
      subtotal,            // AU: 견적금액
      vat,                 // AV: 부가세
      finalTotal,          // AW: 총계약금액
      quoteStatus          // AX: 상태
    ];
    
    Logger.log('📋 저장할 행 데이터 길이:', newRowData.length);
    Logger.log('📋 저장 데이터 미리보기:', {
      접수일시: newRowData[0],
      견적번호: newRowData[1], 
      년월: newRowData[3],
      총계약금액: newRowData[newRowData.length-2],
      상태: newRowData[newRowData.length-1]
    });

    // 메인 시트에 추가
    Logger.log('💾 메인 시트에 데이터 저장 중...');
    const lastRow = mainSheet.getLastRow();
    const newRow = lastRow + 1;
    mainSheet.getRange(newRow, 1, 1, newRowData.length).setValues([newRowData]);
    
    // 새 행 서식 적용
    formatNewRow(mainSheet, newRow, newRowData.length);
    
    // 통계 업데이트
    updateStatistics(spreadsheet, statsSheet, monthlySheet);
    
    Logger.log('✅ 시트 저장 완료!');

    // 성공 응답
    Logger.log('🎉 견적서 저장 완료!');
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

// 메인 견적서 목록 시트 생성
function createMainSheet(spreadsheet) {
  Logger.log('📋 메인 견적서 시트 생성');
  
  // 기존 시트 이름 변경 시도
  const sheets = spreadsheet.getSheets();
  let mainSheet;
  
  if (sheets.length > 0 && sheets[0].getName() === 'IBS_Quotations') {
    mainSheet = sheets[0];
    mainSheet.setName(MAIN_SHEET_NAME);
  } else {
    mainSheet = spreadsheet.insertSheet(MAIN_SHEET_NAME);
  }
  
  // 헤더 생성
  const headers = [
    '접수일시', '견적번호', '견적일자', '년월', '프로젝트명',                    // A-E
    '고객업체', '담당자', '연락처', '이메일', '주소',                          // F-J
    '서비스요약', '납품기한', '결제조건',                                      // K-M
    '항목1_서비스명', '항목1_규격', '항목1_수량', '항목1_단가', '항목1_금액',   // N-R
    '항목2_서비스명', '항목2_규격', '항목2_수량', '항목2_단가', '항목2_금액',   // S-W
    '항목3_서비스명', '항목3_규격', '항목3_수량', '항목3_단가', '항목3_금액',   // X-AB
    '항목4_서비스명', '항목4_규격', '항목4_수량', '항목4_단가', '항목4_금액',   // AC-AG
    '할인금액', '추가서비스', '견적금액', '부가세', '총계약금액', '상태'         // AH-AM
  ];
  
  Logger.log('📋 헤더 개수:', headers.length); // 디버깅용
  
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
  mainSheet.setColumnWidth(3, 80);  // 견적일자
  mainSheet.setColumnWidth(4, 60);  // 년월
  mainSheet.setColumnWidth(5, 150); // 프로젝트명
  mainSheet.setColumnWidth(6, 120); // 고객업체
  mainSheet.setColumnWidth(7, 80);  // 담당자
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
  statsSheet.getRange('A1:F1').merge();
  
  // 정확한 열 참조 (39개 헤더 기준)
  // AJ: 견적금액 (36번째), AL: 총계약금액 (38번째), AM: 상태 (39번째)
  const totalAmountCol = 'AL'; // 총계약금액 (38번째 열)
  const statusCol = 'AM'; // 상태 (39번째 열)
  
  Logger.log(`📊 총금액 열: ${totalAmountCol}, 상태 열: ${statusCol}`);
  
  // 주요 통계 섹션
  const statsLabels = [
    ['📊 주요 통계', '', '', '', '', ''],
    ['총 견적서 수:', '=COUNTA(IBS_견적서_목록!B:B)-1', '', '이번 달 견적서:', '=COUNTIF(IBS_견적서_목록!D:D,TEXT(TODAY(),"yyyy-mm"))', ''],
    ['총 견적금액:', `=SUM(IBS_견적서_목록!${totalAmountCol}:${totalAmountCol})`, '', '평균 견적금액:', `=IF(COUNTA(IBS_견적서_목록!B:B)>1,AVERAGE(IBS_견적서_목록!${totalAmountCol}:${totalAmountCol}),"데이터 없음")`, ''],
    ['견적 발행:', `=COUNTIF(IBS_견적서_목록!${statusCol}:${statusCol},"견적 발행")`, '', '견적 진행중:', `=COUNTIF(IBS_견적서_목록!${statusCol}:${statusCol},"견적 진행중")`, ''],
    ['계약 성사:', `=COUNTIF(IBS_견적서_목록!${statusCol}:${statusCol},"계약 성사")`, '', '계약 성사율:', `=IF(COUNTA(IBS_견적서_목록!B:B)>1,COUNTIF(IBS_견적서_목록!${statusCol}:${statusCol},"계약 성사")/(COUNTA(IBS_견적서_목록!B:B)-1)*100&"%","0%")`, ''],
    ['', '', '', '', '', ''],
    ['📈 월별 견적 현황', '', '', '', '', ''],
    ['년월', '견적수', '총금액', '평균금액', '견적발행', '진행중', '계약성사']
  ];
  
  statsSheet.getRange(3, 1, statsLabels.length, 6).setValues(statsLabels);
  
  // 스타일 적용
  statsSheet.getRange('A3:F3').setBackground('#4a90e2').setFontColor('#ffffff').setFontWeight('bold');
  statsSheet.getRange('A9:F9').setBackground('#4a90e2').setFontColor('#ffffff').setFontWeight('bold');
  
  // 숫자 서식
  statsSheet.getRange('B4:B7').setNumberFormat('#,##0');
  statsSheet.getRange('D4:D7').setNumberFormat('#,##0');
  
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
  
  // 금액 컬럼 서식 (할인금액부터 총계약금액까지)
  const moneyStartCol = colCount - 5; // 뒤에서 5개 컬럼
  sheet.getRange(rowNum, moneyStartCol, 1, 5).setNumberFormat('#,##0"원"');
  
  // 상태 컬럼 서식
  const statusCell = sheet.getRange(rowNum, colCount);
  statusCell.setHorizontalAlignment('center');
  statusCell.setBackground('#fff3cd');
  statusCell.setFontWeight('bold');
}

// 통계 업데이트
function updateStatistics(spreadsheet, statsSheet, monthlySheet) {
  Logger.log('📊 통계 업데이트 시작');
  
  try {
    // 월별 요약 데이터 생성
    const mainSheet = spreadsheet.getSheetByName(MAIN_SHEET_NAME);
    const data = mainSheet.getDataRange().getValues();
    
    if (data.length <= 1) return; // 헤더만 있으면 종료
    
    // 월별 데이터 집계
    const monthlyData = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const yearMonth = row[3]; // D열: 년월 (4번째 컬럼, 인덱스 3)
      
      // 실제 배열 길이 확인
      Logger.log(`📊 행 ${i} 길이: ${row.length}, 데이터:`, row.slice(-6));
      
      // 마지막 두 항목이 총계약금액과 상태
      const finalTotal = row[row.length - 2] || 0; // 총계약금액 (마지막에서 두번째)
      const status = row[row.length - 1] || '견적 발행'; // 상태 (마지막)
      
      Logger.log(`📊 행 ${i}: 년월=${yearMonth}, 총금액=${finalTotal}, 상태=${status}`);
      
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
    monthlySheet.getRange('A4:G100').clear(); // 기존 데이터 삭제
    
    const sortedMonths = Object.keys(monthlyData).sort().reverse(); // 최신 월부터
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
      monthlySheet.getRange(4, 2, monthlyRows.length, 1).setNumberFormat('#,##0'); // 견적수
      monthlySheet.getRange(4, 3, monthlyRows.length, 2).setNumberFormat('#,##0"원"'); // 금액
      monthlySheet.getRange(4, 5, monthlyRows.length, 3).setNumberFormat('#,##0'); // 상태별 수량
    }
    
    Logger.log('✅ 통계 업데이트 완료');
    
  } catch (error) {
    Logger.log('❌ 통계 업데이트 오류:', error.toString());
  }
}

// GET 요청 처리 (테스트용)
function doGet(e) {
  Logger.log('🌐 GET 요청 받음');
  return ContentService
    .createTextOutput('🎯 IBS 견적서 관리 시스템이 정상 작동 중입니다!')
    .setMimeType(ContentService.MimeType.TEXT);
}

// 수동 통계 업데이트 함수
function manualUpdateStats() {
  Logger.log('🔧 수동 통계 업데이트 시작');
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const statsSheet = spreadsheet.getSheetByName(STATS_SHEET_NAME);
    const monthlySheet = spreadsheet.getSheetByName(MONTHLY_SHEET_NAME);
    
    if (!statsSheet) {
      createStatsSheet(spreadsheet);
    }
    if (!monthlySheet) {
      createMonthlySheet(spreadsheet);
    }
    
    updateStatistics(spreadsheet, statsSheet, monthlySheet);
    Logger.log('✅ 수동 통계 업데이트 완료');
    
  } catch (error) {
    Logger.log('❌ 수동 통계 업데이트 실패:', error.toString());
  }
} 