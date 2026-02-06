/**
 * Bottom Navigation Component
 * 하단 네비게이션 컴포넌트
 * - 날짜 기반 활성화 기능 포함 (간증/설문)
 */

/**
 * 팩토리 함수: Bottom Navigation 생성
 * @param {Object} config - 설정 객체
 * @returns {Object} 네비게이션 메서드들
 */
const createBottomNav = (config = {}) => {
  // 현재 페이지 경로 확인
  const currentPath = window.location.pathname;
  const isSubPage = currentPath.includes("/page/");

  // 경로 prefix 설정
  const pagePrefix = isSubPage ? "" : "page/";

  // 현재 활성 탭 확인
  const getActiveTab = () => {
    if (currentPath.includes("timetable")) return "timetable";
    if (currentPath.includes("group")) return "group";
    return "stamp"; // 기본값 (index.html)
  };

  const activeTab = getActiveTab();

  // 날짜 체커 - DateChecker가 로드되었는지 확인
  const isFormsActivated = () => {
    if (typeof DateChecker !== "undefined" && DateChecker.formsChecker) {
      return DateChecker.formsChecker.isActivated();
    }
    // DateChecker가 없으면 기본적으로 비활성화
    return false;
  };

  const getActivationMessage = () => {
    if (typeof DateChecker !== "undefined" && DateChecker.formsChecker) {
      const dateStr = DateChecker.formsChecker.getActivationDateString();
      return `${dateStr}부터 이용 가능합니다`;
    }
    return "아직 이용할 수 없습니다";
  };

  // 네비게이션 아이템 정의
  const getNavItems = () => {
    const formsActivated = isFormsActivated();

    return [
      {
        id: "group",
        label: "조/방배정 확인",
        href: activeTab === "group" ? null : `${pagePrefix}group.html`,
        icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
      },
      {
        id: "timetable",
        label: "일정표",
        href: activeTab === "timetable" ? null : `${pagePrefix}timetable.html`,
        icon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
      },
      {
        id: "stamp",
        label: "도장판",
        href: isSubPage ? `${pagePrefix}stamp.html` : null,
        icon: `<circle cx="12" cy="12" r="10"></circle><path d="M9 12l2 2 4-4"></path>`,
      },
      {
        id: "forms",
        label: "간증&설문",
        href: formsActivated ? "https://forms.gle/sDBRoWLSemnMVx368" : null,
        external: formsActivated,
        disabled: !formsActivated,
        icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>`,
      },
    ];
  };

  // 토스트 메시지 표시
  const showToast = (message) => {
    const existingToast = document.querySelector(".toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  };

  // 네비게이션 HTML 생성
  const createNavHTML = () => {
    const navItems = getNavItems();

    const items = navItems
      .map((item) => {
        const isActive = item.id === activeTab;
        const activeClass = isActive ? " bottom-nav__btn--active" : "";
        const disabledClass = item.disabled ? " bottom-nav__btn--disabled" : "";

        // disabled 상태면 button (클릭 이벤트로 처리), 아니면 링크 또는 버튼
        const tag = item.disabled ? "button" : item.href ? "a" : "button";
        const hrefAttr =
          !item.disabled && item.href ? ` href="${item.href}"` : "";
        const targetAttr =
          !item.disabled && item.external
            ? ` target="_blank" rel="noopener noreferrer"`
            : "";
        // disabled 속성은 클릭 이벤트를 막으므로 사용하지 않음
        const dataDisabled = item.disabled ? ` data-disabled="true"` : "";

        return `
        <${tag}${hrefAttr}${targetAttr}${dataDisabled} class="bottom-nav__btn${activeClass}${disabledClass}" data-tab="${item.id}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2">
            ${item.icon}
          </svg>
          <span>${item.label}</span>
        </${tag}>
      `;
      })
      .join("");

    return `
      <nav class="bottom-nav">
        ${items}
      </nav>
    `;
  };

  // SVG 그라데이션 정의 HTML
  const createSvgDefs = () => {
    return `
      <svg width="0" height="0" style="position: absolute">
        <defs>
          <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e91e63" />
            <stop offset="50%" stop-color="#ff5722" />
            <stop offset="100%" stop-color="#ff9800" />
          </linearGradient>
        </defs>
      </svg>
    `;
  };

  // 이벤트 바인딩
  const bindEvents = (container) => {
    const formsBtn = container.querySelector('[data-tab="forms"]');
    if (formsBtn && formsBtn.dataset.disabled === "true") {
      formsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showToast(getActivationMessage());
      });
    }
  };

  // DOM에 삽입
  const render = () => {
    const container = document.getElementById("bottomNavContainer");
    if (container) {
      container.innerHTML = createSvgDefs() + createNavHTML();
      bindEvents(container);
    }
  };

  return {
    render,
    isFormsActivated,
    getActivationMessage,
  };
};

// 자동 초기화 (IIFE)
(function () {
  const init = () => {
    const bottomNav = createBottomNav();
    bottomNav.render();

    // 전역으로 인스턴스 노출 (필요시 사용)
    window.BottomNav = bottomNav;
  };

  // DOM 로드 후 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
