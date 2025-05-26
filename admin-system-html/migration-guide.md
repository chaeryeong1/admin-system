# 공통 스타일로 마이그레이션 가이드

이 가이드는 기존 HTML 파일을 공통 스타일을 사용하도록 마이그레이션하는 방법을 단계별로 설명합니다.

## 개요

1. 각 HTML 파일에서 내부 스타일을 제거하고 공통 CSS 파일을 링크합니다.
2. HTML 구조를 표준화합니다.
3. 클래스 이름을 일관되게 적용합니다.
4. 페이지별 고유 스타일만 내부 스타일로 유지합니다.

## 마이그레이션 단계

### 1단계: 공통 파일 확인

다음 파일들이 프로젝트에 존재하는지 확인하세요:

- `common-styles.css`: 공통 스타일시트
- `template.html`: HTML 기본 템플릿

### 2단계: 스타일 태그 변경

기존 HTML 파일의 `<head>` 섹션에서 `<style>` 태그를 수정합니다:

**변경 전:**
```html
<head>
  <!-- 다른 메타 태그 및 링크 -->
  <style>
    /* 많은 스타일 코드 */
  </style>
</head>
```

**변경 후:**
```html
<head>
  <!-- 다른 메타 태그 및 링크 -->
  <!-- 공통 스타일 -->
  <link rel="stylesheet" href="common-styles.css">
  
  <!-- 페이지별 고유 스타일만 유지 -->
  <style>
    /* 이 페이지에만 필요한 스타일 */
  </style>
</head>
```

### 3단계: HTML 구조 표준화

HTML 구조를 `template.html`의 구조와 일치시킵니다:

1. 상단 메뉴 구조
2. 모바일 메뉴
3. 사이드바
4. 메인 컨텐츠 영역
5. 모달(필요한 경우)

예시:
```html
<body class="min-h-screen bg-gray-50">
  <!-- 상단 대메뉴 -->
  <header class="main-header flex items-center justify-between">
    <!-- 헤더 내용 -->
  </header>
  
  <!-- 모바일 메뉴 -->
  <div class="mobile-menu hidden">
    <!-- 모바일 메뉴 내용 -->
  </div>

  <div class="flex main-layout">
    <!-- 좌측 소메뉴 -->
    <aside class="sidebar p-4">
      <!-- 사이드바 내용 -->
    </aside>

    <!-- 메인 콘텐츠 -->
    <div class="flex-1 p-6 space-y-6">
      <!-- 본문 내용 -->
    </div>
  </div>
  
  <!-- 필요한 모달 -->
</body>
```

### 4단계: 클래스 이름 표준화

다음 주요 요소들의 클래스 이름을 공통 규칙에 맞게 변경하세요:

1. **테이블 컨테이너**: `table-container` 클래스 사용
2. **버튼**: 적절한 버튼 클래스 사용 (`btn`, `btn-primary`, `btn-danger`, `edit-btn` 등)
3. **입력 필드**: `form-input` 클래스 사용
4. **페이지네이션**: `pagination-container`, `pagination-info`, `pagination-numbers` 등의 클래스 사용

### 5단계: 페이지네이션 구조 수정

페이지네이션 영역이 있는 경우 다음 구조로 변경하세요:

```html
<div class="pagination-container">
  <div class="pagination-info">
    총 <span class="font-medium">N</span>개 항목 중 <span class="font-medium">A</span>-<span class="font-medium">B</span>
  </div>
  <div>
    <nav class="flex items-center space-x-1" aria-label="Pagination">
      <button class="pagination-button" disabled>
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="pagination-numbers">
        X / Y
      </div>
      <button class="pagination-button" disabled>
        <i class="fas fa-chevron-right"></i>
      </button>
    </nav>
  </div>
</div>
```

### 6단계: 로딩 애니메이션 표준화

로딩 애니메이션이 필요한 경우 제공된 표준 애니메이션 중 하나를 사용하세요:

```html
<!-- 디스코드 스타일 로더 -->
<div class="discord-loader">
  <div></div><div></div><div></div>
</div>

<!-- 또는 낚시 로더 -->
<div class="fishing-loader">
  <div class="fishing-handle"></div>
  <div class="fishing-rod"></div>
  <div class="fishing-line"></div>
  <i class="fas fa-hook fishing-hook"></i>
  <i class="fas fa-fish fishing-fish"></i>
</div>

<!-- 또는 다른 로더 스타일 -->
```

### 7단계: 자바스크립트 확인

페이지별 고유한 JavaScript만 개별 파일에 유지하고, 공통 기능(예: 모바일 메뉴 토글, Flatpickr 초기화)은 공통 스크립트 영역에 있는지 확인하세요.

### 8단계: 테스트

마이그레이션 후 다음을 확인하세요:

1. 모든 페이지가 데스크톱, 태블릿, 모바일에서 올바르게 표시되는지
2. 모든 기능(버튼, 모달, 테이블 정렬 등)이 제대로 작동하는지
3. 스타일이 일관되게 적용되었는지

## 샘플 비교: business-management.html

### 변경 전
```html
<style>
  /* 많은 인라인 스타일 */
</style>
```

### 변경 후
```html
<link rel="stylesheet" href="common-styles.css">
<style>
  /* 이 페이지에만 필요한 특수 스타일 */
</style>
```

## 문제 해결

마이그레이션 중 발생할 수 있는 일반적인 문제:

1. **스타일 충돌**: 페이지별 스타일이 공통 스타일과 충돌하는 경우, 대부분 공통 스타일을 우선시하고 필요한 경우에만 덮어쓰기를 사용하세요.

2. **누락된 요소**: 마이그레이션 후 일부 요소가 스타일을 잃은 경우, 해당 요소에 적절한 클래스가 적용되었는지 확인하세요.

3. **JavaScript 이벤트 문제**: 클래스 이름 변경으로 인해 JS 선택자가 깨진 경우, JavaScript 코드도 업데이트하세요.

## 지원

문제가 발생하면 README.md 파일과 공통 스타일 가이드를 참조하거나 개발팀에 문의하세요. 