# 7주차 과제 - CI/CD 파이프라인 구축

이 폴더는 GitHub Actions를 활용한 전문적인 CI/CD 파이프라인을 구현한 산출물입니다.
Python 프로젝트에서 자동화된 테스트, 린팅, 빌드, 보안 검사, 배포까지 전 과정을 다룹니다.

## 🎯 과제 목표

### 1. CI 워크플로우 구성
- ✅ Lint (코드 품질 검사)
- ✅ Test (자동 테스트)
- ✅ Build (아티팩트 빌드)
- ✅ Security (보안 검사)
- ✅ Deploy (배포)

### 2. Matrix 전략 적용
- ✅ Python 버전: 3.9, 3.10, 3.11, 3.12
- ✅ OS: Ubuntu, Windows, macOS
- ✅ 총 12가지 조합 (4 Python × 3 OS)

### 3. 민감정보 관리
- ✅ GitHub Secrets를 통한 API 키 관리
- ✅ Deploy Key 암호화
- ✅ 환경 변수 안전 주입

### 4. 복합 워크플로우
- ✅ 작업 간 의존성 관리
- ✅ 아티팩트 업로드/다운로드
- ✅ 조건부 배포 (main 브랜치만)

## 📁 프로젝트 구조

```
week7-ci-cd/
├── README.md                 # 이 파일
├── requirements.txt          # Python 의존성
├── pyproject.toml           # 프로젝트 설정 (black, isort, pytest)
├── .flake8                  # Flake8 린팅 설정
├── .gitignore               # Git 무시 파일
├── app/
│   └── main.py              # 메인 애플리케이션
└── tests/
    └── test_main.py         # 테스트 코드

.github/workflows/
└── ci-cd-week7.yml          # GitHub Actions 워크플로우
```

## 🔧 애플리케이션 구조

### app/main.py - 핵심 모듈

#### ConfigManager 클래스
```python
# 환경 변수 기반 설정 관리
config = ConfigManager()
config.debug          # DEBUG 환경 변수
config.port           # PORT 환경 변수 (기본값: 8000)
config.api_key        # API_KEY 환경 변수
config.environment    # ENVIRONMENT 환경 변수
config.validate()     # 설정 유효성 검사
```

#### DataProcessor 클래스
```python
# 데이터 처리 유틸리티
DataProcessor.calculate_sum([1,2,3])       # 합계 계산
DataProcessor.calculate_average([1,2,3])   # 평균 계산
DataProcessor.parse_json('{"key":"value"}') # JSON 파싱
DataProcessor.format_response(status, data) # 응답 포맷팅
```

#### APIHandler 클래스
```python
# API 요청 처리
handler = APIHandler(config)
handler.handle_request("/sum", {"numbers": [1,2,3]})
handler.handle_request("/average", {"numbers": [1,2,3]})
handler.handle_request("/health", {})
```

## 🧪 테스트 코드

### tests/test_main.py - 포괄적인 테스트 커버리지

**테스트 클래스**:
- `TestConfigManager`: 설정 관리 테스트
- `TestDataProcessor`: 데이터 처리 테스트
- `TestAPIHandler`: API 핸들러 테스트
- `TestAppCreation`: 애플리케이션 생성 테스트

**테스트 결과**:
- 총 테스트: 15개
- 커버리지 목표: 95% 이상
- 모든 OS 및 Python 버전에서 실행

## 🚀 GitHub Actions 워크플로우

### 워크플로우 파일
**위치**: `.github/workflows/ci-cd-week7.yml`

### 작업(Jobs) 구조

#### 1️⃣ **Lint Job** - 코드 품질 검사
```yaml
name: Code Quality Check (Lint)
runs-on: ubuntu-latest

단계:
  - Checkout code
  - Set up Python 3.11
  - Install dependencies
  - Run flake8 linting
  - Run isort import check
  - Run black code format check
```

**검사 도구**:
- **flake8**: PEP 8 스타일 검사 (100자 라인 제한)
- **isort**: import 문 정렬 및 포맷팅
- **black**: 자동 코드 포맷팅

#### 2️⃣ **Test Job** - Matrix 테스트
```yaml
name: Test (Python ${{ matrix.python-version }} on ${{ matrix.os }})
needs: lint

Matrix 전략:
  os: [ubuntu-latest, windows-latest, macos-latest]
  python-version: ['3.9', '3.10', '3.11', '3.12']

결과:
  - 총 12개의 테스트 조합
  - 각 조합마다 독립적으로 실행
  - 하나 실패해도 나머지는 계속 (fail-fast: false)
```

