/**
 * Bottom Navigation Component
 * 하단 네비게이션 컴포넌트
 */

(function () {
  // 현재 페이지 경로 확인
  const currentPath = window.location.pathname;
  const isSubPage = currentPath.includes("/page/");

  // 경로 prefix 설정
  const pagePrefix = isSubPage ? "" : "page/";

  // 현재 활성 탭 확인
  const getActiveTab = () => {
    if (currentPath.includes("timetable")) return "timetable";
    if (currentPath.includes("testimony")) return "testimony";
    if (currentPath.includes("survey")) return "survey";
    return "stamp"; // 기본값 (index.html)
  };

  const activeTab = getActiveTab();

  // 네비게이션 아이템 정의
  const navItems = [
    {
      id: "stamp",
      label: "도장판",
      href: isSubPage ? "../index.html" : null,
      icon: `<circle cx="12" cy="12" r="10"></circle><path d="M9 12l2 2 4-4"></path>`,
    },
    {
      id: "timetable",
      label: "타임테이블",
      href: activeTab === "timetable" ? null : `${pagePrefix}timetable.html`,
      icon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
    },
    {
      id: "testimony",
      label: "간증문",
      href: "https://forms.google.com/",
      external: true,
      icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>`,
    },
    {
      id: "survey",
      label: "설문",
      href: "https://forms.google.com/",
      external: true,
      icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>`,
    },
  ];

  // 네비게이션 HTML 생성
  const createNavHTML = () => {
    const items = navItems
      .map((item) => {
        const isActive = item.id === activeTab;
        const activeClass = isActive ? " bottom-nav__btn--active" : "";
        const tag = item.href ? "a" : "button";
        const hrefAttr = item.href ? ` href="${item.href}"` : "";
        const targetAttr = item.external ? ` target="_blank" rel="noopener noreferrer"` : "";

        return `
        <${tag}${hrefAttr}${targetAttr} class="bottom-nav__btn${activeClass}" data-tab="${item.id}">
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

  // DOM에 삽입
  const init = () => {
    const container = document.getElementById("bottomNavContainer");
    if (container) {
      container.innerHTML = createSvgDefs() + createNavHTML();
    }
  };

  // DOM 로드 후 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
