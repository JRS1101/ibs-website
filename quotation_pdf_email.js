// 🚀 I.B.S 견적서 PDF 생성 및 자동 메일 전송 시스템
// HTML → PDF 변환 + Gmail 자동 전송

// === 설정 ===
const SPREADSHEET_ID = '여기에_견적서_시트_ID_입력';
const DRIVE_FOLDER_ID = '여기에_PDF_저장할_드라이브_폴더_ID_입력'; // PDF 파일들이 저장될 폴더

// === 1. HTML 템플릿에서 PDF 생성 ===
function generateQuotePDF(quoteNumber) {
  try {
    Logger.log('📄 PDF 생성 시작:', quoteNumber);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName('견적서_목록');
    const templatesSheet = spreadsheet.getSheetByName('템플릿_설정');
    
    // 견적서 데이터 찾기
    const quoteData = findQuoteData(quotesSheet, quoteNumber);
    if (!quoteData) {
      throw new Error('견적서를 찾을 수 없습니다: ' + quoteNumber);
    }
    
    // 회사 정보 가져오기
    const companyInfo = getCompanyInfo(templatesSheet);
    
    // HTML 템플릿 생성
    const htmlContent = createQuoteHTML(quoteData, companyInfo);
    
    // HTML을 PDF로 변환
    const pdfBlob = Utilities.newBlob(htmlContent, 'text/html', 'temp.html')
      .getAs('application/pdf');
    
    // Drive에 PDF 저장
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const fileName = `${quoteNumber}_견적서.pdf`;
    const pdfFile = folder.createFile(pdfBlob.setName(fileName));
    
    // 공유 설정 (링크가 있는 모든 사용자가 볼 수 있도록)
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const pdfUrl = pdfFile.getUrl();
    
    // 시트에 PDF URL 업데이트
    updatePDFUrl(quotesSheet, quoteNumber, pdfUrl);
    
    Logger.log('✅ PDF 생성 완료:', fileName);
    Logger.log('🔗 PDF URL:', pdfUrl);
    
    return {
      success: true,
      fileName: fileName,
      pdfUrl: pdfUrl,
      fileId: pdfFile.getId()
    };
    
  } catch (error) {
    Logger.log('❌ PDF 생성 실패:', error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// 견적서 데이터 찾기
function findQuoteData(sheet, quoteNumber) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === quoteNumber) {
      return {
        row: i + 2,
        quoteNumber: data[i][0],
        status: data[i][1],
        createDate: data[i][2],
        customerName: data[i][3],
        customerContact: data[i][4],
        customerPhone: data[i][5],
        customerEmail: data[i][6],
        quoteDate: data[i][7],
        validUntil: data[i][8],
        item1_name: data[i][9],
        item1_spec: data[i][10],
        item1_qty: data[i][11],
        item1_price: data[i][12],
        item1_total: data[i][13],
        item2_name: data[i][14],
        item2_spec: data[i][15],
        item2_qty: data[i][16],
        item2_price: data[i][17],
        item2_total: data[i][18],
        item3_name: data[i][19],
        item3_spec: data[i][20],
        item3_qty: data[i][21],
        item3_price: data[i][22],
        item3_total: data[i][23],
        subtotal: data[i][24],
        tax: data[i][25],
        grandTotal: data[i][26],
        notes: data[i][27],
        pdfUrl: data[i][28],
        sentDate: data[i][29],
        approvedDate: data[i][30],
        memo: data[i][31]
      };
    }
  }
  
  return null;
}

