# NeuroCheck Implementation Plan

The goal is to build "NeuroCheck", a full-stack Parkinson's disease screening application featuring a React Native mobile app, a Node.js/Express backend, and a Python FastAPI ML microservice.

## User Review Required

> [!WARNING]
> Please review the technology stack and architecture. Are there any specific versions of Expo, Node, or Python you require? 
> For AWS S3 and Redis, we will need local mock configurations or placeholder logic until real credentials/infrastructure are provided. Are you fine with using local storage and a local/mocked Redis for the initial MVP?
> Also, for ML models, we will start with dummy or rule-based models until trained models are provided. Are you okay with this approach for the initial implementation?

## Proposed Architecture

### 1. Backend (Node.js + Express)
- **Directory**: `backend/`
- **Framework**: Express.js with TypeScript
- **ORM**: Prisma for PostgreSQL
- **Caching/Queue**: Redis (using Bull)
- **Functions**: API logic, authentication (JWT/bcrypt), input validation (zod), AWS S3 interactions.

### 2. ML Microservice (FastAPI)
- **Directory**: `ml_service/`
- **Language**: Python
- **Framework**: FastAPI
- **Libraries**: `scikit-learn`, `librosa` (audio features), `pandas`, `numpy`, `scipy`.
- **Function**: Receives structured sensor data, extracts relevant features (FFT, MFCCs, variance), applies models, returns composite risk score.

### 3. Frontend (React Native + Expo)
- **Directory**: `mobile_app/`
- **Framework**: Expo (React Native) + TypeScript
- **Routing**: React Navigation
- **Libraries**: `react-native-svg` (gauge), `expo-sensors` (accelerometer/gyro), `react-native-skia` or `react-native-canvas` (canvas), `expo-av` (audio), `react-native-chart-kit` or `victory-native` (radar).

### Database Schema (Prisma)
- **Models**:
  - `User`: demographics, auth info
  - `TestSession`: links to User, timestamp, overall status
  - `TestResult`: specific module results per session, S3 pathways, raw metrics
  - `RiskScore`: overall & per-test scores for a session
  - `ClinicianAccess`: basic access control relationships

## Verification Plan

### Backend Verification
1. Setup a REST API playground or run unit/integration tests with `jest` and `supertest` in the Node environment.
2. We will test user registration, login, test submission points, and results retrieval locally.

### ML Service Verification
1. Use `pytest` or `curl` to send mock data payloads (representing the 8 tests) to the FastAPI endpoint to verify feature extraction routines do not crash and return a score between 0-100.

### Mobile App Verification
1. Run `npx expo start` and verify navigation and UI screens on local Simulator / Emulator.
2. We will need to verify the complex device sensors (DeviceMotion, AudioRecording) which may require running on a physical device. I will implement the code and provide instructions for you to physically test it on your device for these components.

Please let me know if this plan proceeds as expected!
