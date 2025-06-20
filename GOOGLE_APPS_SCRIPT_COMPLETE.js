// 🔧 Google Apps Script - IBS 견적서 연동 (SyntaxError 해결 버전) + 인보이스 기능 추가
const SPREADSHEET_ID = '1MUHiU8a0p1aBs0wU94gmmlugwmB9qSYO8NLl-qZ9-ho';

// 시트 이름들 - 실제 시트 이름에 맞게 수정
const SHEET_NAMES = {
  QUOTATIONS: 'IBS_견적서_목록',
  DELIVERY: 'IBS_거래명세서_목록',
  INVOICE: 'IBS_Invoice_List'
};

// 안전한 JSON 응답 생성
function createSafeResponse(data) {
  try {
    // 응답 데이터 검증
    if (typeof data !== 'object') {
      data = { error: '잘못된 데이터 형식', data: data };
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    const output = ContentService.createTextOutput(jsonString);
    output.setMimeType(ContentService.MimeType.JSON);
    
    return output;
  } catch (error) {
    // JSON 변환 실패 시 안전한 fallback
    const fallbackResponse = {
      success: false,
      error: 'JSON 응답 생성 실패',
      details: error.toString()
    };
    
    const output = ContentService.createTextOutput(JSON.stringify(fallbackResponse));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// GET 요청 처리 (안전성 강화)
function doGet(e) {
  try {
    console.log('📥 GET 요청 수신');
    
    // 매개변수 안전 처리
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || '';
    
    console.log('📋 요청된 액션:', action);
    console.log('📋 전체 매개변수:', JSON.stringify(params));
    
    // 액션별 처리
    switch (action) {
      case 'getQuotationList':
        return getQuotationList();
        
      case 'getQuotationData':
        const quoteNumber = params.quoteNumber;
        if (!quoteNumber) {
          return createSafeResponse({
            success: false,
            error: '견적번호가 필요합니다.'
          });
        }
        return getQuotationData(quoteNumber);
        
      case 'getStats':
        return getAnalyticsStats();
        
      case 'setupQuotationValidation':
        return setupQuotationDropdowns();
        
      case 'resetDeliverySheet':
        return resetDeliverySheetStructure();
        

        
      case '':
      case null:
      case undefined:
        return createSafeResponse({
          success: false,
          error: '액션을 지정해주세요.',
          availableActions: ['getQuotationList', 'getQuotationData', 'getStats', 'setupQuotationValidation', 'resetDeliverySheet']
        });
        
      default:
        return createSafeResponse({
          success: false,
          error: '지원하지 않는 액션입니다: ' + action,
          availableActions: ['getQuotationList', 'getQuotationData', 'getStats', 'setupQuotationValidation', 'resetDeliverySheet']
        });
    }
    
  } catch (error) {
    console.error('doGet 오류:', error);
    return createSafeResponse({
      success: false,
      error: 'API 처리 중 오류 발생',
      details: error.toString()
    });
  }
}

// POST 요청 처리 (견적서 저장 + 🆕 인보이스 저장 추가)
function doPost(e) {
  try {
    console.log('📥 POST 요청 수신');
    
    if (!e.postData || !e.postData.contents) {
      throw new Error('POST 데이터가 없습니다.');
    }
    
    const postData = JSON.parse(e.postData.contents);
    console.log('📋 POST 데이터:', postData);
    
    // 🆕 인보이스 저장 액션 추가
    if (postData.action === 'saveInvoice') {
      return saveInvoiceData(postData.data);
    }
    
    // 🆕 거래명세서 저장 액션 추가
    if (postData.action === 'saveDelivery') {
      return saveDeliveryData(postData.data);
    }
    
    // 기존 견적서 저장 (기본 동작)
    return saveQuotationData(postData);
    
  } catch (error) {
    console.error('doPost 오류:', error);
    return createSafeResponse({
      success: false,
      error: 'POST 처리 중 오류 발생',
      details: error.toString()
    });
  }
}

// 견적서 목록 조회 (안전성 강화)
function getQuotationList() {
  try {
    console.log('📋 견적서 목록 조회 시작');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.QUOTATIONS);
    
    if (!sheet) {
      throw new Error(`시트를 찾을 수 없습니다: ${SHEET_NAMES.QUOTATIONS}`);
    }
    
    const range = sheet.getDataRange();
    if (!range) {
      throw new Error('시트에 데이터가 없습니다.');
    }
    
    const data = range.getValues();
    console.log('📊 시트 데이터 행 수:', data.length);
    
    if (data.length <= 1) {
      return createSafeResponse({
        success: true,
        data: [],
        message: '저장된 견적서가 없습니다.'
      });
    }
    
    const quotations = [];
    
    // 헤더 행(0번째)을 제외하고 데이터 처리
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // 빈 행 건너뛰기 (견적번호 기준)
      if (!row[1] || row[1].toString().trim() === '') {
        continue;
      }
      
      // 안전한 데이터 추출 (실제 시트 구조에 맞춤)
      const quotation = {
        timestamp: row[0] || '', // A: 접수일시
        quoteNumber: (row[1] || '').toString(), // B: 견적번호
        quoteDate: (row[2] || '').toString(), // C: 견적일자
        yearMonth: (row[3] || '').toString(), // D: 년월
        projectName: (row[4] || '').toString(), // E: 프로젝트명
        clientCompany: (row[5] || '').toString(), // F: 고객업체
        clientContact: (row[6] || '').toString(), // G: 담당자
        clientPhone: (row[7] || '').toString(), // H: 연락처
        clientEmail: (row[8] || '').toString(), // I: 이메일
        clientAddress: (row[9] || '').toString(), // J: 주소
        deliveryDays: (row[11] || '').toString(), // L: 납품기한
        paymentTerms: (row[12] || '').toString(), // M: 결제조건
        totalAmount: parseFloat(row[37]) || 0, // AL: 총계약금액 (37번째 인덱스)
        status: (row[38] || '견적 발행').toString() // AM: 상태 (38번째 인덱스)
      };
      
      quotations.push(quotation);
    }
    
    console.log('✅ 견적서 목록 조회 완료:', quotations.length + '개');
    
    return createSafeResponse({
      success: true,
      data: quotations,
      message: `${quotations.length}개의 견적서를 불러왔습니다.`
    });
    
  } catch (error) {
    console.error('❌ 견적서 목록 조회 실패:', error);
    return createSafeResponse({
      success: false,
      error: '견적서 목록 조회 실패',
      details: error.toString()
    });
  }
}

// 특정 견적서 데이터 조회
function getQuotationData(quoteNumber) {
  try {
    console.log('📋 견적서 데이터 조회:', quoteNumber);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.QUOTATIONS);
    
    if (!sheet) {
      throw new Error(`시트를 찾을 수 없습니다: ${SHEET_NAMES.QUOTATIONS}`);
    }
    
    const data = sheet.getDataRange().getValues();
    
    // 견적번호로 해당 행 찾기
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] && row[1].toString() === quoteNumber) {
        
        const quotationData = {
          quoteNumber: (row[1] || '').toString(),
          projectName: (row[2] || '').toString(),
          clientCompany: (row[3] || '').toString(),
          clientContact: (row[4] || '').toString(),
          clientPhone: (row[5] || '').toString(),
          quoteDate: row[6] || '',
          deliveryDays: (row[7] || '').toString(),
          paymentTerms: (row[8] || '').toString(),
          clientEmail: (row[9] || '').toString(),
          clientAddress: (row[10] || '').toString(),
          totalAmount: parseFloat(row[11]) || 0,
          status: (row[12] || '').toString()
        };
        
        console.log('✅ 견적서 데이터 조회 완료:', quotationData);
        
        return createSafeResponse({
          success: true,
          data: quotationData
        });
      }
    }
    
    throw new Error(`견적번호 ${quoteNumber}를 찾을 수 없습니다.`);
    
  } catch (error) {
    console.error('❌ 견적서 데이터 조회 실패:', error);
    return createSafeResponse({
      success: false,
      error: '견적서 데이터 조회 실패',
      details: error.toString()
    });
  }
}

