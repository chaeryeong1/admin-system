# 사업관리 시스템

## 프로젝트 소개
이 프로젝트는 사업 관리, 기업 관리, 선정 확인, 계약금 수령, 캐시백 송금 등의 기능을 제공하는 관리자 시스템입니다.

## 주요 기능
- 사업 관리
- 기업 관리
- 사업 안내
- 신청 관리
- 선정 확인
- 계약금 수령
- 캐시백 송금

## 기술 스택
- HTML5
- CSS3 (Tailwind CSS)
- JavaScript
- Google Apps Script
- Google Sheets API
- Google Drive API

## 설치 및 실행 방법

### 로컬 개발 환경 설정
1. 저장소 클론
```bash
git clone [repository-url]
cd [project-directory]
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

### Netlify 배포 방법
1. Netlify CLI 설치
```bash
npm install -g netlify-cli
```

2. Netlify 로그인
```bash
netlify login
```

3. 프로젝트 배포
```bash
netlify deploy
```

4. 프로덕션 배포
```bash
netlify deploy --prod
```

## 환경 설정
1. Google Apps Script 프로젝트 설정
   - Google Apps Script 프로젝트 생성
   - 필요한 API 활성화 (Sheets API, Drive API)
   - 스크립트 배포 및 웹 앱 URL 설정

2. 환경 변수 설정
   - `.env` 파일 생성
   - 필요한 API 키 및 설정값 입력

## 배포 주소
- 프로덕션: [Netlify 배포 URL]
- 개발: [Netlify 개발 URL]

## 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다. 