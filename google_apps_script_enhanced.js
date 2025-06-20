// 🎯 IBS 구글시트 통합 관리 시스템 (Enhanced Version)
// Analytics Widget 지원 + 통계 대시보드 + 자동화 기능

const SPREADSHEET_ID = '1MUHiU8a0p1aBs0wU94gmmlugwmB9qSYO8NLl-qZ9-ho';
const QUOTATION_SHEET = 'IBS_견적서_목록';
const INVOICE_SHEET = 'IBS_Invoice_List';
const TRANSACTION_SHEET = 'IBS_거래명세서_목록';
const STATS_SHEET = 'IBS_통계_대시보드';
const MONTHLY_SHEET = 'IBS_월별_요약';

// 🌐 웹앱 메인 핸들러 (GET/POST 요청 처리)
function doGet(e) {
  console.log('📥 GET 요청 수신:', e.parameter);
  
  const action = e.parameter.action;
  const type = e.parameter.type;
  
  try {
    if (action === 'getStats') {
      // Analytics Widget용 통계 데이터 제공
      const stats = getAnalyticsStats(type);
      return ContentService
        .createTextOutput(JSON.stringify(stats))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
    
    // 기본 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'IBS Analytics API is running',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ GET 요청 처리 오류:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  console.log('📥 POST 요청 수신');
  
  try {
    // postData 존재 여부 확인
    if (!e.postData || !e.postData.contents) {
      console.log('⚠️ POST 데이터가 없습니다. 테스트 모드일 수 있습니다.');
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'info',
          message: 'POST 데이터가 필요합니다.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    console.log('📋 수신 데이터:', data);
    
    let result;
    
    // 데이터 타입에 따른 처리
    switch (data.type) {
      case 'quotation':
        result = handleQuotationData(data);
        break;
      case 'invoice':
        result = handleInvoiceData(data);
        break;
      case 'transaction':
        result = handleTransactionData(data);
        break;
      default:
        throw new Error('알 수 없는 데이터 타입: ' + data.type);
    }
    
    // 통계 대시보드 자동 업데이트
    updateStatsDashboard();
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: '데이터가 성공적으로 저장되었습니다.',
        result: result
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ POST 요청 처리 오류:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 📊 Analytics Widget용 통계 데이터 제공
function getAnalyticsStats(type) {
  console.log('📊 통계 데이터 요청:', type);
  
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const today = new Date();
  const thisMonth = Utilities.formatDate(today, 'Asia/Seoul', 'yyyy-MM');
  
  try {
    switch (type) {
      case 'quotation':
        return getQuotationStats(spreadsheet, today, thisMonth);
      case 'invoice':
        return getInvoiceStats(spreadsheet, today, thisMonth);
      case 'transaction':
        return getTransactionStats(spreadsheet, today, thisMonth);
      default:
        return getOverallStats(spreadsheet, today, thisMonth);
    }
  } catch (error) {
    console.error('❌ 통계 데이터 생성 오류:', error);
    // 오류 시 기본 데이터 반환
    return {
      todayCount: 0,
      monthlyAmount: 0,
      avgAmount: 0,
      rate: 0,
      weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
      notifications: [
        { type: 'info', message: '통계 데이터를 불러오는 중입니다...' }
      ]
    };
  }
}

// 견적서 통계
function getQuotationStats(spreadsheet, today, thisMonth) {
  const sheet = spreadsheet.getSheetByName(QUOTATION_SHEET);
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).filter(row => row[1]); // 견적번호가 있는 행만
  
  // 오늘 견적서 수
  const todayQuotes = rows.filter(row => {
    const quoteDate = new Date(row[2]); // 견적일자
    return Utilities.formatDate(quoteDate, 'Asia/Seoul', 'yyyy-MM-dd') === 
           Utilities.formatDate(today, 'Asia/Seoul', 'yyyy-MM-dd');
  }).length;
  
  // 이번 달 견적액
  const monthlyQuotes = rows
    .filter(row => row[4] === thisMonth) // 년월 컬럼
    .reduce((sum, row) => sum + (parseFloat(row[32]) || 0), 0); // 총계약금액
  
  // 평균 견적금액
  const avgQuoteAmount = rows.length > 0 ? 
    rows.reduce((sum, row) => sum + (parseFloat(row[32]) || 0), 0) / rows.length : 0;
  
  // 견적 성사율 (상태가 '계약성사'인 비율)
  const successfulQuotes = rows.filter(row => row[33] === '계약성사').length;
  const conversionRate = rows.length > 0 ? (successfulQuotes / rows.length) * 100 : 0;
  
  // 주간 트렌드 (최근 7일)
  const weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = Utilities.formatDate(targetDate, 'Asia/Seoul', 'yyyy-MM-dd');
    
    const dayAmount = rows
      .filter(row => {
        const quoteDate = new Date(row[2]);
        return Utilities.formatDate(quoteDate, 'Asia/Seoul', 'yyyy-MM-dd') === dateStr;
      })
      .reduce((sum, row) => sum + (parseFloat(row[32]) || 0), 0);
    
    weeklyTrend.push(dayAmount);
  }
  
  // 알림 생성
  const notifications = [];
  
  // 유효기간 임박 견적서 체크
  const expiringSoon = rows.filter(row => {
    const quoteDate = new Date(row[2]);
    const validDays = parseInt(row[12]) || 30; // 납품기한을 유효기간으로 사용
    const expiryDate = new Date(quoteDate.getTime() + validDays * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (24 * 60 * 60 * 1000));
    return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
  });
  
  if (expiringSoon.length > 0) {
    notifications.push({
      type: 'warning',
      message: `${expiringSoon[0][1]} 견적서 유효기간 임박 (외 ${expiringSoon.length - 1}건)`
    });
  }
  
  // 목표 달성률
  const monthlyTarget = 10000000; // 월 목표 1천만원
  const achievementRate = (monthlyQuotes / monthlyTarget) * 100;
  notifications.push({
    type: 'info',
    message: `이번 달 목표 달성률: ${achievementRate.toFixed(1)}%`
  });
  
  return {
    todayQuotes,
    monthlyQuotes,
    avgQuoteAmount: Math.round(avgQuoteAmount),
    conversionRate: Math.round(conversionRate * 10) / 10,
    weeklyTrend,
    notifications
  };
}

// 인보이스 통계
function getInvoiceStats(spreadsheet, today, thisMonth) {
  const sheet = spreadsheet.getSheetByName(INVOICE_SHEET);
  if (!sheet) {
    return {
      todayInvoices: 0,
      monthlyRevenue: 0,
      avgInvoiceAmount: 0,
      paymentRate: 0,
      weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
      notifications: [{ type: 'info', message: '인보이스 시트를 찾을 수 없습니다.' }]
    };
  }
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).filter(row => row[1]); // 인보이스 번호가 있는 행만
  
  // 오늘 인보이스 수
  const todayInvoices = rows.filter(row => {
    const invoiceDate = new Date(row[2]); // 발행일자
    return Utilities.formatDate(invoiceDate, 'Asia/Seoul', 'yyyy-MM-dd') === 
           Utilities.formatDate(today, 'Asia/Seoul', 'yyyy-MM-dd');
  }).length;
  
  // 이번 달 매출
  const monthlyRevenue = rows
    .filter(row => {
      const invoiceDate = new Date(row[2]);
      return Utilities.formatDate(invoiceDate, 'Asia/Seoul', 'yyyy-MM') === thisMonth;
    })
    .reduce((sum, row) => sum + (parseFloat(row[20]) || 0), 0); // 총금액 컬럼 추정
  
  // 평균 인보이스 금액
  const avgInvoiceAmount = rows.length > 0 ? 
    rows.reduce((sum, row) => sum + (parseFloat(row[20]) || 0), 0) / rows.length : 0;
  
  // 결제율 (상태가 '결제완료'인 비율)
  const paidInvoices = rows.filter(row => row[21] === '결제완료').length; // 상태 컬럼 추정
  const paymentRate = rows.length > 0 ? (paidInvoices / rows.length) * 100 : 0;
  
  // 주간 트렌드
  const weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = Utilities.formatDate(targetDate, 'Asia/Seoul', 'yyyy-MM-dd');
    
    const dayAmount = rows
      .filter(row => {
        const invoiceDate = new Date(row[2]);
        return Utilities.formatDate(invoiceDate, 'Asia/Seoul', 'yyyy-MM-dd') === dateStr;
      })
      .reduce((sum, row) => sum + (parseFloat(row[20]) || 0), 0);
    
    weeklyTrend.push(dayAmount);
  }
  
  const notifications = [
    { type: 'info', message: `이번 달 인보이스 ${rows.length}건 발행` }
  ];
  
  return {
    todayInvoices,
    monthlyRevenue,
    avgInvoiceAmount: Math.round(avgInvoiceAmount),
    paymentRate: Math.round(paymentRate * 10) / 10,
    weeklyTrend,
    notifications
  };
}

// 거래명세서 통계
function getTransactionStats(spreadsheet, today, thisMonth) {
  const sheet = spreadsheet.getSheetByName(TRANSACTION_SHEET);
  if (!sheet) {
    return {
      todayTransactions: 0,
      monthlyTransactions: 0,
      avgTransactionAmount: 0,
      deliveryRate: 0,
      weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
      notifications: [{ type: 'info', message: '거래명세서 시트를 찾을 수 없습니다.' }]
    };
  }
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).filter(row => row[1]); // 문서번호가 있는 행만
  
  // 오늘 거래명세서 수
  const todayTransactions = rows.filter(row => {
    const transactionDate = new Date(row[2]); // 발행일자
    return Utilities.formatDate(transactionDate, 'Asia/Seoul', 'yyyy-MM-dd') === 
           Utilities.formatDate(today, 'Asia/Seoul', 'yyyy-MM-dd');
  }).length;
  
  // 이번 달 거래액
  const monthlyTransactions = rows
    .filter(row => {
      const transactionDate = new Date(row[2]);
      return Utilities.formatDate(transactionDate, 'Asia/Seoul', 'yyyy-MM') === thisMonth;
    })
    .reduce((sum, row) => sum + (parseFloat(row[15]) || 0), 0); // 총금액 컬럼 추정
  
  // 평균 거래금액
  const avgTransactionAmount = rows.length > 0 ? 
    rows.reduce((sum, row) => sum + (parseFloat(row[15]) || 0), 0) / rows.length : 0;
  
  // 배송 완료율
  const deliveredTransactions = rows.filter(row => row[10] === '배송완료').length; // 거래상태 컬럼 추정
  const deliveryRate = rows.length > 0 ? (deliveredTransactions / rows.length) * 100 : 0;
  
  // 주간 트렌드
  const weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = Utilities.formatDate(targetDate, 'Asia/Seoul', 'yyyy-MM-dd');
    
    const dayAmount = rows
      .filter(row => {
        const transactionDate = new Date(row[2]);
        return Utilities.formatDate(transactionDate, 'Asia/Seoul', 'yyyy-MM-dd') === dateStr;
      })
      .reduce((sum, row) => sum + (parseFloat(row[15]) || 0), 0);
    
    weeklyTrend.push(dayAmount);
  }
  
  const notifications = [
    { type: 'info', message: `오늘 배송 예정: ${rows.filter(row => row[10] === '배송예정').length}건` }
  ];
  
  return {
    todayTransactions,
    monthlyTransactions,
    avgTransactionAmount: Math.round(avgTransactionAmount),
    deliveryRate: Math.round(deliveryRate * 10) / 10,
    weeklyTrend,
    notifications
  };
}