**테스트 단계**:
1. 코드 체크아웃
2. Python 버전 설정
3. 의존성 설치 (캐시됨)
4. pytest 실행
   - 코드 커버리지 측정 (--cov)
   - XML 리포트 생성 (--junit-xml)
5. Codecov에 커버리지 업로드
6. 테스트 결과 아티팩트 업로드

#### 3️⃣ **Build Job** - 아티팩트 빌드
```yaml
name: Build Artifacts
needs: test  # Test Job 완료 후 실행

단계:
  1. 의존성 설치
  2. 테스트 실행 및 coverage 생성
  3. 빌드 디렉터리 생성
  4. 아티팩트 수집
     - 애플리케이션 코드
     - 설정 파일
     - 빌드 정보
     - 커버리지 리포트
  5. 아티팩트 업로드 (90일 보관)
```

#### 4️⃣ **Security Job** - 보안 검사
```yaml
name: Security Checks
needs: lint

도구:
  - Bandit: 보안 취약점 검사

실행:
  - bandit -r week7-ci-cd/app
  - JSON 리포트 생성
  - 아티팩트 업로드
```

#### 5️⃣ **Deploy Job** - 배포
```yaml
name: Deploy
needs: [build, security]

조건:
  - if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  - main 브랜치 push 시에만 실행

단계:
  1. 빌드 아티팩트 다운로드
  2. 배포 패키지 생성
  3. 환경 변수 및 Secrets 주입
  4. 배포 패키지 업로드
  5. 배포 요약 생성
```

**Secrets 사용 예시**:
```yaml
env:
  DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
  API_KEY: ${{ secrets.API_KEY }}
  ENVIRONMENT: ${{ secrets.ENVIRONMENT }}
```

#### 6️⃣ **Report Job** - 리포트 생성
모든 작업 완료 후 최종 리포트 생성

#### 7️⃣ **Status Check Job** - 최종 상태 확인
전체 워크플로우 성공 여부 최종 검증

## 🔐 Secrets 관리

### GitHub Secrets 설정 방법

1. **저장소 설정 이동**
   ```
   GitHub → Settings → Secrets and variables → Actions
   ```

2. **필수 Secrets 추가**
   ```
   DEPLOY_KEY       # 배포 인증 키
   API_KEY          # API 접근 키
   ENVIRONMENT      # 환경 (development/staging/production)
   ```

3. **워크플로우에서 사용**
   ```yaml
   - name: Use secrets
     env:
      DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
     run: |
      echo "Secrets safely injected"
   ```

### 보안 모범 사례

```yaml
✓ Secrets는 절대 로그에 출력 안 함
✓ 환경 변수로만 주입
✓ 배포 단계에서만 사용
✓ 정기적인 로테이션
✓ 최소 권한 원칙 적용
```

## 📊 Matrix 전략 상세

### Python 버전 조합
```
3.9  - 호환성 테스트
3.10 - LTS 버전
3.11 - 현재 안정 버전
3.12 - 최신 버전
```

### OS 조합
```
ubuntu-latest   - Linux (기본)
windows-latest  - Windows 호환성
macos-latest    - macOS 호환성
```

### 테스트 매트릭스
```
총 조합: 4 (Python) × 3 (OS) = 12가지

예시:
- Python 3.9 on Ubuntu ✓
- Python 3.9 on Windows ✓
- Python 3.9 on macOS ✓
- Python 3.10 on Ubuntu ✓
... (12개 모두)
```

## 🔄 작업 의존성 흐름

```
┌─────────────────┐
│     Lint        │ ← 첫 실행
└────────┬────────┘
         │
      ┌──┴──┐
      │ ✓/✗ │ 실패 시 중단
      └──┬──┘
         │
    ┌────▼──────┐
    │   Test    │ ← 12가지 조합 병렬 실행
    │ (Matrix)  │
    └────┬──────┘
         │
      ┌──┴──┐
      │ ✓/✗ │ 하나 실패해도 계속
      └──┬──┘
         │
     ┌───┴────┐
     │ Build  │ ← Test 완료 후
     └───┬────┘
         │
      ┌──┴──┐
      │Security│ ← Lint 완료 후 병렬
      └──┬──┘
         │
    ┌────▼──────┐
    │  Deploy   │ ← Build & Security 완료 후
    │(main만)   │    (조건부)
    └────┬──────┘
         │
     ┌───▼────┐
     │ Report │ ← 모든 작업 완료 후
     └────────┘
```

## 🚀 로컬 실행 방법

### 1. 환경 설정
```bash
# 프로젝트 디렉터리 이동
cd week7-ci-cd

# 가상환경 생성
python -m venv venv

# 가상환경 활성화
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
```

