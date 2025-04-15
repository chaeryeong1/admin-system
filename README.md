# 관리자 시스템 프로젝트

Google Sheets를 백엔드로 사용하는 관리자 시스템입니다.

## 주요 기능

- 사업 관리: 사업 추가, 수정, 삭제
- 기업 관리: 기업 정보 관리, 엑셀 다운로드
- 캐시백 송금: 송금 요청, 승인, 처리

## 기술 스택

- 프론트엔드: HTML, CSS (Tailwind CSS), JavaScript
- 백엔드: Netlify Functions
- 데이터 저장소: Google Sheets

## 설정 방법

### 1. Google Cloud 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. "Google Sheets API" 활성화
4. 서비스 계정 생성 (역할: Editor)
5. 서비스 계정 키(.json 파일) 생성

### 2. Google Sheet 설정

1. 새 Google 시트 생성
2. 첫 번째 시트(Sheet1)에 기업 데이터 컬럼 설정:
   - A1: Company Name
   - B1: Address
   - C1: Contact
   - D1: Email
3. 두 번째 시트(Projects)에 사업 데이터 컬럼 설정:
   - A1: Project Name
   - B1: Target Companies
   - C1: Start Date
   - D1: End Date
   - E1: Organization
4. 서비스 계정 이메일을 시트에 공유 (편집 권한)

### 3. 환경 변수 설정

1. `.env` 파일에 다음 정보 입력:
   ```
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
   GOOGLE_SHEET_ID="your-sheet-id"
   ```

2. Netlify 대시보드에서 환경 변수 설정:
   - Site settings > Environment variables에 위 값들 추가

## 배포 방법

```bash
npm install
netlify deploy --prod
``` 