// 통계 데이터 조회
function getAnalyticsStats() {
  try {
    console.log('📊 통계 데이터 조회 시작');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.QUOTATIONS);
    
    if (!sheet) {
      throw new Error(`시트를 찾을 수 없습니다: ${SHEET_NAMES.QUOTATIONS}`);
    }
    
    const data = sheet.getDataRange().getValues();
    let totalQuotations = 0;
    let totalAmount = 0;
    
    // 데이터 분석 (헤더 제외) - 실제 시트 구조에 맞춤
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] && row[1].toString().trim() !== '') { // 견적번호가 있으면
        totalQuotations++;
        totalAmount += parseFloat(row[37]) || 0; // AL열: 총계약금액 (37번째 인덱스)
      }
    }
    
    const stats = {
      totalQuotations: totalQuotations,
      totalAmount: totalAmount,
      averageAmount: totalQuotations > 0 ? Math.round(totalAmount / totalQuotations) : 0
    };
    
    console.log('✅ 통계 데이터 조회 완료:', stats);
    
    return createSafeResponse({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ 통계 데이터 조회 실패:', error);
    return createSafeResponse({
      success: false,
      error: '통계 데이터 조회 실패',
      details: error.toString()
    });
  }
}

// 견적서 데이터 저장
function saveQuotationData(quotationData) {
  try {
    console.log('💾 견적서 데이터 저장 시작');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.QUOTATIONS);
    
    if (!sheet) {
      throw new Error(`시트를 찾을 수 없습니다: ${SHEET_NAMES.QUOTATIONS}`);
    }
    
    // 실제 IBS_견적서_목록 시트 구조에 맞춰 데이터 준비
    const currentDate = new Date();
    const yearMonth = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
    
    // 항목 데이터 추출 (최대 4개 항목)
    const items = quotationData.items || [];
    const item1 = items[0] || {};
    const item2 = items[1] || {};
    const item3 = items[2] || {};
    const item4 = items[3] || {}; // 4번째 항목 추가
    
    const newRow = [
      currentDate, // A: 접수일시
      quotationData.quoteNumber || '', // B: 견적번호
      quotationData.quoteDate || '', // C: 견적일자
      yearMonth, // D: 년월
      quotationData.projectName || '', // E: 프로젝트명
      quotationData.clientCompany || '', // F: 고객업체
      quotationData.clientContact || '', // G: 담당자
      quotationData.clientPhone || '', // H: 연락처
      quotationData.clientEmail || '', // I: 이메일
      quotationData.clientAddress || '', // J: 주소
      '', // K: 서비스요약 (빈 값)
      quotationData.deliveryDays || '', // L: 납품기한
      quotationData.paymentTerms || '', // M: 결제조건
      
      // 항목1 (N-R열)
      item1.service || '', // N: 항목1_서비스명
      item1.spec || '', // O: 항목1_규격
      parseFloat(item1.quantity) || 0, // P: 항목1_수량
      parseFloat(item1.price) || 0, // Q: 항목1_단가
      parseFloat(item1.amount) || 0, // R: 항목1_금액
      
      // 항목2 (S-W열)
      item2.service || '', // S: 항목2_서비스명
      item2.spec || '', // T: 항목2_규격
      parseFloat(item2.quantity) || 0, // U: 항목2_수량
      parseFloat(item2.price) || 0, // V: 항목2_단가
      parseFloat(item2.amount) || 0, // W: 항목2_금액
      
      // 항목3 (X-AB열)
      item3.service || '', // X: 항목3_서비스명
      item3.spec || '', // Y: 항목3_규격
      parseFloat(item3.quantity) || 0, // Z: 항목3_수량
      parseFloat(item3.price) || 0, // AA: 항목3_단가
      parseFloat(item3.amount) || 0, // AB: 항목3_금액
      
      // 항목4 (AC-AG열)
      item4.service || '', // AC: 항목4_서비스명
      item4.spec || '', // AD: 항목4_규격
      parseFloat(item4.quantity) || 0, // AE: 항목4_수량
      parseFloat(item4.price) || 0, // AF: 항목4_단가
      parseFloat(item4.amount) || 0, // AG: 항목4_금액
      
      parseFloat(quotationData.discountAmount) || 0, // AH: 할인금액
      parseFloat(quotationData.additionalAmount) || 0, // AI: 추가서비스
      parseFloat(quotationData.subtotal) || 0, // AJ: 견적금액
      parseFloat(quotationData.vat) || 0, // AK: 부가세
      parseFloat(quotationData.finalTotal) || parseFloat(quotationData.totalAmount) || 0, // AL: 총계약금액
      quotationData.quoteStatus || '견적 발행' // AM: 상태
    ];
    
    // 데이터 저장
    const lastRow = sheet.getLastRow() + 1;
    const range = sheet.getRange(lastRow, 1, 1, newRow.length);
    range.setValues([newRow]);
    
    // 🎨 테두리 및 스타일 적용
    range.setBorder(true, true, true, true, true, true);
    
    // 헤더 스타일 확인 및 데이터 행 스타일 적용
    const headerRange = sheet.getRange(1, 1, 1, newRow.length);
    if (headerRange.getBackground() === '#ffffff') {
      // 헤더가 스타일되지 않은 경우 헤더 스타일링
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      headerRange.setBorder(true, true, true, true, true, true);
    }
    
    // 데이터 행 스타일링
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
    
    // 짝수/홀수 행 색상 구분
    if (lastRow % 2 === 0) {
      range.setBackground('#f8f9fa'); // 연한 회색
    } else {
      range.setBackground('#ffffff'); // 흰색
    }
    
    // 🎛️ 상태 열(AM열)에 드롭다운 적용
    const statusColumn = 38; // AM열 (38번째 열)
    const statusCell = sheet.getRange(lastRow, statusColumn, 1, 1);
    
    const statusOptions = [
      '견적 발행',
      '견적 진행중', 
      '견적 수정',
      '계약 성사',
      '계약 실패',
      '보류'
    ];
    
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(statusOptions)
      .setAllowInvalid(false)
      .setHelpText('상태를 선택하세요')
      .build();
    
    statusCell.setDataValidation(statusRule);
    console.log('✅ 견적서 저장 완료:', quotationData.quoteNumber);
    
    return createSafeResponse({
      success: true,
      message: '견적서가 성공적으로 저장되었습니다.',
      quoteNumber: quotationData.quoteNumber
    });
    
  } catch (error) {
    console.error('❌ 견적서 저장 실패:', error);
    return createSafeResponse({
      success: false,
      error: '견적서 저장 실패',
      details: error.toString()
    });
  }
}

