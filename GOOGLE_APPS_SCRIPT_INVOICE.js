/**
 * IBS 인보이스 시스템 - 구글 시트 연동 스크립트
 * 시트 URL: https://docs.google.com/spreadsheets/d/1MUHiU8a0p1aBs0wU94gmmlugwmB9qSYO8NLl-qZ9-ho/edit?gid=2014863605#gid=2014863605
 */

// 스프레드시트 ID와 시트명
const SPREADSHEET_ID = '1MUHiU8a0p1aBs0wU94gmmlugwmB9qSYO8NLl-qZ9-ho';
const INVOICE_SHEET_NAME = 'IBS_Invoice_List';

/**
 * 웹앱 엔트리 포인트 (POST 요청 처리)
 */
function doPost(e) {
  try {
    // CORS 헤더 설정
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // 요청 데이터 파싱
    const requestData = JSON.parse(e.postData.contents);
    console.log('📥 인보이스 저장 요청:', requestData);
    
    if (requestData.action === 'saveInvoice') {
      const result = saveInvoiceToSheet(requestData.data);
      return output.setContent(JSON.stringify({
        success: true,
        message: '인보이스가 성공적으로 저장되었습니다.',
        data: result
      }));
    }
    
    return output.setContent(JSON.stringify({
      success: false,
      message: '알 수 없는 액션입니다.'
    }));
    
  } catch (error) {
    console.error('❌ doPost 오류:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '서버 오류: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 인보이스 데이터를 구글 시트에 저장
 */
function saveInvoiceToSheet(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(INVOICE_SHEET_NAME);
    
    // 시트가 없으면 생성
    if (!sheet) {
      sheet = ss.insertSheet(INVOICE_SHEET_NAME);
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
    
    // 새 행 추가
    sheet.appendRow(rowData);
    
    console.log('✅ 인보이스 저장 완료:', data.invoiceNo);
    
    return {
      invoiceNo: data.invoiceNo,
      timestamp: data.timestamp,
      rowNumber: sheet.getLastRow()
    };
    
  } catch (error) {
    console.error('❌ saveInvoiceToSheet 오류:', error);
    throw error;
  }
}

/**
 * 인보이스 시트 헤더 설정
 */
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
  
  // 헤더 스타일링
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // 열 너비 자동 조정
  sheet.autoResizeColumns(1, headers.length);
  
  console.log('✅ 인보이스 시트 헤더 설정 완료');
}

/**
 * 테스트 함수 (수동 실행용)
 */
function testInvoiceSave() {
  const testData = {
    timestamp: new Date().toISOString(),
    invoiceNo: 'INV-TEST-001',
    issueDate: '2025-01-20',
    dueDate: '2025-02-20',
    customerCompany: 'Test Company',
    contactPerson: 'John Doe',
    phone: '010-1234-5678',
    email: 'test@example.com',
    projectName: 'Test Project',
    status: 'Test',
    item1Name: 'Software Training',
    item1Spec: 'CAM350 Training',
    item1Qty: '1',
    item1UnitPrice: 250000,
    item1Amount: 250000,
    subtotal: 250000,
    vat: 25000,
    totalAmount: 275000
  };
  
  const result = saveInvoiceToSheet(testData);
  console.log('테스트 결과:', result);
} 