// 🔄 기존 데이터 처리 함수들 (유지)
function handleQuotationData(data) {
  console.log('📝 견적서 데이터 처리 시작');
  
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(QUOTATION_SHEET);
  
  const row = [
    new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'}), // 접수일시
    data.quoteNumber || generateQuoteNumber(), // 견적번호
    data.quoteDate || new Date().toISOString().split('T')[0], // 견적일자
    data.yearMonth || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM'), // 년월
    data.projectName || '', // 프로젝트명
    data.customerCompany || '', // 고객업체
    data.customerRepresentative || '', // 담당자
    data.customerPhone || '', // 연락처
    data.customerEmail || '', // 이메일
    data.customerAddress || '', // 주소
    data.servicesSummary || '', // 서비스요약
    data.deliveryDeadline || '', // 납품기한
    data.paymentTerms || '', // 결제조건
    // 항목들 (최대 3개)
    data.items?.[0]?.name || '', data.items?.[0]?.specs || '', data.items?.[0]?.quantity || 0, data.items?.[0]?.unitPrice || 0, data.items?.[0]?.amount || 0,
    data.items?.[1]?.name || '', data.items?.[1]?.specs || '', data.items?.[1]?.quantity || 0, data.items?.[1]?.unitPrice || 0, data.items?.[1]?.amount || 0,
    data.items?.[2]?.name || '', data.items?.[2]?.specs || '', data.items?.[2]?.quantity || 0, data.items?.[2]?.unitPrice || 0, data.items?.[2]?.amount || 0,
    data.discountAmount || 0, // 할인금액
    data.additionalService || 0, // 추가서비스
    data.quoteAmount || 0, // 견적금액
    data.vat || 0, // 부가세
    data.totalAmount || 0, // 총계약금액
    data.status || '견적 발행' // 상태
  ];
  
  sheet.appendRow(row);
  console.log('✅ 견적서 데이터 저장 완료');
  
  return { message: '견적서가 성공적으로 저장되었습니다.', quoteNumber: row[1] };
}