// 🆕 인보이스 데이터 저장 함수 추가
function saveInvoiceData(data) {
  try {
    console.log('💾 인보이스 데이터 저장 시작:', data.invoiceNo);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAMES.INVOICE);
    
    // 시트가 없으면 생성
    if (!sheet) {
      console.log('📄 인보이스 시트 생성 중...');
      sheet = spreadsheet.insertSheet(SHEET_NAMES.INVOICE);
      setupInvoiceSheetHeaders(sheet);
    }
    
    // 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      setupInvoiceSheetHeaders(sheet);
    }
    
    // 새 행 데이터 준비 (구글 시트 구조에 맞게)
    const rowData = [
      data.timestamp || new Date().toISOString(),                    // A: Timestamp
      data.invoiceNo || '',                                          // B: Invoice No
      data.issueDate || '',                                          // C: Issue Date
      data.dueDate || '',                                            // D: Due Date
      data.customerCompany || '',                                    // E: Customer Company
      data.contactPerson || '',                                      // F: Contact Person
      data.phone || '',                                              // G: Phone
      data.email || '',                                              // H: Email
      data.projectName || '',                                        // I: Project Name
      data.status || '',                                             // J: Status
      // Item1 (K-O)
      data.item1Name || '',                                          // K: Item1 Name
      data.item1Spec || '',                                          // L: Item1 Spec
      data.item1Qty || '',                                           // M: Item1 Qty
      data.item1UnitPrice || 0,                                      // N: Item1 Unit Price
      data.item1Amount || 0,                                         // O: Item1 Amount
      // Item2 (P-T)
      data.item2Name || '',                                          // P: Item2 Name
      data.item2Spec || '',                                          // Q: Item2 Spec
      data.item2Qty || '',                                           // R: Item2 Qty
      data.item2UnitPrice || 0,                                      // S: Item2 Unit Price
      data.item2Amount || 0,                                         // T: Item2 Amount
      // Item3 (U-Y)
      data.item3Name || '',                                          // U: Item3 Name
      data.item3Spec || '',                                          // V: Item3 Spec
      data.item3Qty || '',                                           // W: Item3 Qty
      data.item3UnitPrice || 0,                                      // X: Item3 Unit Price
      data.item3Amount || 0,                                         // Y: Item3 Amount
      // Item4 (Z-AD)
      data.item4Name || '',                                          // Z: Item4 Name
      data.item4Spec || '',                                          // AA: Item4 Spec
      data.item4Qty || '',                                           // AB: Item4 Qty
      data.item4UnitPrice || 0,                                      // AC: Item4 Unit Price
      data.item4Amount || 0,                                         // AD: Item4 Amount
      // Amounts (AE-AJ)
      data.subtotal || 0,                                            // AE: Subtotal
      data.discount || 0,                                            // AF: Discount
      data.additionalService || 0,                                   // AG: Additional Service
      data.netAmount || 0,                                           // AH: Net Amount
      data.vat || 0,                                                 // AI: VAT
      data.totalAmount || 0                                          // AJ: Total Amount
    ];
    
    // 새 행 추가 및 스타일링
    const lastRow = sheet.getLastRow() + 1;
    const range = sheet.getRange(lastRow, 1, 1, rowData.length);
    range.setValues([rowData]);
    
    // 🎨 테두리 및 스타일 적용
    range.setBorder(true, true, true, true, true, true);
    
    // 헤더 스타일 확인 및 데이터 행 스타일 적용
    const headerRange = sheet.getRange(1, 1, 1, rowData.length);
    if (headerRange.getBackground() === '#ffffff') {
      // 헤더가 스타일되지 않은 경우 헤더 스타일링
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      headerRange.setBorder(true, true, true, true, true, true);
    }
    
    // 데이터 행 스타일링
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
    
    // 짝수/홀수 행 색상 구분
    if (lastRow % 2 === 0) {
      range.setBackground('#f8f9fa'); // 연한 회색
    } else {
      range.setBackground('#ffffff'); // 흰색
    }
    
    console.log('✅ 인보이스 저장 완료:', data.invoiceNo);
    
    return createSafeResponse({
      success: true,
      message: '인보이스가 성공적으로 저장되었습니다.',
      data: {
        invoiceNo: data.invoiceNo,
        timestamp: data.timestamp,
        rowNumber: sheet.getLastRow()
      }
    });
    
  } catch (error) {
    console.error('❌ 인보이스 저장 실패:', error);
    return createSafeResponse({
      success: false,
      error: '인보이스 저장 실패',
      details: error.toString()
    });
  }
}

