// 🎯 IBS 구글시트 대시보드 개선 스크립트
// 통계 분석, 차트 생성, 자동화 기능 추가

const SPREADSHEET_ID = '1MUHiU8a0p1aBs0wU94gmmlugwmB9qSYO8NLl-qZ9-ho';
const QUOTATION_SHEET = 'IBS_견적서_목록';
const STATS_SHEET = 'IBS_통계_대시보드';
const MONTHLY_SHEET = 'IBS_월별_요약';

// 1. 통계 대시보드 자동 업데이트 함수
function updateStatsDashboard() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const quotationSheet = spreadsheet.getSheetByName(QUOTATION_SHEET);
  const statsSheet = spreadsheet.getSheetByName(STATS_SHEET);
  
  // 기존 통계 시트 내용 클리어
  statsSheet.clear();
  
  // 헤더 설정
  statsSheet.getRange('A1').setValue('📊 IBS 비즈니스 통계 대시보드');
  statsSheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  // 견적서 데이터 가져오기
  const data = quotationSheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).filter(row => row[1]); // 견적번호가 있는 행만
  
  // 2. 기본 통계 계산
  const totalQuotes = rows.length;
  const totalAmount = rows.reduce((sum, row) => sum + (parseFloat(row[32]) || 0), 0); // 총계약금액 컬럼
  const avgAmount = totalAmount / totalQuotes;
  
  // 3. 월별 통계
  const monthlyStats = {};
  rows.forEach(row => {
    const month = row[4]; // 년월 컬럼
    if (month) {
      if (!monthlyStats[month]) {
        monthlyStats[month] = { count: 0, amount: 0 };
      }
      monthlyStats[month].count++;
      monthlyStats[month].amount += parseFloat(row[32]) || 0;
    }
  });
  
  // 4. 서비스별 통계
  const serviceStats = {};
  rows.forEach(row => {
    const service1 = row[14]; // 항목1_서비스명
    const service2 = row[18]; // 항목2_서비스명
    const amount1 = parseFloat(row[17]) || 0; // 항목1_금액
    const amount2 = parseFloat(row[21]) || 0; // 항목2_금액
    
    if (service1) {
      serviceStats[service1] = (serviceStats[service1] || 0) + amount1;
    }
    if (service2) {
      serviceStats[service2] = (serviceStats[service2] || 0) + amount2;
    }
  });
  
  // 5. 통계 데이터를 시트에 입력
  let currentRow = 3;
  
  // 기본 통계
  statsSheet.getRange(`A${currentRow}`).setValue('📈 기본 통계');
  statsSheet.getRange(`A${currentRow}`).setFontWeight('bold').setBackground('#e3f2fd');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('총 견적서 수:');
  statsSheet.getRange(`B${currentRow}`).setValue(totalQuotes + '건');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('총 견적 금액:');
  statsSheet.getRange(`B${currentRow}`).setValue(totalAmount.toLocaleString() + '원');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('평균 견적 금액:');
  statsSheet.getRange(`B${currentRow}`).setValue(Math.round(avgAmount).toLocaleString() + '원');
  currentRow += 2;
  
  // 월별 통계
  statsSheet.getRange(`A${currentRow}`).setValue('📅 월별 통계');
  statsSheet.getRange(`A${currentRow}`).setFontWeight('bold').setBackground('#e8f5e8');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('년월');
  statsSheet.getRange(`B${currentRow}`).setValue('견적 수');
  statsSheet.getRange(`C${currentRow}`).setValue('견적 금액');
  statsSheet.getRange(`A${currentRow}:C${currentRow}`).setFontWeight('bold');
  currentRow++;
  
  Object.entries(monthlyStats).forEach(([month, stats]) => {
    statsSheet.getRange(`A${currentRow}`).setValue(month);
    statsSheet.getRange(`B${currentRow}`).setValue(stats.count + '건');
    statsSheet.getRange(`C${currentRow}`).setValue(stats.amount.toLocaleString() + '원');
    currentRow++;
  });
  
  currentRow++;
  
  // 서비스별 통계
  statsSheet.getRange(`A${currentRow}`).setValue('🛠️ 서비스별 매출');
  statsSheet.getRange(`A${currentRow}`).setFontWeight('bold').setBackground('#fff3e0');
  currentRow++;
  
  statsSheet.getRange(`A${currentRow}`).setValue('서비스명');
  statsSheet.getRange(`B${currentRow}`).setValue('매출액');
  statsSheet.getRange(`C${currentRow}`).setValue('비중');
  statsSheet.getRange(`A${currentRow}:C${currentRow}`).setFontWeight('bold');
  currentRow++;
  
  const sortedServices = Object.entries(serviceStats).sort((a, b) => b[1] - a[1]);
  sortedServices.forEach(([service, amount]) => {
    const percentage = ((amount / totalAmount) * 100).toFixed(1);
    statsSheet.getRange(`A${currentRow}`).setValue(service);
    statsSheet.getRange(`B${currentRow}`).setValue(amount.toLocaleString() + '원');
    statsSheet.getRange(`C${currentRow}`).setValue(percentage + '%');
    currentRow++;
  });
  
  // 6. 차트 생성
  createCharts(statsSheet, monthlyStats, serviceStats);
  
  // 7. 조건부 서식 적용
  applyConditionalFormatting(quotationSheet);
  
  Logger.log('✅ 통계 대시보드 업데이트 완료');
}

