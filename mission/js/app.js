/**
 * 수련회 사랑의 언어 도장판 - Main Application
 */

const App = (() => {
  // ==========================================================================
  // Constants & State
  // ==========================================================================

  // 미션 진행 시간 (하루만 진행)
  const MISSION_SCHEDULE = {
    start: new Date("2026-01-22T07:00:00"),
    end: new Date("2026-01-22T23:59:00"),
  };

  // 구글폼 링크 (임원단이 나중에 수정)
  const GOOGLE_FORMS = {
    testimony: "https://forms.google.com/testimony", // 간증문 구글폼
    survey: "https://forms.google.com/survey", // 설문 구글폼
  };

  const state = {
    userName: "",
    loveLanguages: [],
    timetable: [],
    stampData: {}, // { languageId: { targetName, selectedMission, completed } }
    currentMainTab: "stamp", // stamp | timetable
    currentModalLanguageId: null,
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

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#e91e63", "#ff5722", "#ff9800", "#ffeb3b", "#4caf50"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#e91e63", "#ff5722", "#ff9800", "#ffeb3b", "#4caf50"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  // ==========================================================================
  // State Management
  // ==========================================================================

  const loadState = () => {
    const saved = localStorage.getItem("stamp_data");
    if (saved) {
      state.stampData = JSON.parse(saved);
    }
  };

  const saveState = () => {
    localStorage.setItem("stamp_data", JSON.stringify(state.stampData));
  };

  // ==========================================================================
  // Time Check Functions
  // ==========================================================================

  const isBeforeStart = () => {
    const now = new Date();
    return now < MISSION_SCHEDULE.start;
  };

  const isAfterEnd = () => {
    const now = new Date();
    return now >= MISSION_SCHEDULE.end;
  };

  // ==========================================================================
  // Stamp (도장판) Functions
  // ==========================================================================

  const getCompletedCount = () => {
    return Object.values(state.stampData).filter((s) => s.completed).length;
  };

  const renderStampCard = (language) => {
    const data = state.stampData[language.id] || {};
    const isCompleted = data.completed;
    const hasData = data.targetName && data.selectedMission !== undefined;
    const hasPhoto = data.photoData;

    return `
      <div class="stamp-card ${isCompleted ? "stamp-card--completed" : ""}" data-id="${language.id}">
        <div class="stamp-card__header">
          <span class="stamp-card__emoji">${language.emoji}</span>
          <h3 class="stamp-card__name">${language.name}</h3>
        </div>
        <p class="stamp-card__desc">${language.description}</p>
        ${
          hasData
            ? `
          <div class="stamp-card__info">
            <p class="stamp-card__target">To. ${data.targetName}</p>
            <p class="stamp-card__mission">${language.missions[data.selectedMission]}</p>
          </div>
          ${
            isCompleted
              ? `
            ${hasPhoto ? `<div class="stamp-card__photo"><img src="${data.photoData}" alt="인증 사진" /></div>` : ""}
            <div class="stamp-card__actions">
              <div class="stamp-card__stamp">COMPLETE</div>
            </div>
          `
              : hasPhoto
                ? `
            <div class="stamp-card__photo">
              <img src="${data.photoData}" alt="인증 사진" />
              <button class="stamp-card__photo-remove" data-id="${language.id}">삭제</button>
            </div>
            <div class="stamp-card__actions">
              <button class="stamp-card__complete-btn" data-id="${language.id}">미션 완료!</button>
            </div>
          `
                : `
            <div class="stamp-card__photo-upload">
              <label class="stamp-card__upload-btn" for="photo-${language.id}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>사진으로 인증하기</span>
              </label>
              <input type="file" id="photo-${language.id}" class="stamp-card__photo-input" data-id="${language.id}" accept="image/*" capture="environment" />
            </div>
          `
          }
        `
            : `
          <button class="stamp-card__start-btn" data-id="${language.id}">미션 시작하기</button>
        `
        }
      </div>
    `;
  };

  const renderStamps = () => {
    // 시작 전 체크
    if (isBeforeStart()) {
      elements.beforeStartNotice.style.display = "flex";
      elements.stampSection.style.display = "none";
      elements.missionEndedNotice.style.display = "none";
      return;
    }

    elements.beforeStartNotice.style.display = "none";

    // 종료 후 체크
    if (isAfterEnd()) {
      elements.missionEndedNotice.style.display = "flex";
      elements.stampSection.style.display = "none";
      return;
    }

    elements.missionEndedNotice.style.display = "none";
    elements.stampSection.style.display = "";

    const html = state.loveLanguages
      .map((lang) => renderStampCard(lang))
      .join("");
    elements.stampContainer.innerHTML = html;

    // 이벤트 바인딩
    elements.stampContainer
      .querySelectorAll(".stamp-card__start-btn")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          openModal(parseInt(btn.dataset.id));
        });
      });

    elements.stampContainer
      .querySelectorAll(".stamp-card__complete-btn")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          handleComplete(parseInt(btn.dataset.id));
        });
      });

    // 사진 업로드 버튼(label) 클릭 시 이벤트 버블링 방지
    elements.stampContainer
      .querySelectorAll(".stamp-card__upload-btn")
      .forEach((label) => {
        label.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      });

    // 사진 업로드 이벤트
    elements.stampContainer
      .querySelectorAll(".stamp-card__photo-input")
      .forEach((input) => {
        input.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        input.addEventListener("change", (e) => {
          e.stopPropagation();
          handlePhotoUpload(parseInt(input.dataset.id), input.files[0]);
        });
      });

    // 사진 삭제 이벤트
    elements.stampContainer
      .querySelectorAll(".stamp-card__photo-remove")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          handlePhotoRemove(parseInt(btn.dataset.id));
        });
      });

    // 카드 클릭 시 수정 (완료되지 않은 경우, 사진 없을 때만)
    elements.stampContainer.querySelectorAll(".stamp-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // 사진 업로드 영역 클릭 시 무시
        if (
          e.target.closest(".stamp-card__photo-upload") ||
          e.target.closest(".stamp-card__photo")
        ) {
          return;
        }
        const id = parseInt(card.dataset.id);
        const data = state.stampData[id];
        if (data && !data.completed && !data.photoData) {
          openModal(id);
        }
      });
    });

    updateProgress();
    updateShareButton();
  };

  const handleComplete = (languageId) => {
    if (!state.stampData[languageId]) return;

    state.stampData[languageId].completed = true;
    saveState();
    renderStamps();

    const completedCount = getCompletedCount();

    // 모든 도장 완료 시 폭죽
    if (completedCount === 5) {
      fireConfetti();
      showToast("축하합니다! 모든 도장을 모았어요!");
    } else {
      showToast(`도장 획득! (${completedCount}/5)`);
    }
  };

  // ==========================================================================
  // Photo Functions
  // ==========================================================================

  const handlePhotoUpload = async (languageId, file) => {
    if (!file || !state.stampData[languageId]) return;

    showToast("사진 처리 중...");

    try {
      // createImageBitmap 사용 (EXIF 방향 자동 처리, 모바일 호환성 향상)
      let imageBitmap;

      if (typeof createImageBitmap === "function") {
        // 모던 브라우저 - EXIF 방향 자동 처리
        imageBitmap = await createImageBitmap(file);
      } else {
        // 폴백 - 구형 브라우저
        imageBitmap = await loadImageFromFile(file);
      }

      const canvas = document.createElement("canvas");
      const maxSize = 400;
      let width = imageBitmap.width;
      let height = imageBitmap.height;

      // 비율 유지하며 리사이즈
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageBitmap, 0, 0, width, height);

      // 압축된 이미지 저장
      const compressedData = canvas.toDataURL("image/jpeg", 0.7);
      state.stampData[languageId].photoData = compressedData;
      saveState();
      renderStamps();
      showToast("사진이 등록되었습니다! 미션을 완료해주세요.");
    } catch (error) {
      console.error("Photo upload error:", error);
      showToast("사진 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  /**
   * 파일에서 이미지 로드 (폴백용)
   */
  const loadImageFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoRemove = (languageId) => {
    if (!state.stampData[languageId]) return;

    delete state.stampData[languageId].photoData;
    saveState();
    renderStamps();
    showToast("사진이 삭제되었습니다.");
  };

  // ==========================================================================
  // Modal Functions
  // ==========================================================================

  const openModal = (languageId) => {
    state.currentModalLanguageId = languageId;
    const language = state.loveLanguages.find((l) => l.id === languageId);
    if (!language) return;

    const existingData = state.stampData[languageId] || {};

    // 모달 제목
    elements.modalTitle.textContent = `${language.emoji} ${language.name}`;

    // 대상자 이름
    elements.targetNameInput.value = existingData.targetName || "";

    // 미션 옵션 렌더링
    const optionsHtml = language.missions
      .map(
        (mission, idx) => `
      <label class="modal__option ${existingData.selectedMission === idx ? "modal__option--selected" : ""}">
        <input type="radio" name="mission" value="${idx}" ${existingData.selectedMission === idx ? "checked" : ""} />
        <span class="modal__option-text">${mission}</span>
      </label>
    `,
      )
      .join("");
    elements.missionOptions.innerHTML = optionsHtml;

    // 라디오 버튼 이벤트
    elements.missionOptions
      .querySelectorAll('input[type="radio"]')
      .forEach((radio) => {
        radio.addEventListener("change", () => {
          elements.missionOptions
            .querySelectorAll(".modal__option")
            .forEach((opt) => {
              opt.classList.remove("modal__option--selected");
            });
          radio
            .closest(".modal__option")
            .classList.add("modal__option--selected");
        });
      });

    elements.modal.style.display = "flex";
  };

  const closeModal = () => {
    elements.modal.style.display = "none";
    state.currentModalLanguageId = null;
  };

  const handleModalConfirm = () => {
    const languageId = state.currentModalLanguageId;
    if (!languageId) return;

    const targetName = elements.targetNameInput.value.trim();
    const selectedMission = elements.missionOptions.querySelector(
      'input[name="mission"]:checked',
    );

    if (!targetName) {
      showToast("대상자 이름을 입력해주세요");
      return;
    }

    if (!selectedMission) {
      showToast("미션을 선택해주세요");
      return;
    }

    state.stampData[languageId] = {
      targetName,
      selectedMission: parseInt(selectedMission.value),
      completed: state.stampData[languageId]?.completed || false,
    };

    saveState();
    closeModal();
    renderStamps();
    showToast("미션이 설정되었습니다!");
  };

  // ==========================================================================
  // Timetable Functions
  // ==========================================================================

  let timetableInterval = null;

  const getCurrentScheduleIndex = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = state.timetable.length - 1; i >= 0; i--) {
      const [hours, minutes] = state.timetable[i].time.split(":").map(Number);
      const scheduleMinutes = hours * 60 + minutes;

      if (currentMinutes >= scheduleMinutes) {
        return i;
      }
    }
    return -1; // 아직 첫 일정 시작 전
  };

  const renderTimetable = () => {
    const currentIndex = getCurrentScheduleIndex();

    const html = state.timetable
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

    elements.timetableContainer.innerHTML = html;

    // 현재 일정으로 스크롤
    if (currentIndex >= 0) {
      const currentItem = elements.timetableContainer.querySelector(
        ".timetable-item--current",
      );
      if (currentItem) {
        currentItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const startTimetableUpdater = () => {
    if (timetableInterval) clearInterval(timetableInterval);
    // 1분마다 타임테이블 업데이트
    timetableInterval = setInterval(() => {
      if (state.currentMainTab === "timetable") {
        renderTimetable();
      }
    }, 60000);
  };

  // ==========================================================================
  // Progress & Share Functions
  // ==========================================================================

  const updateProgress = () => {
    const completed = getCompletedCount();
    const total = 5;
    Header.updateProgress({ completed, total });
  };

  /**
   * 도장판 이미지 생성
   */
  const generateShareImage = async () => {
    const completedLanguages = state.loveLanguages.filter(
      (lang) => state.stampData[lang.id]?.completed,
    );

    // 캔버스 크기 설정
    const canvasWidth = 600;
    const headerHeight = 140;
    const cardHeight = 180;
    const cardMargin = 16;
    const padding = 24;
    const footerHeight = 60;

    // 완료된 미션이 있을 때만 카드 영역 계산
    const cardsAreaHeight =
      completedLanguages.length > 0
        ? completedLanguages.length * (cardHeight + cardMargin)
        : 100;

    const canvasHeight =
      headerHeight + cardsAreaHeight + footerHeight + padding * 2;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

    // 배경 그라데이션
    const bgGradient = ctx.createLinearGradient(
      0,
      0,
      canvasWidth,
      canvasHeight,
    );
    bgGradient.addColorStop(0, "#0d0d0d");
    bgGradient.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 상단 장식 그라데이션 라인
    const topGradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
    topGradient.addColorStop(0, "#e91e63");
    topGradient.addColorStop(0.5, "#ff5722");
    topGradient.addColorStop(1, "#ff9800");
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, canvasWidth, 4);

    // 헤더 영역
    let y = padding + 20;

    // 타이틀
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("2026 강청 겨울 수련회", canvasWidth / 2, y);
    y += 36;

    // 부제목
    ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#a3a3a3";
    ctx.fillText("LOVE in Action - 사랑의 언어 도장판", canvasWidth / 2, y);
    y += 40;

    // 사용자 이름 & 진행률
    const completedCount = getCompletedCount();
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#e91e63";
    ctx.fillText(
      `${state.userName}님의 도장: ${completedCount}/5개 🎉`,
      canvasWidth / 2,
      y,
    );
    y += 50;

    // 완료된 미션 카드들
    if (completedLanguages.length > 0) {
      for (const lang of completedLanguages) {
        const data = state.stampData[lang.id];

        // 카드 배경
        const cardX = padding;
        const cardY = y;
        const cardWidth = canvasWidth - padding * 2;

        // 카드 그라데이션 테두리 효과
        const cardGradient = ctx.createLinearGradient(
          cardX,
          cardY,
          cardX + cardWidth,
          cardY,
        );
        cardGradient.addColorStop(0, "#e91e63");
        cardGradient.addColorStop(0.5, "#ff5722");
        cardGradient.addColorStop(1, "#ff9800");
        ctx.fillStyle = cardGradient;
        roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 12, true);

        // 카드 내부 배경
        ctx.fillStyle = "#1a1a1a";
        roundRect(
          ctx,
          cardX + 2,
          cardY + 2,
          cardWidth - 4,
          cardHeight - 4,
          10,
          true,
        );

        // 왼쪽: 텍스트 정보
        const textX = cardX + 20;
        let textY = cardY + 35;

        // 이모지 + 사랑의 언어 이름
        ctx.textAlign = "left";
        ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${lang.emoji} ${lang.name}`, textX, textY);
        textY += 32;

        // 대상자
        ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "#e91e63";
        ctx.fillText(`To. ${data.targetName}`, textX, textY);
        textY += 28;

        // 미션 내용 (긴 텍스트 줄바꿈)
        ctx.fillStyle = "#a3a3a3";
        ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
        const missionText = lang.missions[data.selectedMission];
        const maxTextWidth = data.photoData ? cardWidth - 160 : cardWidth - 50;
        const wrappedText = wrapText(ctx, missionText, maxTextWidth);
        for (const line of wrappedText) {
          ctx.fillText(line, textX, textY);
          textY += 20;
        }

        // COMPLETE 뱃지
        ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, sans-serif";
        const badgeGradient = ctx.createLinearGradient(
          textX,
          textY + 5,
          textX + 80,
          textY + 5,
        );
        badgeGradient.addColorStop(0, "#e91e63");
        badgeGradient.addColorStop(1, "#ff5722");
        ctx.fillStyle = badgeGradient;
        roundRect(ctx, textX, textY + 5, 80, 24, 12, true);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("COMPLETE", textX + 40, textY + 21);
        ctx.textAlign = "left";

        // 오른쪽: 사진 (있는 경우)
        if (data.photoData) {
          try {
            const img = await loadImage(data.photoData);
            const photoSize = 120;
            const photoX = cardX + cardWidth - photoSize - 20;
            const photoY = cardY + (cardHeight - photoSize) / 2;

            // 사진 테두리
            ctx.fillStyle = "#333333";
            roundRect(
              ctx,
              photoX - 2,
              photoY - 2,
              photoSize + 4,
              photoSize + 4,
              10,
              true,
            );

            // 사진 클리핑
            ctx.save();
            roundRect(ctx, photoX, photoY, photoSize, photoSize, 8, false);
            ctx.clip();

            // 이미지 그리기 (중앙 정렬, 비율 유지)
            const scale = Math.max(
              photoSize / img.width,
              photoSize / img.height,
            );
            const imgWidth = img.width * scale;
            const imgHeight = img.height * scale;
            const imgX = photoX + (photoSize - imgWidth) / 2;
            const imgY = photoY + (photoSize - imgHeight) / 2;
            ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
            ctx.restore();
          } catch (e) {
            console.error("Failed to load photo:", e);
          }
        }

        y += cardHeight + cardMargin;
      }
    } else {
      // 완료된 미션이 없는 경우
      ctx.textAlign = "center";
      ctx.fillStyle = "#666666";
      ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("아직 완료한 미션이 없습니다", canvasWidth / 2, y + 30);
      y += 80;
    }

    // 하단 푸터
    y = canvasHeight - 30;
    ctx.textAlign = "center";
    ctx.fillStyle = "#666666";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(
      "강남중앙침례교회 청년부 | LOVE in Action",
      canvasWidth / 2,
      y,
    );

    return canvas;
  };

  /**
   * 둥근 사각형 그리기 헬퍼
   */
  const roundRect = (ctx, x, y, width, height, radius, fill) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
  };

  /**
   * 텍스트 줄바꿈 헬퍼
   */
  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split("");
    const lines = [];
    let currentLine = "";

    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.slice(0, 3); // 최대 3줄
  };

  /**
   * 이미지 로드 Promise
   */
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const updateShareButton = () => {
    const completedCount = getCompletedCount();
    const MIN_STAMPS_TO_SHARE = 1;
    elements.floatingShareBtn.disabled = completedCount < MIN_STAMPS_TO_SHARE;
    updateShareButtonShake();
  };

  const getTodayKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const hasSharedToday = () => {
    return localStorage.getItem("last_share_date") === getTodayKey();
  };

  const updateShareButtonShake = () => {
    const wrapper = document.querySelector(".floating-share-wrapper");
    if (!wrapper || !elements.floatingShareBtn) return;

    const isEnabled = !elements.floatingShareBtn.disabled;
    const notSharedToday = !hasSharedToday();

    if (isEnabled && notSharedToday) {
      wrapper.classList.add("shake-active");
    } else {
      wrapper.classList.remove("shake-active");
    }
  };

  const handleShare = async () => {
    showToast("이미지 생성 중...");

    try {
      // 도장판 이미지 생성
      const canvas = await generateShareImage();

      // Canvas를 Blob으로 변환 (JPEG로 변경 - 호환성 향상)
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9),
      );
      const file = new File([blob], "사랑의언어_도장판.jpg", {
        type: "image/jpeg",
      });

      // Web Share API (파일 공유) 지원 확인
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
          });
          localStorage.setItem("last_share_date", getTodayKey());
          updateShareButtonShake();
        } catch (error) {
          if (error.name !== "AbortError") {
            // 공유 취소가 아닌 경우 다운로드로 대체
            downloadImage(canvas);
          }
        }
      } else {
        // 파일 공유 미지원 시 다운로드
        showToast("파일 공유 미지원 - 다운로드합니다");
        downloadImage(canvas);
      }
    } catch (error) {
      console.error("Share error:", error);
      showToast("이미지 생성에 실패했습니다");
    }
  };

  /**
   * 이미지 다운로드 (공유 미지원 시)
   */
  const downloadImage = (canvas) => {
    const link = document.createElement("a");
    link.download = `사랑의언어_도장판_${state.userName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    localStorage.setItem("last_share_date", getTodayKey());
    updateShareButtonShake();
    showToast("이미지가 저장되었습니다! 카카오톡에서 공유해보세요 📸");
  };

  // ==========================================================================
  // Navigation Functions
  // ==========================================================================

  const handleMainTabChange = (tab) => {
    state.currentMainTab = tab;

    elements.mainTabs.forEach((t) => {
      t.classList.toggle("main-tab--active", t.dataset.tab === tab);
    });

    if (tab === "stamp") {
      elements.stampSection.style.display = "";
      elements.timetableSection.style.display = "none";
    } else {
      elements.stampSection.style.display = "none";
      elements.timetableSection.style.display = "";
    }
  };

  const handleBottomNavClick = (tab) => {
    if (tab === "stamp") {
      handleMainTabChange("stamp");
      elements.bottomNavBtns.forEach((btn) => {
        btn.classList.toggle(
          "bottom-nav__btn--active",
          btn.dataset.tab === "stamp",
        );
      });
      const floatingWrapper = document.querySelector(".floating-share-wrapper");
      if (floatingWrapper) floatingWrapper.style.display = "block";
    } else if (tab === "testimony") {
      window.open(GOOGLE_FORMS.testimony, "_blank");
    } else if (tab === "survey") {
      window.open(GOOGLE_FORMS.survey, "_blank");
    }
  };

  // ==========================================================================
  // Data Loading Functions
  // ==========================================================================

  const loadData = async () => {
    try {
      const response = await fetch("./data/missions.json");
      if (response.ok) {
        const data = await response.json();
        state.loveLanguages = data.loveLanguages || [];
        state.timetable = data.timetable || [];
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      state.loveLanguages = [];
      state.timetable = [];
    }

    renderStamps();
    renderTimetable();
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

    loadState();
    loadData();
    startTimetableUpdater();
  };

  const checkExistingUser = () => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      state.userName = savedName;
      showApp();
    }
  };

  // ==========================================================================
  // Bootstrap Functions
  // ==========================================================================

  const cacheElements = () => {
    // Intro
    elements.intro = document.getElementById("intro");
    elements.userNameInput = document.getElementById("userName");
    elements.startBtn = document.getElementById("startBtn");

    // App
    elements.app = document.getElementById("app");
    elements.header = document.getElementById("header");

    // Notices
    elements.beforeStartNotice = document.getElementById("beforeStartNotice");
    elements.missionEndedNotice = document.getElementById("missionEndedNotice");

    // Main tabs
    elements.mainTabs = Array.from(document.querySelectorAll(".main-tab"));

    // Stamp section
    elements.stampSection = document.getElementById("stampSection");
    elements.stampContainer = document.getElementById("stampContainer");

    // Timetable section
    elements.timetableSection = document.getElementById("timetableSection");
    elements.timetableContainer = document.getElementById("timetableContainer");

    // Modal
    elements.modal = document.getElementById("missionModal");
    elements.modalTitle = document.getElementById("modalTitle");
    elements.targetNameInput = document.getElementById("targetName");
    elements.missionOptions = document.getElementById("missionOptions");
    elements.modalClose = document.getElementById("modalClose");
    elements.modalCancel = document.getElementById("modalCancel");
    elements.modalConfirm = document.getElementById("modalConfirm");
    elements.modalBackdrop = document.querySelector(".modal__backdrop");

    // Navigation
    elements.bottomNavBtns = Array.from(
      document.querySelectorAll(".bottom-nav__btn"),
    );
    elements.floatingShareBtn = document.getElementById("floatingShareBtn");
  };

  const bindEvents = () => {
    elements.startBtn.addEventListener("click", handleStart);

    elements.userNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleStart();
    });

    // Main tabs
    elements.mainTabs.forEach((tab) => {
      tab.addEventListener("click", () => handleMainTabChange(tab.dataset.tab));
    });

    // Bottom nav
    elements.bottomNavBtns.forEach((btn) => {
      btn.addEventListener("click", () =>
        handleBottomNavClick(btn.dataset.tab),
      );
    });

    // Share button
    if (elements.floatingShareBtn) {
      elements.floatingShareBtn.addEventListener("click", handleShare);
    }

    // Modal
    elements.modalClose.addEventListener("click", closeModal);
    elements.modalCancel.addEventListener("click", closeModal);
    elements.modalConfirm.addEventListener("click", handleModalConfirm);
    elements.modalBackdrop.addEventListener("click", closeModal);
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
