/**
 * Group Search Page
 * 조 확인 페이지 로직
 */

(function () {
  // State
  let groupsData = null;

  // DOM Elements
  const searchNameInput = document.getElementById("searchName");
  const searchPhoneInput = document.getElementById("searchPhone");
  const searchBtn = document.getElementById("searchBtn");
  const resultContainer = document.getElementById("groupResult");
  const errorContainer = document.getElementById("groupError");
  const loadingContainer = document.getElementById("groupLoading");

  // Groups data JSON file path
  const GROUPS_DATA_PATH = "../data/groups.json";

  /**
   * 로딩 상태 표시
   */
  function showLoading() {
    loadingContainer.classList.add("group-loading--visible");
    searchBtn.disabled = true;
  }

  /**
   * 로딩 상태 숨김
   */
  function hideLoading() {
    loadingContainer.classList.remove("group-loading--visible");
    searchBtn.disabled = false;
  }

  /**
   * 그룹 데이터 로드 (정적 JSON 파일에서)
   */
  async function loadGroupsData() {
    showLoading();
    try {
      const response = await fetch(GROUPS_DATA_PATH);
      if (!response.ok) throw new Error("Failed to load groups data");
      groupsData = await response.json();
    } catch (error) {
      console.error("Error loading groups data:", error);
    } finally {
      hideLoading();
    }
  }

  /**
   * 전화번호 뒤 4자리 추출
   */
  function getLastFourDigits(phone) {
    const digits = phone.replace(/[^0-9]/g, "");
    return digits.slice(-4);
  }

  /**
   * 이름과 전화번호 뒤 4자리로 조 검색
   */
  function findGroup(name, phone) {
    if (!groupsData || !groupsData.groups) return null;

    for (const group of groupsData.groups) {
      const member = group.members.find(
        (m) => m.name === name && getLastFourDigits(m.phone) === phone,
      );
      if (member) {
        return {
          group,
          member,
        };
      }
    }
    return null;
  }

  /**
   * 결과 렌더링
   */
  function renderResult(result, searchName) {
    const { group, member: searchedMember } = result;

    const membersHTML = group.members
      .map((member) => {
        const isMe = member.name === searchName;
        const isLeader = member.name === group.leader;
        const meClass = isMe ? " group-card__member--me" : "";

        return `
          <div class="group-card__member${meClass}">
            <div class="group-card__member-icon">${member.name.charAt(0)}</div>
            <span class="group-card__member-name">${member.name}</span>
            ${isLeader ? '<span class="group-card__member-badge">조장</span>' : ""}
          </div>
        `;
      })
      .join("");

    // 방 배정 정보 (있을 경우에만 표시)
    const roomHTML = searchedMember.room
      ? `<p class="group-card__room">방 배정: <strong>${searchedMember.room}</strong></p>`
      : "";

    resultContainer.innerHTML = `
      <div class="group-card">
        <div class="group-card__header">
          <div class="group-card__number">${group.name}</div>
          <p class="group-card__leader">조장: <strong>${group.leader}</strong></p>
          ${roomHTML}
        </div>
        <div class="group-card__body">
          <p class="group-card__section-title">조원 명단</p>
          <div class="group-card__members">
            ${membersHTML}
          </div>
        </div>
      </div>
    `;

    resultContainer.classList.add("group-result--visible");
    errorContainer.classList.remove("group-error--visible");

    // 결과 영역으로 스크롤
    resultContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * 에러 표시
   */
  function showError() {
    resultContainer.classList.remove("group-result--visible");
    errorContainer.classList.add("group-error--visible");

    // 에러 영역으로 스크롤
    errorContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * 검색 실행
   */
  function handleSearch() {
    const name = searchNameInput.value.trim();
    const phone = searchPhoneInput.value.trim();

    // 유효성 검사
    if (!name) {
      searchNameInput.focus();
      return;
    }
    if (!phone || phone.length !== 4 || !/^\d{4}$/.test(phone)) {
      searchPhoneInput.focus();
      return;
    }

    // 검색
    const result = findGroup(name, phone);

    if (result) {
      renderResult(result, name);
    } else {
      showError();
    }
  }

  /**
   * 이벤트 바인딩
   */
  function bindEvents() {
    searchBtn.addEventListener("click", handleSearch);

    // Enter 키로 검색
    searchNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchPhoneInput.focus();
      }
    });

    searchPhoneInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    });

    // 숫자만 입력 허용
    searchPhoneInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    });
  }

  /**
   * 초기화
   */
  async function init() {
    await loadGroupsData();
    bindEvents();
  }

  // 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
