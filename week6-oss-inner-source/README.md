# 6주차 과제 - OSS 기본 구조 및 Inner Source 로드맵

이 폴더는 OSS(Open Source Software) 기본 구조를 완성하고, 주요 라이선스를 비교 분석해 선택 기준을 정리한 후, 조직 내부 적용을 위한 Inner Source 도입 로드맵을 담은 산출물입니다.

## 목표

1. **OSS 기본 구조 완성**
   - LICENSE: MIT 라이선스 적용
   - README.md: 프로젝트 개요 및 폴더 구성
   - CONTRIBUTING.md: 기여 규칙 및 커밋 컨벤션
   - CODE_OF_CONDUCT.md: 커뮤니티 행동 강령

2. **라이선스 비교 분석**
   - MIT, Apache 2.0, GPL 3.0, BSD 3-Clause 비교
   - 각 라이선스의 특징과 선택 기준 정리

3. **Inner Source 도입 로드맵**
   - 조직 내 OSS 문화 도입 계획
   - 단계별 추진 방안
   - 주요 성공 요인과 고려사항

## 포함 문서

### 루트 레벨
- [LICENSE](../LICENSE): MIT 라이선스 (기존)
- [README.md](../README.md): 프로젝트 개요 (업데이트됨)
- [CONTRIBUTING.md](../CONTRIBUTING.md): 기여 가이드 (기존)
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md): 행동 강령 (신규)

### week6 레벨
- [README.md](README.md): 이 파일
- [license-analysis.md](license-analysis.md): OSS 라이선스 비교 분석
- [inner-source-roadmap.md](inner-source-roadmap.md): Inner Source 도입 로드맵

## 주요 내용

### OSS 기본 구조의 역할

| 파일 | 목적 | 주요 내용 |
|------|------|---------|
| LICENSE | 법적 권리 명시 | 라이선스 타입, 저작권, 사용 조건 |
| README.md | 첫인상 | 프로젝트 개요, 사용 방법, 기여 방법 |
| CONTRIBUTING.md | 기여 규칙 | 커밋 컨벤션, 브랜치 전략, PR 규칙 |
| CODE_OF_CONDUCT.md | 커뮤니티 규범 | 행동 기준, 신고 절차, 제재 방식 |

### 라이선스 선택 기준

```
MIT / BSD 3-Clause
├─ 자유도: 높음
├─ 제약: 낮음
└─ 추천: 상업 친화적, 빠른 채택이 필요한 경우

Apache 2.0
├─ 자유도: 높음 (MIT와 비슷)
├─ 제약: 특허 조항 명시
└─ 추천: 특허 보호가 필요한 경우

GPL 3.0
├─ 자유도: 중간 (상호주의 의무)
├─ 제약: 높음 (파생 코드도 GPL이어야 함)
└─ 추천: 오픈소스 생태계 구축이 목표인 경우
```

### Inner Source란?

**Inner Source**는 조직 내부에서 오픈소스 개발 방식을 적용하는 것입니다.

- **목표**: 부서 간 협업 활성화, 지식 공유, 코드 재사용
- **방법**: 내부 깃 저장소, 자유로운 기여, 코드 리뷰 문화
- **효과**: 개발 속도 향상, 품질 개선, 직원 만족도 증가

## 활용 방법

1. **개인 프로젝트 시작**
   - [LICENSE](../LICENSE)에서 라이선스 선택
   - [README.md](../README.md)에서 프로젝트 개요 작성
   - [CONTRIBUTING.md](../CONTRIBUTING.md)를 커뮤니티에 안내

2. **조직 적용**
   - [license-analysis.md](license-analysis.md)에서 조직에 맞는 라이선스 선택
   - [inner-source-roadmap.md](inner-source-roadmap.md)에서 단계별 도입 계획 수립
   - [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)를 커뮤니티 규범으로 적용

3. **학습 목표 달성**
   - OSS 라이선스의 특징 이해
   - Inner Source 개념과 실무 적용 방법 습득
   - 오픈 문화 기반 협업 환경 구축

## 검증 체크리스트

- [ ] LICENSE 파일이 선택한 라이선스로 설정됨
- [ ] README.md에 프로젝트 개요와 폴더 구성 명시
- [ ] CONTRIBUTING.md에 기여 규칙 상세 기재
- [ ] CODE_OF_CONDUCT.md에 행동 강령 명시
- [ ] license-analysis.md에 주요 라이선스 비교 분석 완료
- [ ] inner-source-roadmap.md에 단계별 로드맵 작성 완료
- [ ] 모든 문서에서 상호 링크 연결 확인

## 관련 참고 자료

### OSS 라이선스
- [choosealicense.com](https://choosealicense.com/)
- [Open Source Initiative](https://opensource.org/licenses/)
- [SPDX License List](https://spdx.org/licenses/)

### Inner Source
- [InnerSource Commons](https://innersourcecommons.org/)
- [Understanding the InnerSource Movement](https://www.oreilly.com/library/view/understanding-the-innersource/9781491034897/)

### 커뮤니티 관리
- [Contributor Covenant](https://www.contributor-covenant.org/)
- [GitHub Community Guidelines](https://docs.github.com/en/site-policy/github-terms/github-community-guidelines)

## 생성형 AI 사용 고지

이 문서는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.

---

**과제 기간**: 6주차 (2026-04-28)  
**마지막 업데이트**: 2026-04-28  
**상태**: 완료