// 회사 정보 가져오기
function getCompanyInfo(templatesSheet) {
  const data = templatesSheet.getRange(2, 1, 13, 2).getValues();
  
  const info = {};
  data.forEach(row => {
    const key = row[0];
    const value = row[1];
    
    switch(key) {
      case '회사명': info.companyName = value; break;
      case '사업자번호': info.businessNumber = value; break;
      case '대표자명': info.ceoName = value; break;
      case '연락처': info.phone = value; break;
      case '이메일': info.email = value; break;
      case '주소': info.address = value; break;
      case '홈페이지': info.website = value; break;
      case '기본_결제조건': info.paymentTerms = value; break;
      case '기본_납기': info.deliveryTime = value; break;
      case 'AS기간': info.warrantyPeriod = value; break;
    }
  });
  
  return info;
}

// HTML 템플릿 생성 (기존 템플릿을 동적으로 채우기)
function createQuoteHTML(quoteData, companyInfo) {
  // 날짜 포맷
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ko-KR');
  };
  
  // 숫자 포맷 (천단위 쉼표)
  const formatNumber = (num) => {
    if (!num || num === 0) return '';
    return num.toLocaleString();
  };
  
  // HTML 템플릿 (기존 템플릿 기반)
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>I.B.S 견적서 - ${quoteData.quoteNumber}</title>
    <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Malgun Gothic', Arial, sans-serif; margin: 0; padding: 0; line-height: 1.4; color: #333; background: white; }
        .container { width: 100%; max-width: 210mm; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; position: relative; overflow: hidden; }
        .header-content { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center; }
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .company-info h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .company-info .subtitle { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
        .quote-title { background: white; color: #1e3c72; padding: 8px 20px; border-radius: 25px; font-size: 18px; font-weight: bold; }
        .content { padding: 30px; }
        .client-info { background: #f8f9fa; border-left: 4px solid #1e3c72; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0; }
        .client-info h3 { margin: 0 0 15px 0; color: #1e3c72; font-size: 18px; }
        .client-row { display: flex; gap: 30px; margin-bottom: 10px; }
        .client-field { flex: 1; display: flex; align-items: center; gap: 10px; }
        .client-field label { font-weight: bold; color: #555; min-width: 80px; }
        .client-field .value { flex: 1; padding: 8px 0; border-bottom: 2px solid #ddd; }
        .items-section { margin: 30px 0; }
        .items-section h3 { color: #1e3c72; margin-bottom: 20px; font-size: 18px; }
        .items-table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .items-table th { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 15px 10px; text-align: center; font-weight: bold; }
        .items-table td { padding: 12px 10px; text-align: center; border-bottom: 1px solid #eee; background: white; }
        .items-table .spec-col { text-align: left; white-space: pre-line; }
        .total-section { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; padding: 20px; margin: 25px 0; border: 2px solid #1e3c72; }
        .total-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #ddd; }
        .total-row:last-child { border-bottom: none; font-size: 18px; font-weight: bold; color: #1e3c72; margin-top: 10px; padding-top: 15px; border-top: 2px solid #1e3c72; }
        .total-row label { font-weight: bold; }
        .total-row .value { text-align: right; font-size: 16px; font-weight: bold; color: #1e3c72; }
        .terms-section { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #1e3c72; }
        .terms-section h3 { color: #1e3c72; margin: 0 0 15px 0; }
        .terms-section ul { margin: 0; padding-left: 20px; line-height: 1.6; }
        .terms-section li { margin-bottom: 8px; color: #555; }
        .footer { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 25px; margin-top: 30px; }
        .footer-content { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .footer-section h4 { margin: 0 0 15px 0; font-size: 16px; color: #fff; }
        .footer-section p { margin: 5px 0; font-size: 14px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="logo-section">
                    <div class="company-info">
                        <h1>${companyInfo.companyName || 'InnoBridge SOLUTION'}</h1>
                        <p class="subtitle">반도체 PCB JIG 설계 전문 기업</p>
                    </div>
                </div>
                <div class="quote-title">견적서</div>
            </div>
        </div>
        
        <div class="content">
            <div class="client-info">
                <h3>👤 고객 정보</h3>
                <div class="client-row">
                    <div class="client-field">
                        <label>회사명:</label>
                        <div class="value">${quoteData.customerName || ''}</div>
                    </div>
                    <div class="client-field">
                        <label>담당자:</label>
                        <div class="value">${quoteData.customerContact || ''}</div>
                    </div>
                </div>
                <div class="client-row">
                    <div class="client-field">
                        <label>연락처:</label>
                        <div class="value">${quoteData.customerPhone || ''}</div>
                    </div>
                    <div class="client-field">
                        <label>이메일:</label>
                        <div class="value">${quoteData.customerEmail || ''}</div>
                    </div>
                </div>
                <div class="client-row">
                    <div class="client-field">
                        <label>견적일:</label>
                        <div class="value">${formatDate(quoteData.quoteDate)}</div>
                    </div>
                    <div class="client-field">
                        <label>견적번호:</label>
                        <div class="value">${quoteData.quoteNumber}</div>
                    </div>
                </div>
            </div>
            
            <div class="items-section">
                <h3>📋 견적 항목</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 5%">No.</th>
                            <th style="width: 35%">항목명</th>
                            <th style="width: 25%">사양/내용</th>
                            <th style="width: 8%">수량</th>
                            <th style="width: 12%">단가</th>
                            <th style="width: 15%">금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateItemRows(quoteData)}
                    </tbody>
                </table>
            </div>
            
            <div class="total-section">
                <div class="total-row">
                    <label>소계:</label>
                    <div class="value">${formatNumber(quoteData.subtotal)}원</div>
                </div>
                <div class="total-row">
                    <label>부가세 (10%):</label>
                    <div class="value">${formatNumber(quoteData.tax)}원</div>
                </div>
                <div class="total-row">
                    <label>총 금액:</label>
                    <div class="value">${formatNumber(quoteData.grandTotal)}원</div>
                </div>
            </div>
            
            <div class="terms-section">
                <h3>📄 견적 조건 및 특이사항</h3>
                <ul>
                    <li><strong>견적 유효기간:</strong> ${formatDate(quoteData.validUntil)}까지</li>
                    <li><strong>납기:</strong> ${companyInfo.deliveryTime || '계약 후 2~4주'}</li>
                    <li><strong>결제 조건:</strong> ${companyInfo.paymentTerms || '계약금 50%, 완료 후 잔금 50%'}</li>
                    <li><strong>포함 사항:</strong> 설계 도면, 기술 문서, 1회 수정</li>
                    <li><strong>A/S:</strong> 완료 후 ${companyInfo.warrantyPeriod || '3개월'} 무상 기술지원</li>
                    <li><strong>교육:</strong> 온라인/오프라인 선택 가능, 교육 자료 제공</li>
                    <li><strong>기타:</strong> 20년 경력 전문가 직접 설계 및 상담</li>
                    ${quoteData.notes ? '<li><strong>추가 사항:</strong> ' + quoteData.notes.replace(/\n/g, '<br>') + '</li>' : ''}
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>🏢 회사 정보</h4>
                    <p><strong>${companyInfo.companyName || 'I.B.S'}</strong></p>
                    <p>사업자등록번호: ${companyInfo.businessNumber || '405-08-53668'}</p>
                    <p>주소: ${companyInfo.address || '경기도 수원시 장안구 덕영대로 417번길 52-5 나동 502호'}</p>
                </div>
                <div class="footer-section">
                    <h4>📞 연락처</h4>
                    <p><strong>대표:</strong> ${companyInfo.ceoName || '이준로'}</p>
                    <p><strong>연락처:</strong> ${companyInfo.phone || '010-3664-6268'}</p>
                    <p><strong>이메일:</strong> ${companyInfo.email || 'jr.lee@ibs-info.com'}</p>
                    <p><strong>홈페이지:</strong> ${companyInfo.website || 'web.ibs-info.com'}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

  return html;
}

// 견적 항목 행 생성
function generateItemRows(quoteData) {
  let rows = '';
  
  const items = [
    {
      name: quoteData.item1_name,
      spec: quoteData.item1_spec,
      qty: quoteData.item1_qty,
      price: quoteData.item1_price,
      total: quoteData.item1_total
    },
    {
      name: quoteData.item2_name,
      spec: quoteData.item2_spec,
      qty: quoteData.item2_qty,
      price: quoteData.item2_price,
      total: quoteData.item2_total
    },
    {
      name: quoteData.item3_name,
      spec: quoteData.item3_spec,
      qty: quoteData.item3_qty,
      price: quoteData.item3_price,
      total: quoteData.item3_total
    }
  ];
  
  items.forEach((item, index) => {
    if (item.name && item.name.trim() !== '') {
      rows += `
        <tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td class="spec-col">${item.spec || ''}</td>
            <td>${item.qty || ''}</td>
            <td>${item.price ? item.price.toLocaleString() + '원' : ''}</td>
            <td>${item.total ? item.total.toLocaleString() + '원' : ''}</td>
        </tr>`;
    }
  });
  
  return rows;
}

// PDF URL 업데이트
function updatePDFUrl(sheet, quoteNumber, pdfUrl) {
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === quoteNumber) {
      sheet.getRange(i + 2, 29).setValue(pdfUrl); // AC열 (PDF_URL)
      break;
    }
  }
}

// === 2. 자동 메일 전송 ===
function sendQuoteByEmail(quoteNumber) {
  try {
    Logger.log('📧 메일 전송 시작:', quoteNumber);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName('견적서_목록');
    
    // 견적서 데이터 가져오기
    const quoteData = findQuoteData(quotesSheet, quoteNumber);
    if (!quoteData) {
      throw new Error('견적서를 찾을 수 없습니다: ' + quoteNumber);
    }
    
    if (!quoteData.customerEmail) {
      throw new Error('고객 이메일 주소가 없습니다');
    }
    
    // PDF가 없으면 먼저 생성
    if (!quoteData.pdfUrl) {
      Logger.log('📄 PDF가 없어서 먼저 생성...');
      const pdfResult = generateQuotePDF(quoteNumber);
      if (!pdfResult.success) {
        throw new Error('PDF 생성 실패: ' + pdfResult.error);
      }
      quoteData.pdfUrl = pdfResult.pdfUrl;
    }
    
    // PDF 파일 가져오기
    const fileId = extractFileIdFromUrl(quoteData.pdfUrl);
    const pdfFile = DriveApp.getFileById(fileId);
    
    // 메일 내용 작성
    const subject = `[I.B.S] 견적서 발송 - ${quoteData.quoteNumber}`;
    const body = createEmailBody(quoteData);
    
    // 메일 전송
    GmailApp.sendEmail(
      quoteData.customerEmail,
      subject,
      body,
      {
        attachments: [pdfFile.getBlob()],
        htmlBody: body,
        cc: 'jr.lee@ibs-info.com' // 대표에게 참조
      }
    );
    
    // 전송일 업데이트
    updateSentDate(quotesSheet, quoteNumber);
    
    // 상태를 '전송완료'로 변경
    updateQuoteStatus(quotesSheet, quoteNumber, '전송완료');
    
    Logger.log('✅ 메일 전송 완료:', quoteData.customerEmail);
    
    return {
      success: true,
      email: quoteData.customerEmail,
      subject: subject
    };
    
  } catch (error) {
    Logger.log('❌ 메일 전송 실패:', error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// URL에서 파일 ID 추출
function extractFileIdFromUrl(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// 이메일 본문 작성
function createEmailBody(quoteData) {
  return `
<div style="font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="margin: 0; font-size: 24px;">I.B.S 견적서 발송</h2>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">반도체 PCB JIG 설계 전문 기업</p>
  </div>
  
  <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #1e3c72; margin-top: 0;">안녕하세요, ${quoteData.customerName} ${quoteData.customerContact}님</h3>
    
    <p>I.B.S(InnoBridge SOLUTION)에서 요청해주신 견적서를 첨부파일로 보내드립니다.</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #1e3c72;">
      <p><strong>📋 견적 정보</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>견적번호:</strong> ${quoteData.quoteNumber}</li>
        <li><strong>견적일:</strong> ${new Date(quoteData.quoteDate).toLocaleDateString('ko-KR')}</li>
        <li><strong>유효기간:</strong> ${new Date(quoteData.validUntil).toLocaleDateString('ko-KR')}까지</li>
        <li><strong>총 금액:</strong> ${quoteData.grandTotal ? quoteData.grandTotal.toLocaleString() + '원' : ''}</li>
      </ul>
    </div>
    
    <p>첨부된 견적서를 검토해보시고, 궁금한 사항이 있으시면 언제든지 연락 주세요.</p>
    <p>20년 경력의 전문가가 직접 상담해드립니다.</p>
  </div>
  
  <div style="background: #e9ecef; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
    <p><strong>📞 연락처 정보</strong></p>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li><strong>대표:</strong> 이준로</li>
      <li><strong>연락처:</strong> 010-3664-6268</li>
      <li><strong>이메일:</strong> jr.lee@ibs-info.com</li>
      <li><strong>홈페이지:</strong> web.ibs-info.com</li>
    </ul>
  </div>
  
  <p style="color: #666; font-size: 14px;">
    ※ 본 견적서는 ${new Date(quoteData.validUntil).toLocaleDateString('ko-KR')}까지 유효합니다.<br>
    ※ 견적 내용에 대한 문의사항이 있으시면 언제든지 연락 주세요.
  </p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
    <p>InnoBridge SOLUTION | 사업자등록번호: 405-08-53668</p>
    <p>경기도 수원시 장안구 덕영대로 417번길 52-5 나동 502호</p>
  </div>
</div>`;
}

// 전송일 업데이트
function updateSentDate(sheet, quoteNumber) {
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === quoteNumber) {
      sheet.getRange(i + 2, 30).setValue(new Date()); // AD열 (전송일)
      break;
    }
  }
}

// 견적서 상태 업데이트
function updateQuoteStatus(sheet, quoteNumber, status) {
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === quoteNumber) {
      sheet.getRange(i + 2, 2).setValue(status); // B열 (상태)
      break;
    }
  }
}

// === 통합 함수: PDF 생성 + 메일 전송 ===
function generateAndSendQuote(quoteNumber) {
  try {
    Logger.log('🚀 견적서 PDF 생성 및 메일 전송 시작:', quoteNumber);
    
    // 1. PDF 생성
    const pdfResult = generateQuotePDF(quoteNumber);
    if (!pdfResult.success) {
      throw new Error('PDF 생성 실패: ' + pdfResult.error);
    }
    
    // 2. 메일 전송
    const emailResult = sendQuoteByEmail(quoteNumber);
    if (!emailResult.success) {
      throw new Error('메일 전송 실패: ' + emailResult.error);
    }
    
    Logger.log('✅ 견적서 PDF 생성 및 메일 전송 완료!');
    
    return {
      success: true,
      pdfUrl: pdfResult.pdfUrl,
      email: emailResult.email,
      message: '견적서 PDF 생성 및 메일 전송이 완료되었습니다.'
    };
    
  } catch (error) {
    Logger.log('❌ 견적서 처리 실패:', error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// === 테스트 함수 ===
function testPDFandEmail() {
  Logger.log('🧪 PDF 생성 및 메일 전송 테스트');
  
  // 기존 견적서 번호로 테스트 (실제 견적서 번호 입력 필요)
  const testQuoteNumber = 'IBS-Q-202506-001';
  
  const result = generateAndSendQuote(testQuoteNumber);
  Logger.log('📊 테스트 결과:', result);
} 