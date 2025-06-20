const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  // 변환할 HTML 파일 경로
  const htmlPath = path.resolve(__dirname, 'ibs_quotation_auto_calc_fixed.html');
  const outputPath = path.resolve(__dirname, '견적서.pdf');

  // HTML 파일을 읽어서 data URL로 변환
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dataUrl = 'data:text/html,' + encodeURIComponent(html);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // A4 크기(픽셀): 794 x 1123 (72dpi 기준)
  await page.setViewport({ width: 794, height: 1123 });

  // HTML 로드
  await page.goto(dataUrl, { waitUntil: 'networkidle0' });

  // PDF로 저장 (A4, 한 페이지에 맞춤)
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    scale: 1,
    preferCSSPageSize: true
  });

  await browser.close();
  console.log('PDF 저장 완료:', outputPath);
})(); 