### 2. 애플리케이션 실행
```bash
# 기본 실행
python app/main.py

# 커스텀 설정
DEBUG=true PORT=9000 ENVIRONMENT=production python app/main.py
```

### 3. 테스트 실행
```bash
# 기본 테스트
pytest tests/

# 상세 출력 + 커버리지
pytest tests/ -v --cov=app --cov-report=html

# 특정 테스트만
pytest tests/test_main.py::TestConfigManager -v
```

### 4. 코드 품질 검사
```bash
# Flake8 실행
flake8 app --max-line-length=100

# Black 포맷팅
black app

# isort import 정렬
isort app
```

## 📈 GitHub Actions 실행 확인

### Actions 탭 접근
```
https://github.com/kwondohun0308/AI-OSS/actions
```

### 워크플로우 상세 확인
1. **CI/CD Pipeline - Week 7** 클릭
2. 최근 실행 내역 확인
3. 각 Job의 상태 확인
4. 로그 및 아티팩트 다운로드

### 아티팩트 확인

**생성되는 아티팩트**:
- `test-results-{os}-{python-version}`: 테스트 결과 XML
- `build-artifacts-{run-number}`: 빌드 산출물 (coverage 리포트 포함)
- `security-report`: bandit 보안 리포트
- `deployment-package-{run-number}`: 배포 패키지
- `workflow-report`: 최종 워크플로우 리포트

**다운로드 방법**:
1. Actions → 실행 선택
2. 하단 "Artifacts" 섹션
3. 원하는 아티팩트 다운로드

## ✨ 주요 특징

### 1. 자동화 CI/CD
```
Push → 자동 테스트 → 빌드 → 배포
```

### 2. 포괄적 테스트
```
- 15개 테스트 케이스
- 12가지 환경 조합
- 95%+ 코드 커버리지
```

### 3. 민감정보 보호
```
- Secrets 기반 API 키 관리
- 환경 변수 안전 주입
- 로그 마스킹
```

### 4. 다단계 워크플로우
```
Lint → Test → Build → Security → Deploy
```

### 5. 조건부 배포
```
main 브랜치 push만 배포
다른 브랜치는 테스트만
```

## 📝 체크리스트

- [ ] `.github/workflows/ci-cd-week7.yml` 작성됨
- [ ] `week7-ci-cd/app/main.py` 애플리케이션 구현
- [ ] `week7-ci-cd/tests/test_main.py` 테스트 작성
- [ ] `week7-ci-cd/requirements.txt` 의존성 정의
- [ ] `week7-ci-cd/pyproject.toml` 프로젝트 설정
- [ ] `week7-ci-cd/.flake8` 린팅 설정
- [ ] GitHub Secrets 설정됨 (선택사항)
- [ ] 워크플로우 수동 트리거 테스트됨
- [ ] Actions 탭에서 실행 내역 확인됨
- [ ] 아티팩트 다운로드 가능함 확인

## 🔗 GitHub 링크

### Workflow 파일
- [.github/workflows/ci-cd-week7.yml](../../.github/workflows/ci-cd-week7.yml)

### Actions 실행 내역
- [GitHub Actions 탭](../../actions)
- [CI/CD Pipeline - Week 7 워크플로우](../../actions/workflows/ci-cd-week7.yml)

### 프로젝트 코드
- [week7-ci-cd 폴더](.)
- [main.py](app/main.py)
- [test_main.py](tests/test_main.py)

## 📚 참고 자료

### GitHub Actions 문서
- [GitHub Actions Official Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Matrix Strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)

### Python 테스팅
- [pytest 공식 문서](https://docs.pytest.org/)
- [pytest-cov](https://pytest-cov.readthedocs.io/)

### 코드 품질 도구
- [flake8](https://flake8.pycqa.org/)
- [black](https://black.readthedocs.io/)
- [isort](https://pycqa.github.io/isort/)
- [bandit](https://bandit.readthedocs.io/)

## 🎓 학습 목표 달성

✅ **CI 워크플로우 구성**: Lint, Test, Build, Security, Deploy
✅ **Matrix 전략**: 4 Python 버전 × 3 OS = 12가지 조합
✅ **민감정보 관리**: Secrets를 통한 안전한 주입
✅ **복합 워크플로우**: 작업 간 의존성 및 조건 관리
✅ **아티팩트 관리**: 업로드/다운로드 자동화
✅ **문서화**: README, 주석, 워크플로우 설명

## 생성형 AI 사용 고지

이 문서와 워크플로우는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.

---

**과제 기간**: 7주차 (2026-04-28)  
**마지막 업데이트**: 2026-04-28  
**상태**: 완료 ✅