function handleInvoiceData(data) {
  console.log('🧾 인보이스 데이터 처리 시작');
  
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(INVOICE_SHEET);
  
  const row = [
    new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'}), // 접수일시
    data.invoiceNumber || generateInvoiceNumber(), // 인보이스번호
    data.issueDate || new Date().toISOString().split('T')[0], // 발행일자
    data.dueDate || '', // 결제기한
    data.customerCompany || '', // 고객사
    data.customerRepresentative || '', // 담당자
    data.customerPhone || '', // 연락처
    data.customerEmail || '', // 이메일
    data.projectName || '', // 프로젝트명
    data.serviceDescription || '', // 서비스 설명
    // 항목들
    data.items?.[0]?.name || '', data.items?.[0]?.specs || '', data.items?.[0]?.quantity || 0, data.items?.[0]?.unitPrice || 0, data.items?.[0]?.amount || 0,
    data.items?.[1]?.name || '', data.items?.[1]?.specs || '', data.items?.[1]?.quantity || 0, data.items?.[1]?.unitPrice || 0, data.items?.[1]?.amount || 0,
    data.subtotal || 0, // 소계
    data.vat || 0, // 부가세
    data.totalAmount || 0, // 총금액
    data.status || '발행' // 상태
  ];
  
  sheet.appendRow(row);
  console.log('✅ 인보이스 데이터 저장 완료');
  
  return { message: '인보이스가 성공적으로 저장되었습니다.', invoiceNumber: row[1] };
}

