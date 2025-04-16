# 관리자 시스템

이 프로젝트는 HTML, CSS, JavaScript로 구현된 관리자 시스템입니다. 별도의 Node.js나 npm 설치 없이도 바로 실행할 수 있습니다.

## 시작하기

1. `index.html` 파일을 웹 브라우저로 열어 시스템을 시작합니다.

## 주요 기능

### 1. 사업 관리
- 사업 목록 조회
- 사업 추가, 수정, 삭제
- 사업명 검색

### 2. 기업 관리
- 기업 목록 조회 및 필터링
- 기업 정보 수정, 삭제
- 엑셀 다운로드/업로드 기능

### 3. 캐시백 송금
- 계약금수령기업 관리
- 송금 요청 처리
- 다양한 상태별 필터링 (미지급, 지급예정, 지급완료)

## 파일 구조

- `index.html` - 메인 페이지
- `business-management.html` - 사업 관리 페이지
- `company-management.html` - 기업 관리 페이지
- `cashback-management.html` - 캐시백 송금 페이지

## 참고사항

- 현재 버전은 프론트엔드만 구현되어 있으며, 데이터는 브라우저의 JavaScript 메모리에만 저장됩니다.
- 페이지를 새로고침하면 변경된 데이터가
모두 초기화됩니다.
- 실제 서비스 사용을 위해서는 백엔드 API와 연동이 필요합니다.

## 기술 스택

- HTML5
- CSS (Tailwind CSS)
- JavaScript (Vanilla)

# 관리자 시스템 스타일 가이드

이 프로젝트는 관리자 시스템의 모든 페이지에 일관된 디자인과 사용자 경험을 제공하기 위한 공통 스타일과 템플릿을 포함하고 있습니다.

## 목차

1. [파일 구조](#파일-구조)
2. [스타일 가이드](#스타일-가이드)
3. [새 페이지 생성하기](#새-페이지-생성하기)
4. [공통 컴포넌트](#공통-컴포넌트)
5. [반응형 디자인](#반응형-디자인)

## 파일 구조

```
admin-system-html/
├── common-styles.css    # 공통 스타일 (모든 페이지에서 사용)
├── template.html        # 기본 HTML 템플릿
├── business-management.html
├── company-management.html
├── business-notification.html
├── cashback-management.html
└── README.md            # 이 문서
```

## 스타일 가이드

### 공통 스타일 적용 방법

모든 HTML 파일에는 다음과 같이 공통 스타일을 포함해야 합니다:

```html
<head>
  <!-- 다른 메타 태그 및 링크 -->
  <link rel="stylesheet" href="common-styles.css">
  
  <!-- 페이지별 추가 스타일 -->
  <style>
    /* 페이지별 추가 스타일을 여기에 작성 */
  </style>
</head>
```

### 주요 색상

- 주 색상: `#4285F4` (Google Blue)
- 보조 색상: `#E8F0FE` (연한 파란색 배경)
- 중립 색상: `#4B5563` (텍스트), `#e2e8f0` (경계선)
- 경고/오류 색상: `#FF0000` (빨간색)

### 폰트 크기

- 기본 텍스트: `14px`
- 테이블 셀: `0.875rem`
- 테이블 헤더: `0.8rem`
- 버튼 텍스트: `0.875rem`
- 작은 버튼 텍스트: `0.8rem`
- 페이지 제목: `1.5rem` (text-2xl)

## 새 페이지 생성하기

새 페이지를 만들려면:

1. `template.html` 파일을 복사하여 새 HTML 파일을 생성합니다.
2. 페이지 제목, 메뉴 활성화 상태, 사이드바 제목을 업데이트합니다.
3. 메인 콘텐츠 영역에 페이지별 내용을 추가합니다.
4. 필요한 경우 페이지별 스타일과 스크립트를 추가합니다.

예시:
```html
<title>관리자 시스템 - 기업 관리</title>
<!-- 메뉴 활성화 -->
<a href="business-management.html">사업 관리</a>
<a href="company-management.html" class="active">기업 관리</a>
<!-- 사이드바 제목 -->
<h2 class="text-lg font-semibold mb-4 text-gray-800">기업 관리</h2>
```

## 공통 컴포넌트

### 버튼 스타일

```html
<!-- 기본 버튼 -->
<button class="btn btn-primary">기본 버튼</button>

<!-- 위험 버튼 -->
<button class="btn btn-danger">삭제</button>

<!-- 작은 버튼 -->
<button class="btn btn-sm">작은 버튼</button>

<!-- 수정 버튼 -->
<button class="edit-btn">
  <i class="fas fa-edit mr-1"></i>수정
</button>

<!-- 검색 버튼 -->
<button class="btn search-btn">
  <i class="fas fa-search mr-2"></i>검색
</button>

<!-- btn-two 스타일 버튼 -->
<button class="btn-two navy">네이비 버튼</button>
<button class="btn-two gray">그레이 버튼</button>
<button class="btn-two white">화이트 버튼</button>
<button class="btn-two mini">미니 버튼</button>
```

### 테이블 스타일

```html
<div class="table-container">
  <div class="p-4">
    <table class="min-w-full">
      <thead>
        <tr>
          <th>헤더 1</th>
          <th>헤더 2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>내용 1</td>
          <td>내용 2</td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- 페이지네이션 -->
  <div class="pagination-container">
    <!-- 페이지네이션 내용 -->
  </div>
</div>
```

### 로딩 애니메이션

```html
<!-- 디스코드 스타일 로더 -->
<div class="discord-loader">
  <div></div>
  <div></div>
  <div></div>
</div>

<!-- 낚시 로더 -->
<div class="fishing-loader">
  <div class="fishing-handle"></div>
  <div class="fishing-rod"></div>
  <div class="fishing-line"></div>
  <i class="fas fa-hook fishing-hook"></i>
  <i class="fas fa-fish fishing-fish"></i>
</div>

<!-- 로켓 로더 -->
<i class="fas fa-rocket fa-lg rocket-loader"></i>

<!-- 마법 로더 -->
<i class="fas fa-magic fa-lg magic-loader"></i>
```

### 모달

```html
<div id="myModal" class="hidden fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
  <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
    <h2 class="text-lg font-semibold mb-4">모달 제목</h2>
    <div class="space-y-4">
      <!-- 모달 내용 -->
    </div>
    <div class="flex justify-end space-x-2 mt-6">
      <button id="cancelButton" class="btn bg-gray-200 hover:bg-gray-300">취소</button>
      <button id="confirmButton" class="btn btn-primary">확인</button>
    </div>
  </div>
</div>
```

## 반응형 디자인

이 스타일시트는 다음 브레이크포인트에 대한 반응형 디자인을 지원합니다:

- 데스크톱: `1024px` 이상
- 태블릿: `768px` ~ `1023px`
- 모바일: `767px` 이하 (특히 `640px` 이하에서 특수 처리)

모바일 환경에서는:
- 사이드바가 상단에 위치합니다
- 테이블은 가로 스크롤이 가능합니다
- 검색 영역이 최적화됩니다
- 모바일 메뉴가 표시됩니다

항상 모든 화면 크기에서 페이지를 테스트하여 가독성과 사용성을 확인하세요. 