// 🆕 인보이스 시트 헤더 설정 함수 추가
function setupInvoiceSheetHeaders(sheet) {
  const headers = [
    'Timestamp', 'Invoice No', 'Issue Date', 'Due Date', 'Customer Company',
    'Contact Person', 'Phone', 'Email', 'Project Name', 'Status',
    'Item1 Name', 'Item1 Spec', 'Item1 Qty', 'Item1 Unit Price', 'Item1 Amount',
    'Item2 Name', 'Item2 Spec', 'Item2 Qty', 'Item2 Unit Price', 'Item2 Amount',
    'Item3 Name', 'Item3 Spec', 'Item3 Qty', 'Item3 Unit Price', 'Item3 Amount',
    'Item4 Name', 'Item4 Spec', 'Item4 Qty', 'Item4 Unit Price', 'Item4 Amount',
    'Subtotal', 'Discount', 'Additional Service', 'Net Amount', 'VAT', 'Total Amount'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 🎨 헤더 스타일링 (견적서와 동일한 스타일)
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setBorder(true, true, true, true, true, true);
  
  // 열 너비 자동 조정
  sheet.autoResizeColumns(1, headers.length);
  
  console.log('✅ 인보이스 시트 헤더 설정 완료');
}

// 🆕 거래명세서 데이터 저장 함수 (항목 4개 구조로 새로 작성)
function saveDeliveryData(data) {
  try {
    console.log('📦 거래명세서 데이터 저장 시작:', data.docNumber);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAMES.DELIVERY);
    
    // 시트가 없으면 생성
    if (!sheet) {
      console.log('📄 거래명세서 시트 생성 중...');
      sheet = spreadsheet.insertSheet(SHEET_NAMES.DELIVERY);
      setupDeliverySheetHeaders(sheet);
    }
    
    // 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      setupDeliverySheetHeaders(sheet);
    }
    
    // 새 행 데이터 준비 (항목 4개 구조 - A부터 AW열까지 49개 열)
    const rowData = [
      // A-F: 기본 정보
      data.timestamp || new Date().toISOString(),           // A: 등록일시
      data.docNumber || '',                                 // B: 문서번호
      data.issueDate || '',                                 // C: 발행일자
      data.transactionDate || '',                           // D: 거래일자
      data.deliveryDate || '',                              // E: 납품일자
      (data.issueDate || '').substring(0, 7) || '',         // F: 년월 (YYYY-MM)
      
      // G-L: 고객 정보
      data.clientCompany || '',                             // G: 거래처
      data.clientContact || '',                             // H: 담당자
      data.clientPhone || '',                               // I: 연락처
      data.clientEmail || '',                               // J: 이메일
      generateItemSummary(data.items || []),                // K: 품목요약
      
      // L-P: 거래 조건
      data.paymentTerms || '',                              // L: 결제조건
      data.deliveryTerms || '',                             // M: 배송조건
      data.transactionStatus || '',                         // N: 거래상태
      data.specialNotes || '',                              // O: 특이사항
      
      // P-T: 항목1 (5개 필드)
      getItemField(data.items, 0, 'itemName'),              // P: 항목1_품목명
      getItemField(data.items, 0, 'specs'),                 // Q: 항목1_규격
      getItemField(data.items, 0, 'quantity'),              // R: 항목1_수량
      getItemField(data.items, 0, 'unit'),                  // S: 항목1_단위
      getItemField(data.items, 0, 'unitPrice'),             // T: 항목1_단가
      getItemField(data.items, 0, 'amount'),                // U: 항목1_금액
      
      // V-AA: 항목2 (5개 필드)
      getItemField(data.items, 1, 'itemName'),              // V: 항목2_품목명
      getItemField(data.items, 1, 'specs'),                 // W: 항목2_규격
      getItemField(data.items, 1, 'quantity'),              // X: 항목2_수량
      getItemField(data.items, 1, 'unit'),                  // Y: 항목2_단위
      getItemField(data.items, 1, 'unitPrice'),             // Z: 항목2_단가
      getItemField(data.items, 1, 'amount'),                // AA: 항목2_금액
      
      // AB-AG: 항목3 (5개 필드)
      getItemField(data.items, 2, 'itemName'),              // AB: 항목3_품목명
      getItemField(data.items, 2, 'specs'),                 // AC: 항목3_규격
      getItemField(data.items, 2, 'quantity'),              // AD: 항목3_수량
      getItemField(data.items, 2, 'unit'),                  // AE: 항목3_단위
      getItemField(data.items, 2, 'unitPrice'),             // AF: 항목3_단가
      getItemField(data.items, 2, 'amount'),                // AG: 항목3_금액
      
      // AH-AM: 항목4 (5개 필드)
      getItemField(data.items, 3, 'itemName'),              // AH: 항목4_품목명
      getItemField(data.items, 3, 'specs'),                 // AI: 항목4_규격
      getItemField(data.items, 3, 'quantity'),              // AJ: 항목4_수량
      getItemField(data.items, 3, 'unit'),                  // AK: 항목4_단위
      getItemField(data.items, 3, 'unitPrice'),             // AL: 항목4_단가
      getItemField(data.items, 3, 'amount'),                // AM: 항목4_금액
      
      // AN-AW: 금액 정보 (3개 열)
      parseFloat(data.subtotal) || 0,                       // AN: 소계
      parseFloat(data.vat) || 0,                           // AO: 부가세
      parseFloat(data.totalAmount) || 0                     // AP: 총금액
    ];
    
    // 새 행 추가 및 스타일링
    const lastRow = sheet.getLastRow() + 1;
    const range = sheet.getRange(lastRow, 1, 1, rowData.length);
    range.setValues([rowData]);
    
    // 🎨 테두리 및 스타일 적용
    range.setBorder(true, true, true, true, true, true);
    
    // 헤더 스타일 확인 및 데이터 행 스타일 적용
    const headerRange = sheet.getRange(1, 1, 1, rowData.length);
    if (headerRange.getBackground() === '#ffffff') {
      // 헤더가 스타일되지 않은 경우 헤더 스타일링
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      headerRange.setBorder(true, true, true, true, true, true);
    }
    
    // 데이터 행 스타일링
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
    
    // 짝수/홀수 행 색상 구분
    if (lastRow % 2 === 0) {
      range.setBackground('#f8f9fa'); // 연한 회색
    } else {
      range.setBackground('#ffffff'); // 흰색
    }
    
    console.log('✅ 거래명세서 저장 완료:', data.docNumber);
    
    return createSafeResponse({
      success: true,
      message: '거래명세서가 성공적으로 저장되었습니다.',
      data: {
        docNumber: data.docNumber,
        timestamp: data.timestamp,
        rowNumber: sheet.getLastRow(),
        totalColumns: rowData.length
      }
    });
    
  } catch (error) {
    console.error('❌ 거래명세서 저장 실패:', error);
    return createSafeResponse({
      success: false,
      error: '거래명세서 저장 실패',
      details: error.toString()
    });
  }
}

