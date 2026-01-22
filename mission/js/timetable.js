/**
 * Timetable Page Script
 * 타임테이블 페이지 전용 스크립트 (3일 탭 버전)
 */

(function () {
  // ========================================
  // 수련회 일정 설정 (여기서 날짜/시간 수정)
  // ========================================
  const RETREAT_DAYS = {
    day1: new Date("2026-02-06"),
    day2: new Date("2026-02-07"),
    day3: new Date("2026-02-08"),
  };

  // 테스트용 시간 설정 (null이면 실제 현재 시간 사용)
  // 예: new Date("2026-01-22T15:30:00")
  const DEBUG_TIME = null;

  // 현재 시간 가져오기 (테스트 모드 지원)
  const getNow = () => (DEBUG_TIME ? new Date(DEBUG_TIME) : new Date());

  // 상태
  let timetableData = {};
  let currentDay = "day1";
  let timetableInterval = null;

  // 요소
  const timetableContainer = document.getElementById("timetableContainer");
  const dayTabs = document.getElementById("dayTabs");

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const toDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 오늘 날짜와 일치하는 day 찾기
  const findTodayDay = () => {
    const todayStr = toDateString(getNow());

    for (const [dayKey, date] of Object.entries(RETREAT_DAYS)) {
      if (toDateString(date) === todayStr) {
        return dayKey;
      }
    }
    return null;
  };

  // 날짜 포맷 ((2월 6일 금) 형식)
  const formatTabDate = (date) => {
    const days = ["주일", "월", "화", "수", "목", "금", "토"];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = days[date.getDay()];
    return `(${month}월 ${day}일 ${dayName})`;
  };

  // 탭 UI 업데이트
  const updateTabs = () => {
    const todayDay = findTodayDay();
    const tabs = dayTabs.querySelectorAll(".day-tab");

    tabs.forEach((tab) => {
      const day = tab.dataset.day;

      // 날짜 텍스트 업데이트
      const dateEl = tab.querySelector(".day-tab__date");
      if (dateEl && RETREAT_DAYS[day]) {
        dateEl.textContent = formatTabDate(RETREAT_DAYS[day]);
      }

      // active 상태
      tab.classList.toggle("day-tab--active", day === currentDay);

      // today 표시
      tab.classList.toggle("day-tab--today", day === todayDay);
    });
  };

  // 현재 일정 인덱스 계산
  const getCurrentScheduleIndex = (schedules) => {
    const todayDay = findTodayDay();

    // 오늘이 아닌 날짜를 보고 있으면 하이라이트 없음
    if (currentDay !== todayDay) {
      return -1;
    }

    const now = getNow();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = schedules.length - 1; i >= 0; i--) {
      const [hours, minutes] = schedules[i].time.split(":").map(Number);
      const scheduleMinutes = hours * 60 + minutes;

      if (currentMinutes >= scheduleMinutes) {
        return i;
      }
    }
    return -1; // 아직 첫 일정 시작 전
  };

  // 타임테이블 렌더링
  const renderTimetable = () => {
    const dayData = timetableData[currentDay];

    if (!dayData || !dayData.schedules) {
      timetableContainer.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--color-text-secondary);">
          일정이 없습니다.
        </div>
      `;
      return;
    }

    const schedules = dayData.schedules;
    const currentIndex = getCurrentScheduleIndex(schedules);

    const html = schedules
      .map((item, index) => {
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        const statusClass = isCurrent
          ? "timetable-item--current"
          : isPast
            ? "timetable-item--past"
            : "";

        return `
          <div class="timetable-item ${statusClass}">
            ${isCurrent ? '<div class="timetable-item__badge">NOW</div>' : ""}
            <div class="timetable-item__time">${item.time}</div>
            <div class="timetable-item__title">${item.title}</div>
          </div>
        `;
      })
      .join("");

    timetableContainer.innerHTML = html;

    // 현재 일정으로 스크롤
    if (currentIndex >= 0) {
      const currentItem = timetableContainer.querySelector(
        ".timetable-item--current",
      );
      if (currentItem) {
        setTimeout(() => {
          currentItem.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }
  };

  // 탭 클릭 핸들러
  const handleTabClick = (e) => {
    const tab = e.target.closest(".day-tab");
    if (!tab) return;

    const day = tab.dataset.day;
    if (day === currentDay) return;

    currentDay = day;
    updateTabs();
    renderTimetable();
  };

  // 타임테이블 업데이터 시작
  const startTimetableUpdater = () => {
    if (timetableInterval) clearInterval(timetableInterval);
    // 1분마다 타임테이블 업데이트
    timetableInterval = setInterval(() => {
      renderTimetable();
    }, 60000);
  };

  // 데이터 로드 및 초기화
  const init = async () => {
    try {
      const response = await fetch("../data/timetable.json");
      timetableData = await response.json();

      // 오늘에 해당하는 탭이 있으면 자동 선택
      const todayDay = findTodayDay();
      if (todayDay) {
        currentDay = todayDay;
      }

      // 탭 클릭 이벤트 등록
      dayTabs.addEventListener("click", handleTabClick);

      updateTabs();
      renderTimetable();
      startTimetableUpdater();
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      timetableContainer.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--color-text-secondary);">
          데이터를 불러오는데 실패했습니다.
        </div>
      `;
    }
  };

  // 시작
  init();
})();