function handleTransactionData(data) {
  console.log('📋 거래명세서 데이터 처리 시작');
  
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(TRANSACTION_SHEET);
  
  const row = [
    new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'}), // 접수일시
    data.docNumber || generateTransactionNumber(), // 문서번호
    data.issueDate || new Date().toISOString().split('T')[0], // 발행일자
    data.transactionDate || '', // 거래일자
    data.deliveryDate || '', // 납품일자
    data.clientCompany || '', // 거래처
    data.clientContact || '', // 담당자
    data.clientPhone || '', // 연락처
    data.clientEmail || '', // 이메일
    data.paymentTerms || '', // 결제조건
    data.deliveryTerms || '', // 배송조건
    data.transactionStatus || '', // 거래상태
    data.specialNotes || '', // 특이사항
    // 항목들
    data.items?.[0]?.itemName || '', data.items?.[0]?.specs || '', data.items?.[0]?.quantity || 0, data.items?.[0]?.unitPrice || 0, data.items?.[0]?.amount || 0,
    data.items?.[1]?.itemName || '', data.items?.[1]?.specs || '', data.items?.[1]?.quantity || 0, data.items?.[1]?.unitPrice || 0, data.items?.[1]?.amount || 0,
    data.subtotal || 0, // 소계
    data.vat || 0, // 부가세
    data.totalAmount || 0 // 총금액
  ];
  
  sheet.appendRow(row);
  console.log('✅ 거래명세서 데이터 저장 완료');
  
  return { message: '거래명세서가 성공적으로 저장되었습니다.', docNumber: row[1] };
}

