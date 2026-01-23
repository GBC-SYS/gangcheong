/**
 * URL 유틸리티
 * 스플래시 등 공통 로직 관리
 */

const UrlUtils = (() => {
  // 스플래시 관련 상수
  const SPLASH_STORAGE_KEY = "splash_shown";

  /**
   * 스플래시가 이미 표시되었는지 확인 (localStorage)
   */
  const isSplashShown = () => {
    return localStorage.getItem(SPLASH_STORAGE_KEY) === "true";
  };

  /**
   * 스플래시 표시 완료 기록 (localStorage)
   */
  const markSplashShown = () => {
    localStorage.setItem(SPLASH_STORAGE_KEY, "true");
  };

  /**
   * 스플래시 기록 초기화 (테스트용)
   */
  const resetSplash = () => {
    localStorage.removeItem(SPLASH_STORAGE_KEY);
  };

  return {
    SPLASH_STORAGE_KEY,
    isSplashShown,
    markSplashShown,
    resetSplash,
  };
})();
