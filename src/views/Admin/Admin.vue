  <div class="flex items-center space-x-4">
    <select 
      id="businessSelect" 
      class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      <option value="">전체 기업</option>
    </select>
    <input 
      type="text" 
      id="searchInput" 
      placeholder="검색어 입력" 
      class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
    <select id="itemsPerPage" class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
      <option value="10">10개</option>
      <option value="50">50개</option>
      <option value="100">100개</option>
    </select>
    <button 
      id="searchButton"
      class="btn search-btn flex-shrink-0 whitespace-nowrap min-w-[80px]"
    >
      <i class="fas fa-search mr-2"></i>조회
    </button>
  </div>
</div>

<!-- 페이지당 항목 선택 -->
<div class="flex justify-between items-center mb-4">
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-600">총 {{ totalItems }}개</span>
  </div> 