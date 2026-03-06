# Document: Project Overview

## 기본 정보 (Basic Info)
- 프로젝트명: 민원한눈
- 개요: 폐쇄망 환경에서 공공기관 민원 데이터를 의미 기반으로 검색하고, 표준화된 답변 초안을 생성하는 온프레미스 sLLM 시스템.
- 동기 (Why): 민원 답변 작성의 반복 작업을 줄이고, 담당자별 답변 품질 편차를 완화하며, 개인정보 보호 요구를 만족하기 위해.
- 예상 결과물: Streamlit 기반 내부 웹 UI, FAISS 검색 엔진, sLLM 답변 생성 엔진, Docker 기반 폐쇄망 배포 패키지.

## 주요 기능 (Key Features)
- 핵심 기능 1 (Core Feature): 민원 요지 입력 시 유사 민원-답변 사례 Top-K 의미 검색(FAISS)
- 핵심 기능 2 (Core Feature): 기관 템플릿(요지-근거-안내)을 반영한 답변 초안 자동 생성
- 핵심 기능 3 (Core Feature): 담당자 수정/복사 워크플로우, 접근권한 분리, 감사 로그 기반 운영 지원

## 기술 스택 (Tech Stack)
- Frontend: Streamlit
- Backend: Python, FastAPI(또는 내부 서비스 모듈), Ollama, ONNX Runtime, TensorRT
- Database: PostgreSQL(메타데이터/로그), FAISS(벡터 인덱스)
- Deployment: Docker, On-Prem Linux Server (폐쇄망 환경)

## 마일스톤 (Milestones)
- W 1-4: 요구사항 확정, 데이터 수집/정제 설계, 개발 환경 및 리포지토리 초기 세팅
- W 5-8: 크롤러 및 비식별화 파이프라인 구현, FAISS 검색 MVP, 답변 생성 MVP 구현
- W 9-12: 프롬프트 템플릿 고도화, 모델 최적화(ONNX/TensorRT/Quantization), 사용자 파일럿 테스트
- W 13-16: 성능/안정화 튜닝, 운영 문서화, Docker 배포 패키지 마감, 최종 시연 및 발표
