# 🚀 GitHub Actions 배포 가이드

## 📋 배포 워크플로우 개요

이 프로젝트는 두 개의 GitHub Actions 워크플로우를 제공합니다:

### 1. 🚀 **Deploy FCM Application** (`.github/workflows/deploy.yml`)
- **목적**: 프로덕션 배포 및 릴리스
- **트리거**: `main`/`master` 브랜치 푸시, 수동 실행
- **배포 대상**: GitHub Pages, Firebase Hosting

### 2. 🧪 **Test FCM Application** (`.github/workflows/test.yml`)
- **목적**: 코드 품질 검사 및 테스트
- **트리거**: Pull Request, 수동 실행
- **기능**: 린트 검사, 보안 스캔, 호환성 테스트

## 🔧 배포 설정

### 필수 설정

#### 1. GitHub Pages 활성화
1. Repository Settings → Pages
2. Source: **GitHub Actions** 선택
3. Custom domain 설정 (선택사항)

#### 2. Repository Secrets 설정
아래 secrets를 Repository Settings → Secrets and variables → Actions에 추가:

| Secret | 설명 | 필수 여부 |
|--------|------|-----------|
| `FIREBASE_TOKEN` | Firebase CLI 토큰 | Firebase 배포시 필수 |
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | 선택사항 (기본값: fine-bondedwarehouse) |
| `CUSTOM_DOMAIN` | GitHub Pages 커스텀 도메인 | 선택사항 |
| `SLACK_WEBHOOK` | Slack 알림 웹훅 URL | 선택사항 |

### Firebase 토큰 생성 방법

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인 및 토큰 생성
firebase login:ci
```

생성된 토큰을 `FIREBASE_TOKEN` secret에 추가하세요.

## 🚀 배포 옵션

### 수동 배포
1. Actions 탭으로 이동
2. "Deploy FCM Application" 워크플로우 선택
3. "Run workflow" 클릭
4. 배포 대상 선택:
   - `github`: GitHub Pages만 배포
   - `firebase`: Firebase Hosting만 배포
   - `both`: 둘 다 배포 (기본값)

### 자동 배포
- `main` 또는 `master` 브랜치에 코드 푸시 시 자동 실행
- 모든 테스트 통과 후 배포 진행

## 🧪 테스트 워크플로우

### 실행되는 검사
- ✅ **문법 검사**: HTML, JavaScript, JSON 유효성
- ✅ **보안 스캔**: 민감한 정보 탐지
- ✅ **기능 테스트**: FCM 설정, Service Worker 등록
- ✅ **호환성 테스트**: 브라우저 API 지원 확인
- ✅ **코드 품질**: 파일 크기, 복잡도 분석

## 📊 배포 결과

### 성공시 제공 정보
- 📁 빌드된 파일 목록 및 크기
- 🔗 배포된 URL
- 📊 성능 분석 보고서
- ✅ 테스트 결과 요약

### 배포 URL
- **GitHub Pages**: `https://[username].github.io/[repository-name]`
- **Firebase Hosting**: `https://[project-id].web.app`

## 🔍 문제 해결

### 일반적인 오류

#### 1. Firebase 배포 실패
```
Error: Failed to get Firebase project
```
**해결**: `FIREBASE_TOKEN` 및 `FIREBASE_PROJECT_ID` 확인

#### 2. GitHub Pages 배포 실패
```
Error: Resource not accessible by integration
```
**해결**: Repository Settings에서 Actions 권한 확인

#### 3. 빌드 실패
```
Error: File not found
```
**해결**: 모든 소스 파일이 저장소에 포함되었는지 확인

### 로그 확인 방법
1. Actions 탭에서 실패한 워크플로우 클릭
2. 실패한 단계의 로그 확인
3. 🔍 Security Scan 단계에서 상세한 오류 정보 확인

## 📈 성능 최적화

### 현재 번들 크기
- **index.html**: ~11.6 KB
- **fcm-manager.js**: ~5.2 KB  
- **firebase-messaging-sw.js**: ~1.8 KB
- **manifest.json**: ~1.5 KB
- **firebase.json**: ~0.8 KB
- **총 크기**: ~21 KB

### 최적화 권장사항
- 🗜️ JavaScript 압축 (gzip: ~70% 감소)
- 🖼️ 이미지 최적화 (WebP 형식 사용)
- 📦 코드 분할 (중요한 기능 우선 로드)
- 🚀 CDN 활용 (Firebase CDN 자동 적용)

## 🔔 알림 설정

### Slack 알림 (선택사항)
1. Slack에서 Incoming Webhook 생성
2. Webhook URL을 `SLACK_WEBHOOK` secret에 추가
3. 배포 실패시 자동으로 Slack 채널에 알림 전송

## 🌟 고급 기능

### 환경별 배포
- 수동 실행시 배포 대상 선택 가능
- 테스트 건너뛰기 옵션 제공
- 조건부 배포 (브랜치별 다른 동작)

### 보안 기능
- 🔐 민감한 정보 자동 탐지
- 🛡️ 파일 크기 모니터링
- 📊 코드 품질 메트릭 제공

## 📝 배포 체크리스트

### 배포 전 확인사항
- [ ] Firebase 설정 정보 업데이트 완료
- [ ] VAPID 키 설정 완료
- [ ] 모든 테스트 통과
- [ ] README.md 업데이트
- [ ] 버전 번호 확인

### 배포 후 확인사항
- [ ] 웹사이트 정상 접속 확인
- [ ] FCM 토큰 생성 테스트
- [ ] 알림 수신 테스트
- [ ] PWA 설치 테스트
- [ ] 모바일 호환성 확인

---

💡 **팁**: 첫 배포 전에 테스트 워크플로우를 실행하여 모든 검사를 통과하는지 확인하세요!
