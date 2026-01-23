/**
 * URL 유틸리티
 * 스플래시 파라미터 등 URL 관련 공통 로직 관리
 */

const UrlUtils = (() => {
  // 스플래시 관련 상수
  const SPLASH_PARAM = {
    key: "intro",
    value: "done",
  };

  /**
   * 스플래시가 이미 표시되었는지 확인
   */
  const isSplashShown = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(SPLASH_PARAM.key) === SPLASH_PARAM.value;
  };

  /**
   * URL에 스플래시 완료 파라미터 추가
   */
  const markSplashShown = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set(SPLASH_PARAM.key, SPLASH_PARAM.value);
    window.history.replaceState({}, "", newUrl);
  };

  /**
   * 스플래시 파라미터가 포함된 URL 생성
   * @param {string} baseUrl - 기본 URL
   * @returns {string} 스플래시 파라미터가 포함된 URL
   */
  const withSplashParam = (baseUrl) => {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set(SPLASH_PARAM.key, SPLASH_PARAM.value);
    return url.pathname + url.search;
  };

  /**
   * 현재 URL의 쿼리 파라미터를 유지하면서 새 경로 생성
   * @param {string} path - 새 경로
   * @returns {string} 쿼리 파라미터가 포함된 경로
   */
  const preserveParams = (path) => {
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.toString()) {
      return `${path}?${currentParams.toString()}`;
    }
    return path;
  };

  return {
    SPLASH_PARAM,
    isSplashShown,
    markSplashShown,
    withSplashParam,
    preserveParams,
  };
})();
