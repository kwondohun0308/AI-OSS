# AI-OSS

이 저장소는 오픈소스 소프트웨어(OSS) 개발과 협업 문화를 체계적으로 학습하는 학기 과제 공간입니다.
각 주차별로 OSS 개발의 핵심 주제를 다루며, 실무 경험을 쌓을 수 있도록 설계되었습니다.

## 📋 폴더 구성

### 기초 구성 (week 1-3)
- `week1-git-setup`: Git/GitHub 환경 점검 및 체크리스트
- `week1-project-proposal`: 학기 프로젝트 제안서
- `week1-profile-readme`: GitHub Profile README 초안
- `week2-dora-metrics`: DORA 지표 자동 수집, 대시보드, 주간 보고서
- `week3-kanban-project`: Kanban 기반 GitHub Project, 이슈/라벨/마일스톤, 분석 문서

### 협업 및 운영 (week 4-5)
- `week4-pr-workflow`: Feature branch 전략, Conventional Commits, PR 템플릿, CODEOWNERS, 리뷰 가이드
- `week5-wiki-discussions`: Wiki 초안, ADR 템플릿, Discussions/RFC 운영 가이드

### OSS 구조 및 전략 (week 6)
- `week6-oss-inner-source`: OSS 기본 구조 (LICENSE, README, CONTRIBUTING, CODE_OF_CONDUCT), 라이선스 비교 분석, Inner Source 도입 로드맵

### CI/CD 자동화 (week 7)
- `week7-ci-cd`: GitHub Actions CI/CD 파이프라인, Matrix 테스트 (Python 3.9-3.12 × Ubuntu/Windows/macOS), Secrets 민감정보 관리, Build→Test→Deploy 의존성

## 📄 OSS 기본 구조

이 저장소는 완전한 OSS 기본 구조를 갖추고 있습니다:

### 루트 레벨 파일
- **LICENSE**: MIT 라이선스 (최대 자유도, 상업 이용 허용)
- **README.md**: 프로젝트 개요 및 폴더 구성 (이 파일)
- **CONTRIBUTING.md**: 기여 규칙, 커밋 컨벤션, PR 규칙
- **CODE_OF_CONDUCT.md**: 커뮤니티 행동 강령 및 신고 절차

### 깃허브 설정
- **.github/CODEOWNERS**: 코드 소유자 지정 (자동 리뷰 요청)
- **.github/pull_request_template.md**: PR 템플릿 (일관된 양식)

## 🎯 학습 성과

### 개발 역량
- Git/GitHub 숙달 (브랜치 전략, PR, 커밋 컨벤션)
- 코드 리뷰 문화 이해
- CI/CD 자동화 개념
- 문서화의 중요성

### OSS 이해
- 주요 라이선스 비교 분석 (MIT, Apache 2.0, GPL 3.0, BSD 3-Clause)
- OSS 라이선스 선택 기준
- Inner Source 개념 및 도입 전략

### 협업 기술
- 비동기 커뮤니케이션
- 이슈/토론 기반 의사결정
- 다양한 관점의 코드 리뷰
- 투명한 의사결정 문서화 (ADR)

### 조직 운영
- Discussions와 RFC 기반 문화
- Wiki를 통한 지식 축적
- 자동화 워크플로우 설계
- SLA 기반 업무 추적

## 🔗 빠른 시작

### 처음이신 분께
1. [week1-git-setup](week1-git-setup/README.md)에서 Git/GitHub 기초 학습
2. [week1-profile-readme](week1-profile-readme/README.md)에서 GitHub 프로필 작성

### 기여하시는 분께
1. [CONTRIBUTING.md](CONTRIBUTING.md)를 읽고 규칙 확인
2. 브랜치 생성: `git checkout -b feature/your-feature`
3. 커밋 컨벤션 준수: `docs(week6): add description`
4. PR 제출 및 리뷰 대기

### 조직 적용
1. [week6-oss-inner-source/license-analysis.md](week6-oss-inner-source/license-analysis.md)에서 라이선스 선택
2. [week6-oss-inner-source/inner-source-roadmap.md](week6-oss-inner-source/inner-source-roadmap.md)에서 로드맵 수립

## 📚 주요 문서

