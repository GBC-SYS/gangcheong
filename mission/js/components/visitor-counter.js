/**
 * Visitor Counter Component
 * 가상 접속자 수 표시 컴포넌트
 * - 1~200명 사이 랜덤 숫자 표시
 * - 주기적으로 +/- 1~5명 변동
 */

const VisitorCounter = (() => {
  // 설정
  const CONFIG = {
    MIN_COUNT: 1,
    MAX_COUNT: 200,
    UPDATE_INTERVAL: 5000, // 5초
    MIN_CHANGE: 1,
    MAX_CHANGE: 5,
    STORAGE_KEY: "visitor_count",
  };

  let currentCount = 0;
  let intervalId = null;

  /**
   * 초기 접속자 수 가져오기
   * sessionStorage로 페이지 이동 시 숫자 유지
   */
  const getInitialCount = () => {
    const saved = sessionStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved) {
      return parseInt(saved, 10);
    }
    // 80~150 사이 랜덤 시작
    const initial = Math.floor(Math.random() * 71) + 80;
    sessionStorage.setItem(CONFIG.STORAGE_KEY, initial.toString());
    return initial;
  };

  /**
   * 접속자 수 업데이트 (+/- 1~5명)
   */
  const updateCount = () => {
    const change =
      Math.floor(Math.random() * CONFIG.MAX_CHANGE) + CONFIG.MIN_CHANGE;
    const direction = Math.random() > 0.5 ? 1 : -1;

    currentCount += change * direction;

    // 범위 제한
    if (currentCount < CONFIG.MIN_COUNT) {
      currentCount = CONFIG.MIN_COUNT + Math.floor(Math.random() * 10) + 1;
    }
    if (currentCount > CONFIG.MAX_COUNT) {
      currentCount = CONFIG.MAX_COUNT - Math.floor(Math.random() * 10) - 1;
    }

    sessionStorage.setItem(CONFIG.STORAGE_KEY, currentCount.toString());
    renderCount();
  };

  /**
   * DOM 컨테이너 생성
   */
  const createContainer = () => {
    if (document.getElementById("visitorCounter")) {
      return;
    }

    const html = `
      <div id="visitorCounter" class="visitor-counter">
        <span id="visitorCountNum" class="visitor-counter__count">${currentCount}</span>
        <span class="visitor-counter__label">명이 보고 있습니다.</span>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
  };

  /**
   * 숫자 렌더링
   */
  const renderCount = () => {
    const el = document.getElementById("visitorCountNum");
    if (!el) return;
    el.textContent = currentCount;
  };

  /**
   * 인터벌 시작
   */
  const startInterval = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(updateCount, CONFIG.UPDATE_INTERVAL);
  };

  /**
   * 인터벌 중지
   */
  const stopInterval = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  /**
   * 컴포넌트 초기화
   */
  const init = () => {
    currentCount = getInitialCount();
    createContainer();
    renderCount();
    startInterval();

    // 탭 비활성화 시 인터벌 중지 (성능 최적화)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopInterval();
      } else {
        startInterval();
      }
    });
  };

  return { init };
})();

// 자동 초기화
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => VisitorCounter.init());
  } else {
    VisitorCounter.init();
  }
})();
