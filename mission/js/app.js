/**
 * 수련회 미션 체크리스트 - Main Application
 */

const App = (() => {
  // 수련회 일정 설정 (각 Day는 해당 날짜에만 활성화, 다음 날 열리면 이전 Day 잠김)
  const RETREAT_SCHEDULE = {
    1: {
      start: new Date("2026-01-10T06:00:00"),
      end: new Date("2026-01-10T24:00:00"),
    },
    2: {
      start: new Date("2026-01-11T06:00:00"),
      end: new Date("2026-01-11T24:00:00"),
    },
    3: {
      start: new Date("2026-01-12T06:00:00"),
      end: new Date("2026-01-12T24:00:00"),
    },
  };

  // State
  const state = {
    userName: "",
    missions: [],
    completedMissions: new Set(),
    currentTab: "missions",
    currentDay: 1,
  };

  // DOM Elements
  const elements = {};

  /**
   * Initialize the app
   */
  const init = () => {
    cacheElements();
    bindEvents();
    checkExistingUser();
  };

  /**
   * Cache DOM elements
   */
  const cacheElements = () => {
    // Intro
    elements.intro = document.getElementById("intro");
    elements.userNameInput = document.getElementById("userName");
    elements.startBtn = document.getElementById("startBtn");

    // App
    elements.app = document.getElementById("app");
    elements.displayName = document.getElementById("displayName");
    elements.missionContainer = document.getElementById("missionContainer");
    elements.completedCount = document.getElementById("completedCount");
    elements.totalCount = document.getElementById("totalCount");
    elements.progressFill = document.getElementById("progressFill");

    // Day tabs
    elements.dayTabs = document.querySelectorAll(".day-tab");

    // Share button
    elements.shareBtn = document.getElementById("shareBtn");

    // Navigation
    elements.bottomNavBtns = document.querySelectorAll(".bottom-nav__btn");

    // Section pages
    elements.testimonyPage = document.getElementById("testimony");
    elements.surveyPage = document.getElementById("survey");
    elements.testimonyText = document.getElementById("testimonyText");
    elements.saveTestimonyBtn = document.getElementById("saveTestimonyBtn");
    elements.testimonyForm = document.querySelector(".testimony-form");
    elements.surveyForm = document.getElementById("surveyForm");

    // Back buttons
    elements.backBtns = document.querySelectorAll(".back-btn");
  };

  /**
   * Bind event listeners
   */
  const bindEvents = () => {
    // Start button
    elements.startBtn.addEventListener("click", handleStart);

    // Enter key on name input
    elements.userNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleStart();
    });

    // Day tabs
    elements.dayTabs.forEach((tab) => {
      tab.addEventListener("click", () =>
        handleDayChange(parseInt(tab.dataset.day))
      );
    });

    // Share button
    if (elements.shareBtn) {
      elements.shareBtn.addEventListener("click", handleShare);
    }

    // Bottom navigation
    elements.bottomNavBtns.forEach((btn) => {
      btn.addEventListener("click", () => handleTabChange(btn.dataset.tab));
    });

    // Back buttons
    elements.backBtns.forEach((btn) => {
      btn.addEventListener("click", () => handleTabChange(btn.dataset.back));
    });

    // Testimony form
    if (elements.testimonyForm) {
      elements.testimonyForm.addEventListener("submit", handleTestimonySubmit);
    }
    if (elements.saveTestimonyBtn) {
      elements.saveTestimonyBtn.addEventListener("click", handleTestimonySave);
    }

    // Survey form
    if (elements.surveyForm) {
      elements.surveyForm.addEventListener("submit", handleSurveySubmit);
    }
  };

  /**
   * Check if user already exists
   */
  const checkExistingUser = () => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      state.userName = savedName;
      showApp();
    }
  };

  /**
   * Handle start button click
   */
  const handleStart = () => {
    const name = elements.userNameInput.value.trim();
    if (!name) {
      elements.userNameInput.focus();
      showToast("이름을 입력해주세요");
      return;
    }

    state.userName = name;
    localStorage.setItem("userName", name);
    showApp();
  };

  /**
   * Show main app
   */
  const showApp = () => {
    elements.intro.style.display = "none";
    elements.app.style.display = "flex";
    elements.displayName.textContent = state.userName;

    // 현재 열린 Day 중 가장 최근 것으로 설정
    state.currentDay = getLatestUnlockedDay();

    loadState();
    loadMissions();
    updateDayTabs();
  };

  /**
   * Get the currently active day (현재 활성화된 Day 찾기)
   */
  const getLatestUnlockedDay = () => {
    for (let day = 1; day <= 3; day++) {
      if (getDayStatus(day) === "active") {
        return day;
      }
    }
    // 활성화된 Day가 없으면 가장 최근 종료된 Day 또는 Day 1
    for (let day = 3; day >= 1; day--) {
      if (getDayStatus(day) === "expired") {
        return day; // 종료된 Day 보여주기 (비활성 상태)
      }
    }
    return 1; // 수련회 시작 전이면 Day 1
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (tab) => {
    state.currentTab = tab;

    // Update nav buttons
    elements.bottomNavBtns.forEach((btn) => {
      btn.classList.toggle("bottom-nav__btn--active", btn.dataset.tab === tab);
    });

    // Show/hide pages
    const mainContent = document.querySelector(".main");
    const header = document.querySelector(".header");

    if (tab === "missions") {
      mainContent.style.display = "block";
      header.style.display = "block";
      elements.testimonyPage.style.display = "none";
      elements.surveyPage.style.display = "none";
    } else if (tab === "testimony") {
      mainContent.style.display = "none";
      header.style.display = "none";
      elements.testimonyPage.style.display = "flex";
      elements.surveyPage.style.display = "none";
      loadTestimonyDraft();
    } else if (tab === "survey") {
      mainContent.style.display = "none";
      header.style.display = "none";
      elements.testimonyPage.style.display = "none";
      elements.surveyPage.style.display = "flex";
      loadSurvey();
    }
  };

  /**
   * Get day status: 'locked' (아직 안 열림), 'active' (현재 활성), 'expired' (종료됨)
   */
  const getDayStatus = (day) => {
    const now = new Date();
    const schedule = RETREAT_SCHEDULE[day];
    if (now < schedule.start) return "locked";
    if (now >= schedule.end) return "expired";
    return "active";
  };

  /**
   * Update day tabs UI (활성화/비활성화 상태)
   */
  const updateDayTabs = () => {
    elements.dayTabs.forEach((tab) => {
      const day = parseInt(tab.dataset.day);
      const status = getDayStatus(day);
      const isActive = day === state.currentDay && status === "active";

      tab.classList.toggle("day-tab--active", isActive);
      tab.classList.toggle("day-tab--disabled", status === "locked");
      tab.classList.toggle("day-tab--expired", status === "expired");
    });
  };

  /**
   * Handle day tab change
   */
  const handleDayChange = (day) => {
    const status = getDayStatus(day);

    // 잠긴 탭은 클릭 불가
    if (status === "locked") {
      const schedule = RETREAT_SCHEDULE[day];
      const month = schedule.start.getMonth() + 1;
      const date = schedule.start.getDate();
      showToast(`DAY ${day}은 ${month}월 ${date}일 오전 6시에 열립니다 🔒`);
      return;
    }

    // 종료된 탭도 클릭 불가
    if (status === "expired") {
      showToast(`DAY ${day}은 종료되었습니다 ⏰`);
      return;
    }

    state.currentDay = day;
    updateDayTabs();
    renderMissions();
  };

  /**
   * Load missions from JSON
   */
  const loadMissions = async () => {
    try {
      const response = await fetch("./data/missions.json");
      if (response.ok) {
        const data = await response.json();
        state.missions = data.missions || [];
      }
    } catch (error) {
      state.missions = [];
    }
    renderMissions();
  };

  /**
   * Render missions for current day
   */
  const renderMissions = () => {
    const dayMissions = state.missions.filter(
      (m) => m.day === state.currentDay
    );

    const html = dayMissions
      .map((mission) => renderMissionItem(mission))
      .join("");

    elements.missionContainer.innerHTML = html;

    // Bind click events
    elements.missionContainer
      .querySelectorAll(".mission-item")
      .forEach((item) => {
        item.addEventListener("click", () =>
          handleMissionToggle(parseInt(item.dataset.id))
        );
      });

    updateProgress();
  };

  /**
   * Render single mission item
   */
  const renderMissionItem = (mission) => {
    const isCompleted = state.completedMissions.has(mission.id);
    return `
      <li class="mission-item ${
        isCompleted ? "mission-item--completed" : ""
      }" data-id="${mission.id}">
        <div class="mission-item__checkbox">
          <span class="mission-item__checkbox-icon">✓</span>
        </div>
        <span class="mission-item__title">${mission.title}</span>
      </li>
    `;
  };

  /**
   * Handle mission toggle
   */
  const handleMissionToggle = (missionId) => {
    if (state.completedMissions.has(missionId)) {
      state.completedMissions.delete(missionId);
    } else {
      state.completedMissions.add(missionId);
    }

    saveState();
    renderMissions();

    const message = state.completedMissions.has(missionId)
      ? "미션 완료! 🎉"
      : "미션 취소됨";
    showToast(message);
  };

  /**
   * Update progress display
   */
  const updateProgress = () => {
    const total = state.missions.length;
    const completed = state.completedMissions.size;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    elements.completedCount.textContent = completed;
    elements.totalCount.textContent = total;
    elements.progressFill.style.width = `${percentage}%`;
  };

  /**
   * Load testimony (제출된 간증문 또는 임시저장)
   */
  const loadTestimonyDraft = () => {
    const submitted = localStorage.getItem("testimony_submitted");
    const draft = localStorage.getItem("testimony_draft");

    if (elements.testimonyText) {
      if (submitted) {
        // 이미 제출된 간증문이 있으면 표시
        elements.testimonyText.value = submitted;
        elements.testimonyText.disabled = true;
        elements.saveTestimonyBtn.style.display = "none";
        document.querySelector(".testimony-form button[type='submit']").textContent = "수정하기";
      } else if (draft) {
        // 임시저장된 내용 불러오기
        elements.testimonyText.value = draft;
        elements.testimonyText.disabled = false;
        elements.saveTestimonyBtn.style.display = "";
        document.querySelector(".testimony-form button[type='submit']").textContent = "제출하기";
      } else {
        // 새로 작성
        elements.testimonyText.value = "";
        elements.testimonyText.disabled = false;
        elements.saveTestimonyBtn.style.display = "";
        document.querySelector(".testimony-form button[type='submit']").textContent = "제출하기";
      }
    }
  };

  /**
   * Handle testimony save
   */
  const handleTestimonySave = () => {
    const content = elements.testimonyText.value.trim();
    if (content) {
      localStorage.setItem("testimony_draft", content);
      showToast("임시저장 완료!");
    } else {
      showToast("내용을 입력해주세요");
    }
  };

  /**
   * Handle testimony submit
   */
  const handleTestimonySubmit = (e) => {
    e.preventDefault();

    const isSubmitted = localStorage.getItem("testimony_submitted");
    const isDisabled = elements.testimonyText.disabled;

    // 이미 제출된 상태에서 "수정하기" 클릭 시 수정 모드로 전환
    if (isSubmitted && isDisabled) {
      elements.testimonyText.disabled = false;
      elements.saveTestimonyBtn.style.display = "";
      document.querySelector(".testimony-form button[type='submit']").textContent = "수정 완료";
      elements.testimonyText.focus();
      showToast("수정 모드로 전환되었습니다 ✏️");
      return;
    }

    const content = elements.testimonyText.value.trim();

    if (!content) {
      showToast("간증문을 작성해주세요");
      return;
    }

    // 로컬스토리지에 저장
    localStorage.setItem("testimony_submitted", content);
    localStorage.removeItem("testimony_draft");

    if (isSubmitted) {
      showToast("간증문이 수정되었습니다! 🙏");
    } else {
      showToast("간증문이 제출되었습니다! 🙏");
    }

    // Return to missions
    setTimeout(() => handleTabChange("missions"), 1500);
  };

  /**
   * Load survey
   */
  const loadSurvey = async () => {
    // Simple survey for now
    const surveyHtml = `
      <div class="survey-question">
        <p class="survey-question__title">1. 이번 수련회에서 가장 좋았던 점은?</p>
        <textarea class="input" name="q1" rows="3" placeholder="자유롭게 작성해주세요"></textarea>
      </div>
      <div class="survey-question">
        <p class="survey-question__title">2. 개선되었으면 하는 점은?</p>
        <textarea class="input" name="q2" rows="3" placeholder="자유롭게 작성해주세요"></textarea>
      </div>
      <div class="survey-question">
        <p class="survey-question__title">3. 전체 만족도는?</p>
        <div class="survey-question__options">
          <label class="survey-option">
            <input type="radio" name="satisfaction" value="5" />
            <span>매우 만족</span>
          </label>
          <label class="survey-option">
            <input type="radio" name="satisfaction" value="4" />
            <span>만족</span>
          </label>
          <label class="survey-option">
            <input type="radio" name="satisfaction" value="3" />
            <span>보통</span>
          </label>
          <label class="survey-option">
            <input type="radio" name="satisfaction" value="2" />
            <span>불만족</span>
          </label>
          <label class="survey-option">
            <input type="radio" name="satisfaction" value="1" />
            <span>매우 불만족</span>
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary survey-form__submit" style="width: 100%;">제출하기</button>
    `;

    elements.surveyForm.innerHTML = surveyHtml;
  };

  /**
   * Handle survey submit
   */
  const handleSurveySubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const satisfaction = formData.get("satisfaction");

    if (!satisfaction) {
      showToast("만족도를 선택해주세요");
      return;
    }

    // TODO: Submit to Supabase
    showToast("설문이 제출되었습니다! 감사합니다 🙏");

    // Return to missions
    setTimeout(() => handleTabChange("missions"), 1500);
  };

  /**
   * Load state from localStorage
   */
  const loadState = () => {
    const saved = localStorage.getItem("completed_missions");
    if (saved) {
      state.completedMissions = new Set(JSON.parse(saved));
    }
  };

  /**
   * Save state to localStorage
   */
  const saveState = () => {
    localStorage.setItem(
      "completed_missions",
      JSON.stringify([...state.completedMissions])
    );
  };

  /**
   * Handle share button click (Web Share API)
   */
  const handleShare = async () => {
    const completed = state.completedMissions.size;
    const total = state.missions.length;
    const testimony = localStorage.getItem("testimony_submitted");

    // 공유 메시지 구성
    let shareText = `🎯 ${state.userName}님이 ${completed}/${total}개 미션을 완료했어요!`;

    // 간증문이 있으면 추가 (100자 미리보기)
    if (testimony) {
      const preview = testimony.length > 100
        ? testimony.substring(0, 100) + "..."
        : testimony;
      shareText += `\n\n✍️ 간증문:\n"${preview}"`;
    }

    shareText += `\n\n수련회 미션에 도전해보세요 💪`;

    const shareData = {
      title: "2025 겨울 수련회 미션",
      text: shareText,
      url: window.location.href,
    };

    // Web Share API 지원 확인
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 사용자가 공유 취소한 경우 무시
        if (err.name !== "AbortError") {
          fallbackShare(shareData);
        }
      }
    } else {
      fallbackShare(shareData);
    }
  };

  /**
   * Fallback share (클립보드 복사)
   */
  const fallbackShare = (shareData) => {
    const text = `${shareData.text}\n${shareData.url}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast("링크가 복사되었습니다! 📋"))
        .catch(() => showToast("공유하기를 사용할 수 없습니다"));
    } else {
      showToast("공유하기를 사용할 수 없습니다");
    }
  };

  /**
   * Show toast notification
   */
  const showToast = (message) => {
    const existingToast = document.querySelector(".toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  };

  return { init };
})();

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", App.init);
