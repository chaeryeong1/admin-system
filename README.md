# 사업관리 시스템

이 프로젝트는 사업 정보, 기업 정보, 송금 정보 등을 관리하는 웹 기반 시스템입니다.

## 특징

- 사업 정보 관리: 사업명, 목표업체수, 사업기간, 주최기관, 공고 관리
- 기업 정보 관리: 기업명, 연락처, 담당자 정보 등 관리
- 송금 정보 관리: 계약금 수령 및 송금 정보 관리
- 빠른 응답 시간: Netlify Functions + JSON을 통한 최적화된 데이터 처리

## 설치 및 실행 방법

### 로컬 개발 환경

1. 프로젝트 클론:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Netlify CLI 설치:
```bash
npm install -g netlify-cli
```

3. 로컬 개발 서버 실행:
```bash
netlify dev
```

4. 브라우저에서 http://localhost:8888 접속

### 배포

1. Netlify 계정 연결:
```bash
netlify login
```

2. 프로젝트 초기화:
```bash
netlify init
```

3. 배포:
```bash
netlify deploy --prod
```

## 프로젝트 구조

```
프로젝트루트/
  ├── admin-system-html/     # 프론트엔드 파일
  │   ├── api.js             # API 연결 코드
  │   ├── business-management.html  # 사업 관리 페이지
  │   ├── company-management.html   # 기업 관리 페이지
  │   └── ... 기타 HTML/CSS/JS 파일
  ├── netlify/
  │   ├── functions/         # 서버리스 함수
  │   │   ├── get-projects.js     # 데이터 조회 함수
  │   │   ├── add-project.js      # 데이터 추가 함수
  │   │   ├── update-project.js   # 데이터 수정 함수
  │   │   └── delete-project.js   # 데이터 삭제 함수
  │   └── data/              # 데이터 저장소
  │       └── projects.json  # 프로젝트 데이터
  └── netlify.toml           # Netlify 설정 파일
```

## 사용 방법

1. 사업 관리: 
   - `/business-management.html` 페이지에서 사업 정보 관리
   - 사업 추가, 수정, 삭제 가능

2. 기업 관리:
   - `/company-management.html` 페이지에서 기업 정보 관리
   - 엑셀 파일 업로드/다운로드 기능

3. 송금 관리:
   - `/cashback-request.html` 페이지에서 송금 요청 관리
   - `/cashback-approval.html` 페이지에서 송금 승인 관리

## 기술 스택

- 프론트엔드: HTML, CSS (Tailwind), JavaScript
- 백엔드: Netlify Functions (서버리스)
- 데이터 저장: JSON 파일 (Netlify 서버에 저장)

## 개발자 정보

이 프로젝트는 성능 개선을 위해 구글 앱스크립트에서 Netlify Functions로 마이그레이션 되었습니다. 