// 🆕 거래명세서 시트 헤더 설정 함수 (항목 4개 구조로 새로 작성)
function setupDeliverySheetHeaders(sheet) {
  // 49개 열 헤더 (A-AP)
  const headers = [
    // A-F: 기본 정보
    '등록일시', '문서번호', '발행일자', '거래일자', '납품일자', '년월',
    
    // G-O: 고객정보 및 거래조건
    '거래처', '담당자', '연락처', '이메일', '품목요약', '결제조건', '배송조건', '거래상태', '특이사항',
    
    // P-U: 항목1 (6개 필드)
    '항목1_품목명', '항목1_규격', '항목1_수량', '항목1_단위', '항목1_단가', '항목1_금액',
    
    // V-AA: 항목2 (6개 필드) 
    '항목2_품목명', '항목2_규격', '항목2_수량', '항목2_단위', '항목2_단가', '항목2_금액',
    
    // AB-AG: 항목3 (6개 필드)
    '항목3_품목명', '항목3_규격', '항목3_수량', '항목3_단위', '항목3_단가', '항목3_금액',
    
    // AH-AM: 항목4 (6개 필드)
    '항목4_품목명', '항목4_규격', '항목4_수량', '항목4_단위', '항목4_단가', '항목4_금액',
    
    // AN-AP: 금액 정보 (3개 열)
    '소계', '부가세', '총금액'
  ];
  
  // 헤더 설정
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // 헤더 스타일링
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setBorder(true, true, true, true, true, true);
  
  console.log('✅ 거래명세서 시트 헤더 설정 완료 (49개 열)');
}

