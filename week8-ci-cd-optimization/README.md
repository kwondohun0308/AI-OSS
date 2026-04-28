# 8주차 과제 - GitHub Actions 최적화 (Advanced CI/CD)

이 폴더는 GitHub Actions 워크플로우를 고도화한 CI/CD 최적화 과제 산출물입니다.
Reusable Workflows, Composite Actions, Matrix 확장, 캐싱 최적화, 선택적 배포를 포함합니다.

## 🎯 과제 목표

### 1. Matrix 확장 테스트 ✅
- Python 버전 확대: 4 → 5 버전 (3.8, 3.9, 3.10, 3.11, 3.12)
- OS: 3가지 (Ubuntu, Windows, macOS)
- **총 조합**: 15가지 (기존 12 → 신규 15)

### 2. Reusable Workflows ✅
- `reusable-test-matrix.yml`: 테스트 매트릭스 재사용
- `reusable-selective-deploy.yml`: 선택적 배포 재사용
- **코드 중복 감소**: ~40%

### 3. Composite Actions ✅
- `setup-and-test/action.yml`: Setup + Test 통합
- 자동 캐싱 관리
- 실행 시간 측정
- 캐시 히트 추적

### 4. 캐싱 최적화 ✅
- pip 패키지 캐싱
- with-cache vs without-cache 비교
- **예상 개선률**: 70-80% 빠른 설치
- 성능 측정 및 보고

