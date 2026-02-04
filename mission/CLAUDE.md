# CLAUDE.md - AI 개발 가이드

> 이 파일은 Claude Code가 프로젝트를 이해할 때 참고하는 가이드입니다.

---

## 프로젝트 개요

- **프로젝트명**: 겨울 수련회 신청링크 작업
- **목적**: 겨울 수련회를 쉽고, 직관적으로 신청할수 있도록 하기 위함
- **타겟**: 강남중앙침례교회 청년들

---

## 규칙

1. 기술 스택은 `config/mvp-stack.yaml` 참조
2. 디자인 시스템은 `config/design-system.md` 참조
3. 작업 지시문은 `prompt/*.md` 파일로 분리
4. MVP 수준 유지 - 최소 기능으로 빠르게 검증

---

## 작업 지시문 목록

| 파일                          | 설명                 |
| ----------------------------- | -------------------- |
| `prompt/mvp-rules.md`         | MVP 개발 규칙        |
| `prompt/extended-rules.md`    | 확장 단계 개발 규칙  |
| `prompt/create-check-list.md` | 체크리스트 생성 작업 |

---

## 개발 규칙

> 📁 MVP 단계: `prompt/mvp-rules.md` 및 `config/mvp-stack.yaml` 참조

---

## 확장 단계

> ⚠️ MVP 완료 후 확장 시 `prompt/extended-rules.md` 및 `config/extended-stack.yaml` 참조

---

## PWA 전환 계획 (2026-02-06 전 배포)

### 🎯 목표
GitHub Pages 환경에서 기본 PWA + 로컬 알림 구현으로 수련회 현장 환경 대응

### ✅ 포함 사항
- **기본 PWA**: manifest.json, Service Worker, 홈 화면 추가, 오프라인 캐싱
- **로컬 알림**: 타임테이블 기반 일정 알림 (10분 전)
- **설치 유도**: Android 자동 배너, iOS 수동 안내

### ❌ 제외 사항 (Phase 2)
- Firebase FCM (백엔드 필요)
- 복잡한 백그라운드 알림
- iOS Splash Screen

### 📁 생성/수정 파일

**새로 생성:**
1. `/mission/manifest.json` - PWA 메타데이터
2. `/mission/sw.js` - Service Worker (캐싱 전략)
3. `/mission/js/notification-manager.js` - 로컬 알림
4. `/mission/js/install-prompt.js` - 설치 프롬프트
5. `/mission/css/pwa.css` - PWA UI 스타일
6. `/mission/assets/icons/` - 아이콘 디렉토리 (사용자가 PWA Builder로 생성)

**수정:**
1. `/mission/index.html` - 메타태그 + SW 등록
2. `/mission/page/stamp.html` - 메타태그
3. `/mission/page/timetable.html` - 메타태그 + 알림 통합
4. `/mission/page/group.html` - 메타태그

### 🔧 구현 순서
1. 아이콘 생성 (사용자: PWA Builder)
2. manifest.json + Service Worker (PWA 기본)
3. HTML 메타태그 추가 + SW 등록
4. 로컬 알림 매니저 (timetable.html)
5. 설치 프롬프트 (index.html)
6. 테스트 + 배포

### 💡 기술 특징
- **캐싱 전략**
  - HTML/CSS/JS: Cache First (정적 리소스)
  - JSON 데이터: Network First (실시간 업데이트)

- **알림 특성**
  - 앱 활성화 시에만 작동 (로컬 알림)
  - iOS 16.4+ 지원, 미만은 비활성화

- **경로 설정**
  - 모든 절대 경로: `/gangcheong/mission/`로 시작
  - GitHub Pages 서브디렉토리 구조

### 📊 예상 결과
- Lighthouse PWA 점수: 100점
- 오프라인 동작: 완벽 지원
- 수련회 현장 네트워크 약함 대응
- 사용자 참여율 상승 (알림)
