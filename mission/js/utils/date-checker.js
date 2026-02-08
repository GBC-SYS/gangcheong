/**
 * Date Checker Utility
 * 날짜 기반 기능 활성화 체크 (Asia/Seoul 타임존)
 */

const DateChecker = (() => {
  /**
   * 팩토리 함수: 날짜 체커 생성
   * @param {Object} config - 설정 객체
   * @param {string} config.activationDate - 활성화 날짜 (YYYY-MM-DD 형식)
   * @param {number} config.activationHour - 활성화 시간 (0-23, 기본: 0)
   * @param {string} config.timezone - 타임존 (기본: Asia/Seoul)
   * @returns {Object} 날짜 체크 메서드들
   */
  const createDateChecker = (config = {}) => {
    const {
      activationDate = "2026-02-08",
      activationHour = 0,
      timezone = "Asia/Seoul",
    } = config;

    /**
     * 현재 서울 시간 가져오기
     */
    const getSeoulDate = () => {
      return new Date(
        new Date().toLocaleString("en-US", { timeZone: timezone }),
      );
    };

    /**
     * 활성화 날짜/시간 파싱
     */
    const getActivationDate = () => {
      const [year, month, day] = activationDate.split("-").map(Number);
      return new Date(year, month - 1, day, activationHour, 0, 0);
    };

    /**
     * 현재 날짜/시간이 활성화 날짜/시간 이후인지 확인
     */
    const isActivated = () => {
      const now = getSeoulDate();
      const activation = getActivationDate();

      // 날짜와 시간 모두 비교
      return now >= activation;
    };

    /**
     * 활성화까지 남은 일수
     */
    const getDaysUntilActivation = () => {
      const now = getSeoulDate();
      const activation = getActivationDate();

      const nowDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const activationDateOnly = new Date(
        activation.getFullYear(),
        activation.getMonth(),
        activation.getDate(),
      );

      const diffTime = activationDateOnly - nowDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    };

    /**
     * 활성화 날짜/시간 포맷된 문자열
     */
    const getActivationDateString = () => {
      const activation = getActivationDate();
      const month = activation.getMonth() + 1;
      const day = activation.getDate();
      const hour = activation.getHours();

      if (hour === 0) {
        return `${month}월 ${day}일`;
      } else if (hour === 12) {
        return `${month}월 ${day}일 낮 12시`;
      } else {
        return `${month}월 ${day}일 ${hour}시`;
      }
    };

    return {
      isActivated,
      getDaysUntilActivation,
      getActivationDateString,
      getSeoulDate,
    };
  };

  // 간증/설문 기능용 기본 인스턴스 (2월 8일 낮 12시 활성화)
  const formsChecker = createDateChecker({
    activationDate: "2026-02-08",
    activationHour: 11,
  });

  return {
    createDateChecker,
    formsChecker,
  };
})();

// 전역으로 내보내기
if (typeof window !== "undefined") {
  window.DateChecker = DateChecker;
}