// 차트 생성 함수
function createCharts(statsSheet, monthlyStats, serviceStats) {
  // 월별 매출 차트
  const monthlyData = Object.entries(monthlyStats);
  if (monthlyData.length > 0) {
    const chartRange = statsSheet.getRange(20, 1, monthlyData.length + 1, 2);
    chartRange.getCell(1, 1).setValue('월');
    chartRange.getCell(1, 2).setValue('매출액');
    
    monthlyData.forEach(([month, stats], index) => {
      chartRange.getCell(index + 2, 1).setValue(month);
      chartRange.getCell(index + 2, 2).setValue(stats.amount);
    });
    
    const chart = statsSheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(chartRange)
      .setPosition(20, 4, 0, 0)
      .setOption('title', '월별 매출 추이')
      .setOption('width', 400)
      .setOption('height', 300)
      .build();
    
    statsSheet.insertChart(chart);
  }
}

// 조건부 서식 적용 함수
function applyConditionalFormatting(quotationSheet) {
  const dataRange = quotationSheet.getDataRange();
  
  // 총계약금액 컬럼에 색상 적용 (높은 금액일수록 진한 녹색)
  const amountColumn = 33; // AM 컬럼 (총계약금액)
  const amountRange = quotationSheet.getRange(2, amountColumn, dataRange.getNumRows() - 1, 1);
  
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .setGradientMaxpoint('#4caf50')
    .setGradientMidpoint('#ffeb3b')
    .setGradientMinpoint('#f44336')
    .setRanges([amountRange])
    .build();
  
  const rules = quotationSheet.getConditionalFormatRules();
  rules.push(rule);
  quotationSheet.setConditionalFormatRules(rules);
}

// 자동 견적번호 생성 함수
function generateQuoteNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const quotationSheet = spreadsheet.getSheetByName(QUOTATION_SHEET);
  
  // 현재 월의 마지막 견적번호 찾기
  const data = quotationSheet.getDataRange().getValues();
  const currentMonthPrefix = `IBS-${year}${month}`;
  
  let maxNumber = 0;
  data.forEach(row => {
    const quoteNumber = row[1]; // 견적번호 컬럼
    if (quoteNumber && quoteNumber.startsWith(currentMonthPrefix)) {
      const number = parseInt(quoteNumber.split('-')[2]) || 0;
      maxNumber = Math.max(maxNumber, number);
    }
  });
  
  const nextNumber = String(maxNumber + 1).padStart(3, '0');
  return `IBS-${year}${month}-${nextNumber}`;
}

// 알림 기능 - 견적 유효기간 체크
function checkQuoteExpiry() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const quotationSheet = spreadsheet.getSheetByName(QUOTATION_SHEET);
  
  const data = quotationSheet.getDataRange().getValues();
  const today = new Date();
  const expiringSoon = [];
  
  data.slice(1).forEach((row, index) => {
    const quoteNumber = row[1];
    const quoteDate = new Date(row[2]);
    const validDays = parseInt(row[12]) || 30; // 유효기간 (기본 30일)
    const expiryDate = new Date(quoteDate.getTime() + validDays * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (24 * 60 * 60 * 1000));
    
    if (daysUntilExpiry <= 3 && daysUntilExpiry >= 0) {
      expiringSoon.push({
        quoteNumber,
        daysUntilExpiry,
        customerCompany: row[6]
      });
    }
  });
  
  if (expiringSoon.length > 0) {
    const message = expiringSoon.map(quote => 
      `${quote.quoteNumber} (${quote.customerCompany}) - ${quote.daysUntilExpiry}일 남음`
    ).join('\n');
    
    // 이메일 알림 (실제 사용시 이메일 주소 설정 필요)
    // MailApp.sendEmail('your-email@example.com', '견적서 유효기간 알림', message);
    
    Logger.log('⚠️ 유효기간 임박 견적서:\n' + message);
  }
}

// 트리거 설정 함수 (매일 실행)
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
  
  // 매일 오전 8시에 유효기간 체크
  ScriptApp.newTrigger('checkQuoteExpiry')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  
  Logger.log('✅ 자동화 트리거 설정 완료');
}

// 수동 실행용 함수
function runAllUpdates() {
  updateStatsDashboard();
  checkQuoteExpiry();
  Logger.log('�� 모든 업데이트 완료!');
} 