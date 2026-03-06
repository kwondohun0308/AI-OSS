# TOC (Project Overview)

## 기본 정보 (Basic Info)
- 프로젝트명: 민원한눈
- 개요: 폐쇄망 환경에서 유사 민원 사례를 의미 기반으로 검색하고, 공공기관 표준에 맞는 답변 초안을 생성하는 온프레미스 AI 시스템.
- 동기 (Why): 민원 답변 작성의 반복 업무를 줄이고, 담당자별 품질 편차를 최소화하면서 개인정보 보호 요구를 충족하기 위해.
- 예상 결과물: Streamlit 기반 내부 웹 서비스 + 검색/생성 엔진(FAISS + sLLM) + 온프레미스 배포 패키지(Docker).

## 주요 기능 (Key Features)
- 핵심 기능 1 (Core Feature): 민원 요지 입력 시 FAISS 기반 유사 사례 Top-K 검색
- 핵심 기능 2 (Core Feature): 표준 프롬프트 템플릿을 적용한 답변 초안 자동 생성
- 핵심 기능 3 (Core Feature): 담당자 수정/복사 워크플로우와 운영 로그(권한/감사) 지원

## 기술 스택 (Tech Stack)
- Frontend: Streamlit (관리형 내부 UI)
- Backend: Python (FastAPI or internal service modules), Ollama/ONNX Runtime/TensorRT
- Database: PostgreSQL (메타데이터/로그), FAISS (벡터 인덱스)
- Deployment: Docker (폐쇄망 이식형 패키지), On-Prem Linux Server

## 마일스톤 (Milestones)
- W 1-4: 기획, 요구사항 확정, 데이터 수집 설계, 초기 개발 환경 세팅
- W 5-8: 크롤러/정제 파이프라인 구현, FAISS 검색 MVP, 답변 생성 MVP
- W 9-12: 템플릿 고도화, 모델 최적화(양자화/서빙), 사용자 테스트 및 품질 개선
- W 13-16: 성능 튜닝, 운영 문서화, 배포 패키지 마무리, 최종 발표