// 🔧 헬퍼 함수들
function getItemField(items, index, field) {
  if (!items || !items[index]) return '';
  const value = items[index][field];
  if (field === 'quantity' || field === 'unitPrice' || field === 'amount') {
    return parseFloat(value) || 0;
  }
  return value || '';
}

function generateItemSummary(items) {
  if (!items || items.length === 0) return '';
  return items
    .filter(item => item && item.itemName)
    .map(item => item.itemName)
    .join(', ');
}

// 🔄 거래명세서 시트 구조 초기화 (간단한 버전)
function resetDeliverySheetStructure() {
  try {
    console.log('🔄 거래명세서 시트 구조 초기화 시작 (간단한 버전)');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 기존 시트 완전 삭제
    const existingSheet = spreadsheet.getSheetByName(SHEET_NAMES.DELIVERY);
    if (existingSheet) {
      console.log('🗑️ 기존 거래명세서 시트 삭제');
      spreadsheet.deleteSheet(existingSheet);
    }
    
    // 새로운 시트 생성
    console.log('🆕 새로운 거래명세서 시트 생성');
    const newSheet = spreadsheet.insertSheet(SHEET_NAMES.DELIVERY);
    
    // 49개 열로 제한 (A-AP)
    const currentColumns = newSheet.getMaxColumns();
    if (currentColumns > 49) {
      console.log(`📐 열 개수 조정: ${currentColumns}개 → 49개`);
      newSheet.deleteColumns(50, currentColumns - 49);
    }
    
    // 새로운 헤더 설정 (항목 4개 구조)
    setupDeliverySheetHeaders(newSheet);
    
    console.log('✅ 거래명세서 시트 구조 초기화 완료 (항목 4개)');
    
    return createSafeResponse({
      success: true,
      message: '거래명세서 시트가 완전히 새로 생성되었습니다 (항목 4개 구조)',
      data: {
        totalColumns: 49,
        structure: 'A-AP (49개 열)',
        items: '항목 4개',
        action: '기존 시트 삭제 후 새로 생성'
      }
    });
    
  } catch (error) {
    console.error('❌ 거래명세서 시트 초기화 실패:', error);
    return createSafeResponse({
      success: false,
      error: '거래명세서 시트 초기화 실패',
      details: error.toString()
    });
  }
}

