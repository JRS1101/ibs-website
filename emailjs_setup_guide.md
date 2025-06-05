# I.B.S 웹사이트 이메일 전송 설정 가이드

## 📧 현재 상황
사용자가 문의 폼을 작성하여 전송할 때 **실제로 이메일이 전송되지 않는** 문제를 해결하기 위한 설정 가이드입니다.

## 🚀 해결 방법: EmailJS 서비스 사용

### 1단계: EmailJS 계정 생성
1. **[EmailJS 웹사이트](https://www.emailjs.com/)** 접속
2. **"Sign Up"** 클릭하여 계정 생성
3. 이메일 인증 완료

### 2단계: 이메일 서비스 연결
1. EmailJS 대시보드에서 **"Email Services"** 클릭
2. **"Add New Service"** 클릭
3. **Gmail** 선택 (추천) 또는 다른 이메일 서비스
4. `ibs@ibs-info.com` 계정으로 연결
5. 서비스 ID 확인 (예: `service_xxxxxx`)

### 3단계: 이메일 템플릿 생성
1. **"Email Templates"** 클릭
2. **"Create New Template"** 클릭
3. 다음 템플릿 사용:

```
Subject: [I.B.S 문의] {{company}} - {{from_name}}님 문의

From: {{from_name}} <{{from_email}}>
To: ibs@ibs-info.com

안녕하세요, I.B.S입니다.

웹사이트를 통해 새로운 문의가 접수되었습니다.

=== 문의자 정보 ===
• 이름: {{from_name}}
• 이메일: {{from_email}}
• 회사명: {{company}}

=== 문의내용 ===
{{message}}

---
이 메일은 I.B.S 웹사이트(web.ibs-info.com) 문의 폼에서 자동 발송되었습니다.
답변을 위해 {{from_email}}로 회신해 주세요.

감사합니다.
I.B.S (InnoBridge SOLUTION)
```

4. 템플릿 ID 확인 (예: `template_xxxxxx`)

### 4단계: 웹사이트 코드 업데이트
`script.js` 파일에서 다음 값들을 실제 값으로 변경:

```javascript
const EMAILJS_SERVICE_ID = 'service_xxxxxx';  // 2단계에서 확인한 서비스 ID
const EMAILJS_TEMPLATE_ID = 'template_xxxxxx'; // 3단계에서 확인한 템플릿 ID
const EMAILJS_PUBLIC_KEY = 'xxxxxxxxxxxxxx'; // 아래 5단계에서 확인할 Public Key
```

### 5단계: Public Key 확인
1. EmailJS 대시보드에서 **"Account"** → **"General"** 클릭
2. **"Public Key"** 복사
3. `script.js`의 `EMAILJS_PUBLIC_KEY`에 붙여넣기

## 🔧 설정 완료 후 테스트

### 테스트 방법:
1. 웹사이트의 문의 폼에 테스트 정보 입력
2. "문의 보내기" 버튼 클릭
3. "문의가 성공적으로 전송되었습니다!" 메시지 확인
4. `ibs@ibs-info.com`에서 이메일 수신 확인

## 💰 EmailJS 요금제

### 무료 플랜:
- **월 200건** 이메일 전송 가능
- 개인/소규모 비즈니스용으로 충분

### 유료 플랜:
- 월 $15부터 시작
- 더 많은 이메일 전송량 필요시

## 🛠️ 대안 방법들

### 1. Formspree (추천 대안)
```html
<form action="https://formspree.io/f/your-form-id" method="POST">
    <!-- 기존 폼 필드들 -->
</form>
```

### 2. Netlify Forms (Netlify 호스팅 시)
```html
<form netlify>
    <input type="hidden" name="form-name" value="contact">
    <!-- 기존 폼 필드들 -->
</form>
```

### 3. 현재 mailto 방식 (임시)
- 현재 구현된 방식
- 사용자의 기본 이메일 프로그램 실행
- 수동으로 전송 버튼 클릭 필요

## 📞 즉시 해결 방법

EmailJS 설정이 완료될 때까지는 **현재 구현된 방식**이 동작합니다:
1. 문의 폼 작성 후 전송
2. 사용자의 이메일 프로그램 자동 실행
3. 미리 작성된 이메일에서 **전송 버튼 클릭**
4. `ibs@ibs-info.com`으로 이메일 발송

## 🎯 추천 설정 순서

1. **즉시**: 현재 시스템으로 문의 접수 (mailto 방식)
2. **1-2일 내**: EmailJS 설정으로 자동 전송 구현
3. **필요시**: 더 고급 백엔드 서버 구축 고려

## ❓ 문의사항

설정 중 문제가 발생하면:
- **이준로 대표**: 010-3664-6268
- **강재모 이사**: 010-8436-7006
- **이메일**: ibs@ibs-info.com

---

**이 설정을 완료하면 웹사이트 방문자들이 문의 폼을 통해 직접 이메일을 전송할 수 있습니다!** 