### 정책 및 가이드
- [CONTRIBUTING.md](CONTRIBUTING.md) - 기여 가이드
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - 커뮤니티 규범
- [.github/CODEOWNERS](.github/CODEOWNERS) - 코드 소유자

### 상세 분석
- [week6-oss-inner-source/license-analysis.md](week6-oss-inner-source/license-analysis.md) - OSS 라이선스 비교
- [week6-oss-inner-source/inner-source-roadmap.md](week6-oss-inner-source/inner-source-roadmap.md) - Inner Source 도입 전략

### 운영 가이드
- [week5-wiki-discussions/README.md](week5-wiki-discussions/README.md) - Wiki/Discussions 운영
- [docs/discussions-category-plan.md](docs/discussions-category-plan.md) - Discussion 카테고리 설계
- [docs/adr/README.md](docs/adr/README.md) - 기술 결정 기록 가이드

## 📊 프로젝트 규모

```
총 과제: 7주차
총 문서: 35개 이상
총 지침: 4개 (LICENSE, README, CONTRIBUTING, CODE_OF_CONDUCT)
활성 팀: 1개 (학습 커뮤니티)
참여 기간: 1학기 (16주)
자동화 파이프라인: GitHub Actions
```

## 🚀 주요 특징

### 투명성
- 모든 결정과 논의가 기록됨 (Discussions, Issues, ADR)
- 코드 리뷰를 통한 지식 공유
- 문서화를 통한 지속성 보장

### 개방성
- 누구나 기여 가능 (fork → PR)
- 다양한 의견과 관점 환영
- 신입도 쉽게 따라올 수 있는 구조

### 문화
- 상호 존중과 신뢰 기반
- 실수는 학습 기회 (피드백 긍정)
- 성과 인정 (CONTRIBUTORS 기록)

## 📈 통계

```
이 저장소의 발전:
Week 1: Git/GitHub 기초 (3개 문서)
Week 2: 자동화 및 대시보드 (7개 문서)
Week 3: 프로젝트 관리 (4개 문서)
Week 4: PR 워크플로우 (4개 문서)
Week 5: Wiki/Discussions (8개 문서)
Week 6: OSS 기본 구조 (8개 문서)
Week 7: CI/CD 자동화 (6개 문서 + 1개 워크플로우)
─────────────────────────────
총계: 40개 이상의 산출물
```

## 📞 지원 및 문의

### 문제 발생 시
1. [Issues](../../issues)에서 기존 문제 확인
2. 없으면 새 Issue 생성 (템플릿 사용)
3. [Discussions](../../discussions)에서 질문

### 제안사항
- [Discussions > Ideas](../../discussions/categories/ideas)에 RFC 형식으로 제안
- 충분한 토론 후 문서화 또는 구현

## 🎓 학습 경로 제안

```
초급 (처음 입문)
├─ week1-git-setup: Git 기초
├─ week1-profile-readme: GitHub 프로필
└─ CONTRIBUTING.md: 기여 규칙 읽기

중급 (기본 이해)
├─ week4-pr-workflow: PR 문화
├─ week5-wiki-discussions: 문서 및 토론
└─ week6-oss-inner-source/license-analysis: 라이선스 이해

고급 (실무 적용)
├─ week2-dora-metrics: 개발 지표
├─ week3-kanban-project: 프로젝트 관리
├─ week6-oss-inner-source/inner-source-roadmap: 조직 적용
└─ week7-ci-cd: CI/CD 자동화 구현
```

## 📝 생성형 AI 사용 고지

**이 저장소의 문서들은 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.**

각 문서의 README.md 또는 첫 부분에 생성형 AI 사용 고지가 명시되어 있습니다.
더 이상의 불이익이나 감점사항은 없습니다.

## 📄 라이선스

이 프로젝트는 **MIT License** 하에 배포됩니다.
자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

### MIT License의 의미
- ✓ 자유로운 사용, 수정, 배포 가능
- ✓ 상업 이용 가능
- ✓ 프라이빗 사용 가능
- ! 저작권 고지와 라이선스 명시만 필수

---

**프로젝트 시작**: 2026-01-06  
**마지막 업데이트**: 2026-04-28  
**현재 상태**: 7주차 완료 (CI/CD 파이프라인 구축)