// 📋 견적서 시트 드롭다운 및 유효성 검사 설정
function setupQuotationDropdowns() {
  try {
    console.log('📋 견적서 시트 드롭다운 설정 시작');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.QUOTATIONS);
    
    if (!sheet) {
      return createSafeResponse({
        success: false,
        error: `시트를 찾을 수 없습니다: ${SHEET_NAMES.QUOTATIONS}`
      });
    }
    
    // AM열 (상태) 드롭다운 설정
    const statusColumn = 38; // AM열 (38번째 열)
    const lastRow = sheet.getLastRow();
    
    if (lastRow > 1) { // 헤더 제외하고 데이터가 있는 경우
      const statusRange = sheet.getRange(2, statusColumn, lastRow - 1, 1);
      
      // 상태 드롭다운 옵션
      const statusOptions = [
        '견적 발행',
        '견적 진행중', 
        '견적 수정',
        '계약 성사',
        '계약 실패',
        '보류'
      ];
      
      // 데이터 유효성 검사 규칙 생성
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(statusOptions)
        .setAllowInvalid(false)
        .setHelpText('상태를 선택하세요: ' + statusOptions.join(', '))
        .build();
      
      // 드롭다운 적용
      statusRange.setDataValidation(rule);
      
      console.log(`✅ AM열 상태 드롭다운 설정 완료 (${lastRow - 1}개 행)`);
    }
    
    // 헤더 스타일 확인 및 적용
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    if (headerRange.getBackground() === '#ffffff') {
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      headerRange.setBorder(true, true, true, true, true, true);
      console.log('✅ 견적서 헤더 스타일 적용 완료');
    }
    
    return createSafeResponse({
      success: true,
      message: '견적서 시트 드롭다운 설정이 완료되었습니다.',
      data: {
        statusDropdowns: lastRow > 1 ? lastRow - 1 : 0,
        headerStyled: true
      }
    });
    
  } catch (error) {
    console.error('❌ 견적서 드롭다운 설정 실패:', error);
    return createSafeResponse({
      success: false,
      error: '견적서 드롭다운 설정 실패',
      details: error.toString()
    });
  }
}

