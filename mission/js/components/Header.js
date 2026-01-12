/**
 * Header Component - 공통 헤더 (이름, 공유하기, 진행률)
 */
const Header = (() => {
  let elements = {};
  let onShareClick = null;

  /**
   * Render header HTML
   */
  const render = (container, { userName = "청년" } = {}) => {
    container.innerHTML = `
      <div class="header__top">
        <p class="header__greeting">
          안녕하세요, <span id="displayName">${userName}</span>님!
        </p>
      </div>
      <div class="header__progress">
        <span class="header__progress-text">
          <span id="completedCount">0</span>/<span id="totalCount">0</span> 완료
        </span>
        <div class="header__progress-bar">
          <div id="progressFill" class="header__progress-fill"></div>
        </div>
      </div>
    `;

    cacheElements(container);
    bindEvents();
  };

  /**
   * Cache DOM elements
   */
  const cacheElements = (container) => {
    elements.displayName = container.querySelector("#displayName");
    elements.shareBtn = container.querySelector("#shareBtn");
    elements.completedCount = container.querySelector("#completedCount");
    elements.totalCount = container.querySelector("#totalCount");
    elements.progressFill = container.querySelector("#progressFill");
  };

  /**
   * Bind events
   */
  const bindEvents = () => {
    if (elements.shareBtn && onShareClick) {
      elements.shareBtn.addEventListener("click", onShareClick);
    }
  };

  /**
   * Set share button click handler
   */
  const setOnShareClick = (handler) => {
    onShareClick = handler;
  };

  /**
   * Update user name
   */
  const setUserName = (name) => {
    if (elements.displayName) {
      elements.displayName.textContent = name;
    }
  };

  /**
   * Update progress
   */
  const updateProgress = ({ completed, total }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    if (elements.completedCount) {
      elements.completedCount.textContent = completed;
    }
    if (elements.totalCount) {
      elements.totalCount.textContent = total;
    }
    if (elements.progressFill) {
      elements.progressFill.style.width = `${percentage}%`;
    }
  };

  /**
   * Get elements (for external access if needed)
   */
  const getElements = () => elements;

  return {
    render,
    setOnShareClick,
    setUserName,
    updateProgress,
    getElements,
  };
})();
