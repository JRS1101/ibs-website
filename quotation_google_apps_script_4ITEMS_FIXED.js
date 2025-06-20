// 🎯 IBS 견적서 구글시트 연동 스크립트 (4개 항목 고정 최종 버전)
// ✅ 상태 드롭다운, 정확한 열 참조, 완벽한 통계 시스템
// ✅ 항상 정확히 4개 항목으로 고정 (HTML과 완벽 연동)
// 🔧 2024년 최종 수정: HTML에서 항목 삭제 불가, 항상 4개 유지

const SPREADSHEET_ID = '1MUHiU8a0p1aBs0wU94gmmlugwmB9qSYO8NLl-qZ9-ho'; 
const MAIN_SHEET_NAME = 'IBS_견적서_목록';
const TRANSACTION_SHEET_NAME = 'IBS_거래명세서_목록';
const STATS_SHEET_NAME = 'IBS_통계_대시보드';
const MONTHLY_SHEET_NAME = 'IBS_월별_요약';

function doPost(e) {
  // OPTIONS 요청은 Google Apps Script에서 자동 처리됨

  try {
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
      throw new Error('전송된 데이터가 없습니다');
    }

    // 데이터 타입에 따라 처리 분기
    if (data.type === 'transaction') {
      Logger.log('📋 거래명세서 저장 요청 시작');
      return handleTransactionData(data);
    } else {
      Logger.log('📋 견적서 저장 요청 시작');
      return handleQuotationData(data);
    }

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

// 견적서 데이터 처리 함수
function handleQuotationData(data) {
  try {
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
    Logger.log('❌ 견적서 저장 오류:', error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 거래명세서 데이터 처리 함수
function handleTransactionData(data) {
  try {
    // 타임스탬프 생성
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const dateObj = new Date();
    const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

    // 스프레드시트 접근
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 거래명세서 시트 설정
    let transactionSheet = spreadsheet.getSheetByName(TRANSACTION_SHEET_NAME);
    if (!transactionSheet) {
      transactionSheet = createTransactionSheet(spreadsheet);
    }

    // 데이터 추출 및 정리
    const docNumber = data.docNumber || '';
    const issueDate = data.issueDate || '';
    const transactionDate = data.transactionDate || '';
    const deliveryDate = data.deliveryDate || '';
    const clientCompany = data.clientCompany || '';
    const clientContact = data.clientContact || '';
    const clientPhone = data.clientPhone || '';
    const clientEmail = data.clientEmail || '';
    const paymentTerms = data.paymentTerms || '';
    const deliveryTerms = data.deliveryTerms || '';
    const transactionStatus = data.transactionStatus || '주문접수';
    const specialNotes = data.specialNotes || '';
    
    // 금액 데이터
    const subtotal = parseInt((data.subtotal || '0').toString().replace(/,/g, '')) || 0;
    const vat = parseInt((data.vat || '0').toString().replace(/,/g, '')) || 0;
    const totalAmount = parseInt((data.totalAmount || '0').toString().replace(/,/g, '')) || 0;
    
    // 거래 항목들 파싱
    let items = [];
    let itemsSummary = '';
    
    if (data.items && Array.isArray(data.items)) {
      items = data.items.slice(0, 10); // 최대 10개 항목
      itemsSummary = items
        .filter(item => item && item.itemName && item.itemName.trim() !== '')
        .map(item => item.itemName)
        .join(', ');
    }
    
    // 항목 데이터 배열 생성 (최대 10개×6컬럼 = 60컬럼)
    let itemsData = [];
    for (let i = 0; i < 10; i++) {
      const item = items[i] || {};
      itemsData.push(
        item.itemName || '',                                                   // 품목명
        item.specs || '',                                                      // 규격/사양
        parseInt(item.quantity || '1') || 1,                                   // 수량
        item.unit || 'EA',                                                     // 단위
        parseInt((item.unitPrice || '0').toString().replace(/,/g, '')) || 0,   // 단가
        parseInt((item.amount || '0').toString().replace(/,/g, '')) || 0       // 금액
      );
    }
    
    Logger.log('📋 처리된 거래 항목 개수:', items.length);

    // 거래명세서 시트에 데이터 추가
    const newRowData = [
      timestamp,           // A: 등록일시
      docNumber,           // B: 문서번호
      issueDate,           // C: 발행일자
      transactionDate,     // D: 거래일자
      deliveryDate,        // E: 납품일자
      monthYear,           // F: 년월
      clientCompany,       // G: 거래처
      clientContact,       // H: 담당자
      clientPhone,         // I: 연락처
      clientEmail,         // J: 이메일
      itemsSummary,        // K: 품목요약
      paymentTerms,        // L: 결제조건
      deliveryTerms,       // M: 배송조건
      transactionStatus,   // N: 거래상태
      specialNotes,        // O: 특이사항
      ...itemsData,        // P-BO: 최대 10개 항목 (10×6컬럼 = 60컬럼)
      subtotal,            // BP: 소계
      vat,                 // BQ: 부가세
      totalAmount          // BR: 총금액
    ];
    
    Logger.log('📋 저장할 거래명세서 행 데이터 길이:', newRowData.length);

    // 거래명세서 시트에 추가
    const lastRow = transactionSheet.getLastRow();
    const newRow = lastRow + 1;
    transactionSheet.getRange(newRow, 1, 1, newRowData.length).setValues([newRowData]);
    
    // 새 행 서식 적용
    formatNewRow(transactionSheet, newRow, newRowData.length);

    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: `거래명세서 "${docNumber}"이 구글시트에 저장되었습니다`,
        timestamp: timestamp,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ 거래명세서 저장 오류:', error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 거래명세서 시트 생성
function createTransactionSheet(spreadsheet) {
  Logger.log('📋 거래명세서 시트 생성');
  
  const transactionSheet = spreadsheet.insertSheet(TRANSACTION_SHEET_NAME);
  
  // 헤더 생성 (총 70개)
  const headers = [
    '등록일시', '문서번호', '발행일자', '거래일자', '납품일자',                    // A-E (5개)
    '년월', '거래처', '담당자', '연락처', '이메일',                            // F-J (5개)
    '품목요약', '결제조건', '배송조건', '거래상태', '특이사항',                  // K-O (5개)
  ];
  
  // 10개 항목 헤더 추가 (10×6 = 60개)
  for (let i = 1; i <= 10; i++) {
    headers.push(
      `항목${i}_품목명`, `항목${i}_규격`, `항목${i}_수량`, 
      `항목${i}_단위`, `항목${i}_단가`, `항목${i}_금액`
    );
  }
  
  // 합계 헤더 추가 (3개)
  headers.push('소계', '부가세', '총금액');
  
  // 헤더 설정
  transactionSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 헤더 서식 적용
  const headerRange = transactionSheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2c5aa0');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // 열 너비 조정
  transactionSheet.setColumnWidth(1, 150);  // 등록일시
  transactionSheet.setColumnWidth(2, 120);  // 문서번호
  transactionSheet.setColumnWidth(3, 100);  // 발행일자
  transactionSheet.setColumnWidth(4, 100);  // 거래일자
  transactionSheet.setColumnWidth(5, 100);  // 납품일자
  transactionSheet.setColumnWidth(6, 80);   // 년월
  transactionSheet.setColumnWidth(7, 150);  // 거래처
  transactionSheet.setColumnWidth(8, 100);  // 담당자
  transactionSheet.setColumnWidth(9, 120);  // 연락처
  transactionSheet.setColumnWidth(10, 150); // 이메일
  transactionSheet.setColumnWidth(11, 200); // 품목요약
  transactionSheet.setColumnWidth(12, 100); // 결제조건
  transactionSheet.setColumnWidth(13, 100); // 배송조건
  transactionSheet.setColumnWidth(14, 100); // 거래상태
  transactionSheet.setColumnWidth(15, 150); // 특이사항
  
  // 항목 열들 너비 조정
  for (let i = 0; i < 10; i++) {
    const startCol = 16 + (i * 6);
    transactionSheet.setColumnWidth(startCol, 120);     // 품목명
    transactionSheet.setColumnWidth(startCol + 1, 150); // 규격
    transactionSheet.setColumnWidth(startCol + 2, 60);  // 수량
    transactionSheet.setColumnWidth(startCol + 3, 60);  // 단위
    transactionSheet.setColumnWidth(startCol + 4, 100); // 단가
    transactionSheet.setColumnWidth(startCol + 5, 100); // 금액
  }
  
  // 합계 열들 너비 조정
  transactionSheet.setColumnWidth(76, 120); // 소계
  transactionSheet.setColumnWidth(77, 100); // 부가세
  transactionSheet.setColumnWidth(78, 120); // 총금액
  
  // 시트 보호 설정 (헤더만)
  const protection = transactionSheet.protect().setDescription('거래명세서 헤더 보호');
  protection.setUnprotectedRanges([transactionSheet.getRange(2, 1, transactionSheet.getMaxRows() - 1, headers.length)]);
  
  Logger.log('✅ 거래명세서 시트 생성 완료');
  return transactionSheet;
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
  try {
    const action = e.parameter.action;
    
    if (action === 'fixDashboard') {
      const result = fixDashboardFormulas();
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: result,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'createCharts') {
      const result = createAdvancedCharts();
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: result,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput('🎯 IBS 견적서 관리 시스템이 정상 작동 중입니다! (4개 항목 고정)')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    Logger.log('❌ GET 요청 처리 오류:', error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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

// 고급 통계 대시보드 생성 함수
function fixDashboardFormulas() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let statsSheet = spreadsheet.getSheetByName(STATS_SHEET_NAME);
    
    if (!statsSheet) {
      statsSheet = createStatsSheet(spreadsheet);
    }
    
    // 전체 시트 초기화
    statsSheet.clear();
    
    // 🎯 메인 제목
    statsSheet.getRange('A1').setValue('📊 IBS 견적서 고급 통계 대시보드');
    statsSheet.getRange('A1:H1').merge();
    statsSheet.getRange('A1').setFontSize(18).setFontWeight('bold')
      .setBackground('#1f4e79').setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    
    // 📈 핵심 지표 (KPI) 섹션
    statsSheet.getRange('A3').setValue('📈 핵심 지표 (KPI)');
    statsSheet.getRange('A3:H3').merge();
    statsSheet.getRange('A3').setFontSize(14).setFontWeight('bold')
      .setBackground('#4472c4').setFontColor('#ffffff');
    
    // KPI 데이터
    const kpiData = [
      ['총 견적 건수', '=COUNTA(IBS_견적서_목록!B2:B1000)', '이번 달 견적', '=COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())+1,1))'],
      ['총 견적 금액', '=SUMIF(IBS_견적서_목록!B2:B1000,"<>",IBS_견적서_목록!AL2:AL1000)', '이번 달 금액', '=SUMIFS(IBS_견적서_목록!AL2:AL1000,IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())+1,1))'],
      ['평균 견적 금액', '=IF(COUNTA(IBS_견적서_목록!B2:B1000)>0,SUMIF(IBS_견적서_목록!B2:B1000,"<>",IBS_견적서_목록!AL2:AL1000)/COUNTA(IBS_견적서_목록!B2:B1000),0)', '최고 견적 금액', '=MAX(IBS_견적서_목록!AL2:AL1000)'],
      ['계약 성사율', '=IF(COUNTA(IBS_견적서_목록!B2:B1000)>0,COUNTIF(IBS_견적서_목록!AM2:AM1000,"계약 성사")/COUNTA(IBS_견적서_목록!B2:B1000)*100,0)', '이번 달 성사율', '=IF(COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())+1,1))>0,COUNTIFS(IBS_견적서_목록!AM2:AM1000,"계약 성사",IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())+1,1))/COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())+1,1))*100,0)']
    ];
    
    statsSheet.getRange(4, 1, kpiData.length, 4).setValues(kpiData);
    
    // 📊 상태별 현황
    statsSheet.getRange('A9').setValue('📊 상태별 현황');
    statsSheet.getRange('A9:D9').merge();
    statsSheet.getRange('A9').setFontSize(14).setFontWeight('bold')
      .setBackground('#70ad47').setFontColor('#ffffff');
    
    const statusData = [
      ['견적 발행', '=COUNTIF(IBS_견적서_목록!AM2:AM1000,"견적 발행")', '비율', '=IF(COUNTA(IBS_견적서_목록!B2:B1000)>0,COUNTIF(IBS_견적서_목록!AM2:AM1000,"견적 발행")/COUNTA(IBS_견적서_목록!B2:B1000)*100,0)'],
      ['견적 진행중', '=COUNTIF(IBS_견적서_목록!AM2:AM1000,"견적 진행중")', '비율', '=IF(COUNTA(IBS_견적서_목록!B2:B1000)>0,COUNTIF(IBS_견적서_목록!AM2:AM1000,"견적 진행중")/COUNTA(IBS_견적서_목록!B2:B1000)*100,0)'],
      ['계약 성사', '=COUNTIF(IBS_견적서_목록!AM2:AM1000,"계약 성사")', '비율', '=IF(COUNTA(IBS_견적서_목록!B2:B1000)>0,COUNTIF(IBS_견적서_목록!AM2:AM1000,"계약 성사")/COUNTA(IBS_견적서_목록!B2:B1000)*100,0)']
    ];
    
    statsSheet.getRange(10, 1, statusData.length, 4).setValues(statusData);
    
    // 💰 금액 분석
    statsSheet.getRange('F9').setValue('💰 금액 분석');
    statsSheet.getRange('F9:H9').merge();
    statsSheet.getRange('F9').setFontSize(14).setFontWeight('bold')
      .setBackground('#e1a100').setFontColor('#ffffff');
    
    const amountData = [
      ['최소 견적 금액', '=IF(COUNTA(IBS_견적서_목록!AL2:AL1000)>0,MIN(IBS_견적서_목록!AL2:AL1000),0)'],
      ['최대 견적 금액', '=MAX(IBS_견적서_목록!AL2:AL1000)'],
      ['중간값', '=IF(COUNTA(IBS_견적서_목록!AL2:AL1000)>0,MEDIAN(IBS_견적서_목록!AL2:AL1000),0)']
    ];
    
    statsSheet.getRange(10, 6, amountData.length, 2).setValues(amountData);
    
    // 📅 최근 활동
    statsSheet.getRange('A14').setValue('📅 최근 활동 (최근 7일)');
    statsSheet.getRange('A14:H14').merge();
    statsSheet.getRange('A14').setFontSize(14).setFontWeight('bold')
      .setBackground('#c55a5a').setFontColor('#ffffff');
    
    const recentData = [
      ['최근 7일 견적', '=COUNTIFS(IBS_견적서_목록!A2:A1000,">="&TODAY()-7)', '최근 7일 금액', '=SUMIFS(IBS_견적서_목록!AL2:AL1000,IBS_견적서_목록!A2:A1000,">="&TODAY()-7)'],
      ['어제 견적', '=COUNTIFS(IBS_견적서_목록!A2:A1000,">="&TODAY()-1,IBS_견적서_목록!A2:A1000,"<"&TODAY())', '오늘 견적', '=COUNTIFS(IBS_견적서_목록!A2:A1000,">="&TODAY())']
    ];
    
    statsSheet.getRange(15, 1, recentData.length, 4).setValues(recentData);
    
    // 서식 적용
    applyAdvancedFormatting(statsSheet);
    
    Logger.log('✅ 고급 통계 대시보드가 생성되었습니다');
    return '✅ 고급 통계 대시보드가 생성되었습니다! 차트와 시각화가 추가되었습니다.';
    
  } catch (error) {
    Logger.log('❌ 고급 대시보드 생성 실패:', error.toString());
    return '❌ 오류: ' + error.toString();
  }
}

// 고급 서식 적용 함수
function applyAdvancedFormatting(sheet) {
  // 숫자 서식
  sheet.getRange('B4:B4').setNumberFormat('#,##0"건"');
  sheet.getRange('D4:D4').setNumberFormat('#,##0"건"');
  sheet.getRange('B5:B6').setNumberFormat('#,##0"원"');
  sheet.getRange('D5:D6').setNumberFormat('#,##0"원"');
  sheet.getRange('B7:B7').setNumberFormat('0.0"%"');
  sheet.getRange('D7:D7').setNumberFormat('0.0"%"');
  
  sheet.getRange('B10:B12').setNumberFormat('#,##0"건"');
  sheet.getRange('D10:D12').setNumberFormat('0.0"%"');
  sheet.getRange('G10:G12').setNumberFormat('#,##0"원"');
  
  sheet.getRange('B15:B16').setNumberFormat('#,##0"건"');
  sheet.getRange('D15:D16').setNumberFormat('#,##0"원"');
  
  // 컬럼 너비 조정
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 50);
  sheet.setColumnWidth(6, 120);
  sheet.setColumnWidth(7, 150);
  sheet.setColumnWidth(8, 100);
  
  // 테두리 적용
  sheet.getRange('A4:D7').setBorder(true, true, true, true, true, true);
  sheet.getRange('A10:D12').setBorder(true, true, true, true, true, true);
  sheet.getRange('F10:G12').setBorder(true, true, true, true, true, true);
  sheet.getRange('A15:D16').setBorder(true, true, true, true, true, true);
}

// 📊 차트 생성 함수
function createAdvancedCharts() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let statsSheet = spreadsheet.getSheetByName(STATS_SHEET_NAME);
    
    if (!statsSheet) {
      Logger.log('❌ 통계 시트가 없습니다. 먼저 대시보드를 생성하세요.');
      return '❌ 통계 시트가 없습니다. 먼저 대시보드를 생성하세요.';
    }
    
    // 기존 차트 삭제
    const charts = statsSheet.getCharts();
    charts.forEach(chart => statsSheet.removeChart(chart));
    
    // 1️⃣ 상태별 파이 차트
    const pieChartData = [
      ['상태', '건수'],
      ['견적 발행', '=COUNTIF(IBS_견적서_목록!AM2:AM1000,"견적 발행")'],
      ['견적 진행중', '=COUNTIF(IBS_견적서_목록!AM2:AM1000,"견적 진행중")'],
      ['계약 성사', '=COUNTIF(IBS_견적서_목록!AM2:AM1000,"계약 성사")']
    ];
    
    // 차트 데이터 영역 설정
    statsSheet.getRange('J3:K6').setValues(pieChartData);
    
    const pieChart = statsSheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(statsSheet.getRange('J3:K6'))
      .setPosition(18, 10, 0, 0) // 18행, 10열에 위치
      .setOption('title', '📊 견적 상태별 분포')
      .setOption('titleTextStyle', {fontSize: 14, bold: true})
      .setOption('pieSliceText', 'percentage')
      .setOption('colors', ['#4285f4', '#ea4335', '#34a853'])
      .setOption('width', 400)
      .setOption('height', 300)
      .build();
    
    statsSheet.insertChart(pieChart);
    
    // 2️⃣ 월별 트렌드 라인 차트 (최근 6개월)
    const monthlyData = [
      ['월', '견적 건수', '견적 금액'],
      ['6개월 전', '=COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-6,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-5,1))', '=SUMIFS(IBS_견적서_목록!AL2:AL1000,IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-6,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-5,1))'],
      ['5개월 전', '=COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-5,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-4,1))', '=SUMIFS(IBS_견적서_목록!AL2:AL1000,IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-5,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-4,1))'],
      ['4개월 전', '=COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-4,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-3,1))', '=SUMIFS(IBS_견적서_목록!AL2:AL1000,IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-4,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-3,1))'],
      ['3개월 전', '=COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-3,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-2,1))', '=SUMIFS(IBS_견적서_목록!AL2:AL1000,IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-3,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-2,1))'],
      ['2개월 전', '=COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-2,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-1,1))', '=SUMIFS(IBS_견적서_목록!AL2:AL1000,IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-2,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY())-1,1))'],
      ['지난달', '=COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-1,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY()),1))', '=SUMIFS(IBS_견적서_목록!AL2:AL1000,IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY())-1,1),IBS_견적서_목록!C2:C1000,"<"&DATE(YEAR(TODAY()),MONTH(TODAY()),1))'],
      ['이번달', '=COUNTIFS(IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))', '=SUMIFS(IBS_견적서_목록!AL2:AL1000,IBS_견적서_목록!C2:C1000,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))']
    ];
    
    statsSheet.getRange('M3:O10').setValues(monthlyData);
    
    const lineChart = statsSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(statsSheet.getRange('M3:O10'))
      .setPosition(18, 16, 0, 0) // 18행, 16열에 위치
      .setOption('title', '📈 월별 견적 트렌드')
      .setOption('titleTextStyle', {fontSize: 14, bold: true})
      .setOption('hAxis', {title: '월'})
      .setOption('vAxes', {
        0: {title: '견적 건수'},
        1: {title: '견적 금액 (원)'}
      })
      .setOption('series', {
        0: {targetAxisIndex: 0, color: '#4285f4'},
        1: {targetAxisIndex: 1, color: '#ea4335'}
      })
      .setOption('width', 500)
      .setOption('height', 300)
      .build();
    
    statsSheet.insertChart(lineChart);
    
    // 3️⃣ 금액 분포 막대 차트
    const amountRangeData = [
      ['금액 범위', '건수'],
      ['100만원 미만', '=COUNTIFS(IBS_견적서_목록!AL2:AL1000,"<1000000",IBS_견적서_목록!AL2:AL1000,">0")'],
      ['100-300만원', '=COUNTIFS(IBS_견적서_목록!AL2:AL1000,">=1000000",IBS_견적서_목록!AL2:AL1000,"<3000000")'],
      ['300-500만원', '=COUNTIFS(IBS_견적서_목록!AL2:AL1000,">=3000000",IBS_견적서_목록!AL2:AL1000,"<5000000")'],
      ['500-1000만원', '=COUNTIFS(IBS_견적서_목록!AL2:AL1000,">=5000000",IBS_견적서_목록!AL2:AL1000,"<10000000")'],
      ['1000만원 이상', '=COUNTIFS(IBS_견적서_목록!AL2:AL1000,">=10000000")']
    ];
    
    statsSheet.getRange('Q3:R8').setValues(amountRangeData);
    
    const barChart = statsSheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(statsSheet.getRange('Q3:R8'))
      .setPosition(28, 10, 0, 0) // 28행, 10열에 위치
      .setOption('title', '💰 견적 금액 분포')
      .setOption('titleTextStyle', {fontSize: 14, bold: true})
      .setOption('hAxis', {title: '금액 범위'})
      .setOption('vAxis', {title: '견적 건수'})
      .setOption('colors', ['#34a853'])
      .setOption('width', 500)
      .setOption('height', 300)
      .build();
    
    statsSheet.insertChart(barChart);
    
    Logger.log('✅ 고급 차트가 생성되었습니다');
    return '✅ 고급 차트가 생성되었습니다! 파이차트, 라인차트, 막대차트가 추가되었습니다.';
    
  } catch (error) {
    Logger.log('❌ 차트 생성 실패:', error.toString());
    return '❌ 차트 생성 오류: ' + error.toString();
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