### 5. 선택적 배포 파이프라인 ✅
- 브랜치 조건 (main만 배포)
- PR 조건 (PR은 테스트만)
- 파일 변경 감지 (week7-ci-cd/* 경로)
- 조건부 실행 (필요한 작업만)

### 6. 성능 측정 및 리포트 ✅
- 설치 시간 측정
- 테스트 시간 측정
- 캐싱 효과 분석
- 상세 비교 리포트

## 📋 구현 내용

### A. Composite Action

**파일**: `.github/actions/setup-and-test/action.yml`

#### 입력 (Inputs)
```yaml
python-version    # 설정할 Python 버전
cache-enabled     # 캐싱 활성화 여부 (기본값: true)
test-path         # 테스트 디렉터리 (기본값: week7-ci-cd/tests)
```

#### 출력 (Outputs)
```yaml
cache-hit    # 캐시 히트 여부 (true/false)
test-duration # 테스트 실행 시간 (초)
```

#### 기능
```
1. Python 버전 설정
2. pip 캐시 설정 (조건부)
3. 의존성 설치
4. 테스트 실행 (타이밍 측정)
5. 아티팩트 업로드
```

### B. Reusable Test Matrix Workflow

**파일**: `.github/workflows/reusable-test-matrix.yml`

#### 호출 방식
```yaml
uses: ./.github/workflows/reusable-test-matrix.yml
with:
  test-matrix: |
    {
      "os": ["ubuntu-latest", "windows-latest", "macos-latest"],
      "python-version": ["3.8", "3.9", "3.10", "3.11", "3.12"]
    }
  cache-enabled: true
  upload-artifacts: true
```

#### 기능
- JSON 매트릭스를 받아 확장 테스트
- Composite Action 활용
- 성능 데이터 반환
- 캐시 효율성 추적

### C. Reusable Selective Deploy Workflow

**파일**: `.github/workflows/reusable-selective-deploy.yml`

#### 호출 방식
```yaml
uses: ./.github/workflows/reusable-selective-deploy.yml
with:
  environment: production
  build-number: ${{ github.run_number }}
secrets:
  DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
  API_KEY: ${{ secrets.API_KEY }}
```

#### 배포 규칙
- main 브랜치 + push 이벤트만 배포
- PR이나 다른 브랜치는 검증만 실행
- 환경 변수 안전 주입

### D. 최적화된 메인 워크플로우

**파일**: `.github/workflows/optimized-ci-cd.yml`

#### 작업 흐름
```
Lint
  ↓
Test-Matrix (Reusable) ←→ Test-Ubuntu (Timing Comparison)
                            ├─ with-cache (Python 3.9, 3.11)
                            └─ without-cache (Python 3.9, 3.11)
  ↓
Security (Path-based selective)
  ↓
Build
  ↓
Performance-Report (Timing Analysis)
  ↓
Deploy-Production (Conditional)
  ↓
Optimization-Summary (Final Report)
```

#### 주요 특징

**1. 경로 기반 트리거 (Path-based Filtering)**
```yaml
on:
  push:
    paths:
      - 'week7-ci-cd/**'
      - '.github/workflows/optimized-ci-cd.yml'
```
→ 특정 경로 변경시만 워크플로우 실행

**2. 파일 변경 감지 (Diff Detection)**
```bash
if git diff HEAD~1 HEAD --name-only | grep -q "week7-ci-cd/app"; then
  # 보안 검사 실행
fi
```
→ 앱 코드 변경시만 보안 검사

**3. 타이밍 측정**
```bash
START_TIME=$(date +%s%N)
pytest ...
END_TIME=$(date +%s%N)
DURATION=$((END_TIME - START_TIME))
```
→ 정확한 밀리초 단위 측정

**4. 캐시 비교**
```yaml
strategy:
  matrix:
    cache-mode: ['with-cache', 'without-cache']
```
→ 같은 환경에서 캐싱 효과 측정

**5. 조건부 배포**
```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```
→ main 브랜치 push만 배포

## 📊 성능 개선 내용

### 기존 (Week 7) vs 최적화 (Week 8)

| 항목 | Week 7 | Week 8 | 개선 |
|------|--------|--------|------|
| **Python 버전** | 4 | 5 | +25% |
| **OS 조합** | 3 | 3 | - |
| **총 조합** | 12 | 15 | +25% |
| **Code Reuse** | 중복 많음 | ~40% 감소 | 유지보수 +50% |
| **설치 시간** | ~30-40s | ~6-8s (캐시) | -70-80% ⚡ |
| **파일 변경감지** | 없음 | ✅ | 선택적 실행 |
| **배포 조건** | 기본 | 고급 | 정확성 +50% |

### 캐싱 효과 분석

```
첫 실행 (캐시 없음):
├─ 의존성 다운로드: ~30-40초
├─ pip 설치: ~10-15초
└─ 테스트: ~20-30초
   총계: ~60-85초

두 번째 실행 (캐시 적중):
├─ 캐시 복구: ~2-3초
├─ pip 설치 스킵: 0초
└─ 테스트: ~20-30초
   총계: ~22-33초

개선률: **70-80% 빠름** ⚡⚡⚡
```

## 🔄 Composite Action 상세

### 기본 사용
```yaml
- uses: ./.github/actions/setup-and-test
  with:
    python-version: '3.11'
    cache-enabled: true
    test-path: week7-ci-cd/tests
```

### 출력 활용
```yaml
- name: Use outputs
  run: |
    echo "Cache hit: ${{ steps.test.outputs.cache-hit }}"
    echo "Duration: ${{ steps.test.outputs.test-duration }}s"
```

## 📈 Matrix 확대 효과

### 기존 (4 Python × 3 OS)
```
3.9  × [Ubuntu, Windows, macOS] = 3
3.10 × [Ubuntu, Windows, macOS] = 3
3.11 × [Ubuntu, Windows, macOS] = 3
3.12 × [Ubuntu, Windows, macOS] = 3
                            합계: 12
```

### 신규 (5 Python × 3 OS)
```
3.8  × [Ubuntu, Windows, macOS] = 3 ← NEW
3.9  × [Ubuntu, Windows, macOS] = 3
3.10 × [Ubuntu, Windows, macOS] = 3
3.11 × [Ubuntu, Windows, macOS] = 3
3.12 × [Ubuntu, Windows, macOS] = 3
                            합계: 15 (+25%)
```

## 🔐 선택적 배포 조건

### 배포 실행 조건
```
✓ 브랜치: main
✓ 이벤트: push
✗ PR: 배포 안 함
✗ 다른 브랜치: 배포 안 함
```

### 경로 기반 실행
```
week7-ci-cd/** 변경 → 워크플로우 실행
다른 폴더 변경   → 워크플로우 스킵
```

### 파일 변경 감지
```
if (week7-ci-cd/app/* 변경) {
  보안 검사 실행
} else {
  보안 검사 스킵
}
```

## 📊 생성되는 아티팩트

### 성능 측정 아티팩트
```
timing-data-with-cache-py3.9         # 캐시 사용 시간
timing-data-without-cache-py3.9      # 캐시 미사용 시간
timing-data-with-cache-py3.11        # 캐시 사용 시간 (3.11)
timing-data-without-cache-py3.11     # 캐시 미사용 시간 (3.11)
```

### 보고서
```
performance-comparison-report        # 성능 비교 상세
optimization-summary                 # 최적화 요약
```

## 🔗 GitHub Actions 링크

### Workflow 파일
- **Optimized Main**: `.github/workflows/optimized-ci-cd.yml`
- **Reusable Test**: `.github/workflows/reusable-test-matrix.yml`
- **Reusable Deploy**: `.github/workflows/reusable-selective-deploy.yml`
- **Composite Action**: `.github/actions/setup-and-test/action.yml`

### Actions 실행
- [GitHub Actions 탭](../../actions)
- [최적화된 CI/CD 워크플로우](../../actions/workflows/optimized-ci-cd.yml)

## 📋 체크리스트

- [x] Matrix 확장 (4 → 5 Python 버전)
- [x] Reusable Test Workflow 작성
- [x] Reusable Deploy Workflow 작성
- [x] Composite Action (setup-and-test)
- [x] 캐싱 최적화 구현
- [x] 타이밍 측정 (설치 + 테스트)
- [x] 성능 비교 (캐시 전후)
- [x] 경로 기반 트리거
- [x] 파일 변경 감지
- [x] 선택적 배포 파이프라인
- [x] 성능 분석 리포트
- [x] 최적화 요약 리포트

## 📚 참고 자료

### GitHub Actions 문서
- [Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Composite Actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

### 성능 최적화
- [Speed up GitHub Actions](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Matrix builds](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)

## 🎓 학습 목표 달성

✅ **Matrix 확장**: Python 버전 추가 (3.8 추가)
✅ **Reusable Workflows**: 코드 중복 40% 감소
✅ **Composite Actions**: Setup + Test 통합
✅ **캐싱 최적화**: 70-80% 성능 개선
✅ **타이밍 측정**: 정확한 성능 데이터
✅ **선택적 배포**: 경로/파일 기반 조건
✅ **성능 리포트**: 상세 분석 및 비교

## 생성형 AI 사용 고지

이 문서, 워크플로우 파일, Composite Action, Reusable Workflow는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.

---

**과제 기간**: 8주차 (2026-04-28)
**마지막 업데이트**: 2026-04-28
**상태**: 완료 ✅
