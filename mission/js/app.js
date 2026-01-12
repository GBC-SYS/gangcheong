/**
 * 수련회 미션 체크리스트 - Main Application
 */

const App = (() => {
  // ==========================================================================
  // Constants & State
  // ==========================================================================

  const RETREAT_SCHEDULE = {
    1: {
      start: new Date("2026-01-12T07:00:00"),
      end: new Date("2026-01-12T24:00:00"),
    },
    2: {
      start: new Date("2026-01-13T07:00:00"),
      end: new Date("2026-01-13T24:00:00"),
    },
    3: {
      start: new Date("2026-01-14T07:00:00"),
      end: new Date("2026-01-14T24:00:00"),
    },
  };

  const state = {
    userName: "",
    missions: [],
    completedMissions: new Set(),
    currentTab: "missions",
    currentDay: 1,
  };

  const elements = {};

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  const showToast = (message) => {
    const existingToast = document.querySelector(".toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("클립보드에 복사되었습니다! 📋"))
      .catch(() => showToast("복사에 실패했습니다"));
  };

  // ==========================================================================
  // State Management
  // ==========================================================================

  const loadState = () => {
    const saved = localStorage.getItem("completed_missions");
    if (saved) {
      state.completedMissions = new Set(JSON.parse(saved));
    }
  };

  const saveState = () => {
    localStorage.setItem(
      "completed_missions",
      JSON.stringify([...state.completedMissions])
    );
  };

  // ==========================================================================
  // Day Functions
  // ==========================================================================

  const getDayStatus = (day) => {
    const now = new Date();
    const schedule = RETREAT_SCHEDULE[day];
    if (now < schedule.start) return "locked";
    if (now >= schedule.end) return "expired";
    return "active";
  };

  const getLatestUnlockedDay = () => {
    for (let day = 1; day <= 3; day++) {
      if (getDayStatus(day) === "active") {
        return day;
      }
    }
    for (let day = 3; day >= 1; day--) {
      if (getDayStatus(day) === "expired") {
        return day;
      }
    }
    return 1;
  };

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

  const handleDayChange = (day) => {
    const status = getDayStatus(day);

    if (status === "locked") {
      const schedule = RETREAT_SCHEDULE[day];
      const month = schedule.start.getMonth() + 1;
      const date = schedule.start.getDate();
      showToast(`DAY ${day}은 ${month}월 ${date}일 오전 6시에 열립니다 🔒`);
      return;
    }

    if (status === "expired") {
      showToast(`DAY ${day}은 종료되었습니다 ⏰`);
      return;
    }

    state.currentDay = day;
    updateDayTabs();
    renderMissions();
  };

  // ==========================================================================
  // Mission Functions
  // ==========================================================================

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

  const updateProgress = () => {
    const total = state.missions.length;
    const completed = state.completedMissions.size;
    Header.updateProgress({ completed, total });

    // 공유 버튼 활성화/비활성화 (최소 3개 미션 완료 필요)
    if (elements.floatingShareBtn) {
      const MIN_MISSIONS_TO_SHARE = 3;
      elements.floatingShareBtn.disabled = completed < MIN_MISSIONS_TO_SHARE;
    }
  };

  const renderMissions = () => {
    const dayMissions = state.missions.filter(
      (m) => m.day === state.currentDay
    );

    const html = dayMissions
      .map((mission) => renderMissionItem(mission))
      .join("");

    elements.missionContainer.innerHTML = html;

    elements.missionContainer
      .querySelectorAll(".mission-item")
      .forEach((item) => {
        item.addEventListener("click", () =>
          handleMissionToggle(parseInt(item.dataset.id))
        );
      });

    updateProgress();
  };

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

  const handleMissionToggle = (missionId) => {
    if (state.completedMissions.has(missionId)) {
      state.completedMissions.delete(missionId);
    } else {
      state.completedMissions.add(missionId);
    }

    saveState();
    renderMissions();
    showToast(message);
  };

  // ==========================================================================
  // Testimony Functions
  // ==========================================================================

  const loadTestimonyDraft = () => {
    const submitted = localStorage.getItem("testimony_submitted");
    const draft = localStorage.getItem("testimony_draft");

    if (elements.testimonyText) {
      if (submitted) {
        elements.testimonyText.value = submitted;
        elements.testimonyText.disabled = true;
        elements.saveTestimonyBtn.style.display = "none";
        document.querySelector(
          ".testimony-form button[type='submit']"
        ).textContent = "수정하기";
      } else if (draft) {
        elements.testimonyText.value = draft;
        elements.testimonyText.disabled = false;
        elements.saveTestimonyBtn.style.display = "";
        document.querySelector(
          ".testimony-form button[type='submit']"
        ).textContent = "제출하기";
      } else {
        elements.testimonyText.value = "";
        elements.testimonyText.disabled = false;
        elements.saveTestimonyBtn.style.display = "";
        document.querySelector(
          ".testimony-form button[type='submit']"
        ).textContent = "제출하기";
      }
    }
  };

  const handleTestimonySave = () => {
    const content = elements.testimonyText.value.trim();
    if (content) {
      localStorage.setItem("testimony_draft", content);
      showToast("임시저장 완료!");
    } else {
      showToast("내용을 입력해주세요");
    }
  };

  const handleTestimonySubmit = (e) => {
    e.preventDefault();

    const isSubmitted = localStorage.getItem("testimony_submitted");
    const isDisabled = elements.testimonyText.disabled;

    if (isSubmitted && isDisabled) {
      elements.testimonyText.disabled = false;
      elements.saveTestimonyBtn.style.display = "";
      document.querySelector(
        ".testimony-form button[type='submit']"
      ).textContent = "수정 완료";
      elements.testimonyText.focus();
      showToast("수정 모드로 전환되었습니다 ✏️");
      return;
    }

    const content = elements.testimonyText.value.trim();

    if (!content) {
      showToast("간증문을 작성해주세요");
      return;
    }

    localStorage.setItem("testimony_submitted", content);
    localStorage.removeItem("testimony_draft");

    if (isSubmitted) {
      showToast("간증문이 수정되었습니다! 🙏");
    } else {
      showToast("간증문이 제출되었습니다! 🙏");
    }

    setTimeout(() => handleTabChange("missions"), 1500);
  };

  // ==========================================================================
  // Survey Functions
  // ==========================================================================

  const loadSurvey = async () => {
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

    setTimeout(() => handleTabChange("missions"), 1500);
  };

  // ==========================================================================
  // Share Functions
  // ==========================================================================

  const handleShare = async () => {
    const completed = state.completedMissions.size;
    const total = state.missions.length;
    const testimony = localStorage.getItem("testimony_submitted");

    const completedMissionTitles = state.missions
      .filter((m) => state.completedMissions.has(m.id))
      .map((m) => `✅ ${m.title}`)
      .join("\n");

    let shareText = `${state.userName}님의 미션 현황\n`;
    shareText += `🎯 ${completed}/${total}개 미션 완료!\n\n`;

    if (completedMissionTitles) {
      shareText += `📋 완료한 미션:\n${completedMissionTitles}\n\n`;
    }

    if (testimony) {
      shareText += `✍️ 간증문:\n"${testimony}"\n\n`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "2026 강청 겨울 수련회",
          text: shareText,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  // ==========================================================================
  // Navigation Functions
  // ==========================================================================

  const handleTabChange = (tab) => {
    state.currentTab = tab;
    window.scrollTo({ top: 0, behavior: "smooth" });

    elements.bottomNavBtns.forEach((btn) => {
      btn.classList.toggle("bottom-nav__btn--active", btn.dataset.tab === tab);
    });

    const tabConfig = {
      missions: {
        main: "block",
        testimony: "none",
        survey: "none",
        shareBtn: "block",
        onEnter: null,
      },
      testimony: {
        main: "none",
        testimony: "flex",
        survey: "none",
        shareBtn: "none",
        onEnter: loadTestimonyDraft,
      },
      survey: {
        main: "none",
        testimony: "none",
        survey: "flex",
        shareBtn: "none",
        onEnter: loadSurvey,
      },
    };

    const config = tabConfig[tab];
    if (!config) return;

    document.querySelector(".main").style.display = config.main;
    elements.testimonyPage.style.display = config.testimony;
    elements.surveyPage.style.display = config.survey;

    const floatingShareWrapper = document.querySelector(
      ".floating-share-wrapper"
    );
    if (floatingShareWrapper) {
      floatingShareWrapper.style.display = config.shareBtn;
    }

    config.onEnter?.();
  };

  // ==========================================================================
  // App Initialization Functions
  // ==========================================================================

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

  const showApp = () => {
    elements.intro.style.display = "none";
    elements.app.style.display = "flex";
    window.scrollTo({ top: 0, behavior: "instant" });

    Header.setOnShareClick(handleShare);
    Header.render(elements.header, { userName: state.userName });

    state.currentDay = getLatestUnlockedDay();

    loadState();
    loadMissions();
    updateDayTabs();
  };

  const checkExistingUser = () => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      state.userName = savedName;
      showApp();
    }
  };

  // ==========================================================================
  // Bootstrap Functions (실행 함수)
  // ==========================================================================

  const cacheElements = () => {
    // Intro
    elements.intro = document.getElementById("intro");
    elements.userNameInput = document.getElementById("userName");
    elements.startBtn = document.getElementById("startBtn");

    // App
    elements.app = document.getElementById("app");
    elements.header = document.getElementById("header");
    elements.missionContainer = document.getElementById("missionContainer");

    // Day tabs
    elements.dayTabs = document.querySelectorAll(".day-tab");

    // Navigation
    elements.bottomNavBtns = document.querySelectorAll(".bottom-nav__btn");
    elements.floatingShareBtn = document.getElementById("floatingShareBtn");

    // Section pages
    elements.testimonyPage = document.getElementById("testimony");
    elements.surveyPage = document.getElementById("survey");
    elements.testimonyText = document.getElementById("testimonyText");
    elements.saveTestimonyBtn = document.getElementById("saveTestimonyBtn");
    elements.testimonyForm = document.querySelector(".testimony-form");
    elements.surveyForm = document.getElementById("surveyForm");
  };

  const bindEvents = () => {
    elements.startBtn.addEventListener("click", handleStart);

    elements.userNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleStart();
    });

    elements.dayTabs.forEach((tab) => {
      tab.addEventListener("click", () =>
        handleDayChange(parseInt(tab.dataset.day))
      );
    });

    elements.bottomNavBtns.forEach((btn) => {
      btn.addEventListener("click", () => handleTabChange(btn.dataset.tab));
    });

    if (elements.floatingShareBtn) {
      elements.floatingShareBtn.addEventListener("click", handleShare);
    }

    if (elements.testimonyForm) {
      elements.testimonyForm.addEventListener("submit", handleTestimonySubmit);
    }
    if (elements.saveTestimonyBtn) {
      elements.saveTestimonyBtn.addEventListener("click", handleTestimonySave);
    }

    if (elements.surveyForm) {
      elements.surveyForm.addEventListener("submit", handleSurveySubmit);
    }
  };

  const init = () => {
    cacheElements();
    bindEvents();
    checkExistingUser();
  };

  return { init };
})();

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", App.init);