// 📊 통계 대시보드 자동 업데이트
function updateStatsDashboard() {
  console.log('📊 통계 대시보드 업데이트 시작');
  
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const statsSheet = spreadsheet.getSheetByName(STATS_SHEET);
  
  if (!statsSheet) {
    console.log('통계 시트가 없어서 생성합니다.');
    spreadsheet.insertSheet(STATS_SHEET);
    return;
  }
  
  // 기존 내용 클리어
  statsSheet.clear();
  
  // 헤더 설정
  statsSheet.getRange('A1').setValue('📊 IBS 비즈니스 통계 대시보드');
  statsSheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  // 각 시트별 통계 수집
  const today = new Date();
  const thisMonth = Utilities.formatDate(today, 'Asia/Seoul', 'yyyy-MM');
  
  const quotationStats = getQuotationStats(spreadsheet, today, thisMonth);
  const invoiceStats = getInvoiceStats(spreadsheet, today, thisMonth);
  const transactionStats = getTransactionStats(spreadsheet, today, thisMonth);
  
  let currentRow = 3;
  
  // 종합 통계
  statsSheet.getRange(`A${currentRow}`).setValue('📈 종합 현황');
  statsSheet.getRange(`A${currentRow}`).setFontWeight('bold').setBackground('#e3f2fd');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('오늘 총 문서 수:');
  statsSheet.getRange(`B${currentRow}`).setValue((quotationStats.todayQuotes + invoiceStats.todayInvoices + transactionStats.todayTransactions) + '건');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('이번 달 총 매출:');
  const totalMonthlyAmount = quotationStats.monthlyQuotes + invoiceStats.monthlyRevenue + transactionStats.monthlyTransactions;
  statsSheet.getRange(`B${currentRow}`).setValue(totalMonthlyAmount.toLocaleString() + '원');
  currentRow += 2;
  
  // 견적서 통계
  statsSheet.getRange(`A${currentRow}`).setValue('📋 견적서 현황');
  statsSheet.getRange(`A${currentRow}`).setFontWeight('bold').setBackground('#e8f5e8');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('오늘 견적서:');
  statsSheet.getRange(`B${currentRow}`).setValue(quotationStats.todayQuotes + '건');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('이번 달 견적액:');
  statsSheet.getRange(`B${currentRow}`).setValue(quotationStats.monthlyQuotes.toLocaleString() + '원');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('견적 성사율:');
  statsSheet.getRange(`B${currentRow}`).setValue(quotationStats.conversionRate + '%');
  currentRow += 2;
  
  console.log('✅ 통계 대시보드 업데이트 완료');
}

// 🔢 자동 번호 생성 함수들
function generateQuoteNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `IBS-${year}${month}-${random}`;
}

function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `INV-${year}${month}-${random}`;
}

function generateTransactionNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `TR-${year}${month}-${random}`;
}

// 🔄 트리거 설정 (매일 자동 실행)
function createTriggers() {
  // 기존 트리거 삭제
  ScriptApp.getProjectTriggers().forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // 매일 오전 9시에 통계 업데이트
  ScriptApp.newTrigger('updateStatsDashboard')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  
  console.log('✅ 자동화 트리거 설정 완료');
}

// 🧪 테스트 함수
function testAnalyticsAPI() {
  console.log('🧪 Analytics API 테스트 시작');
  
  const quotationStats = getAnalyticsStats('quotation');
  console.log('견적서 통계:', quotationStats);
  
  const invoiceStats = getAnalyticsStats('invoice');
  console.log('인보이스 통계:', invoiceStats);
  
  const transactionStats = getAnalyticsStats('transaction');
  console.log('거래명세서 통계:', transactionStats);
  
  console.log('✅ Analytics API 테스트 완료');
}

// 🚀 수동 실행용 함수
function runAllUpdates() {
  updateStatsDashboard();
  createTriggers();
  console.log('�� 모든 업데이트 완료!');
} 