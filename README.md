# 🫀 CardioVision AI

## Enterprise Cardiac Risk Prediction Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docs.docker.com/compose/)

A production-ready, microservices-based AI-powered cardiac risk prediction platform designed for enterprise healthcare deployment and academic research.

---

## 🏗️ Architecture

```
React 19 Frontend  ──►  Nginx Reverse Proxy  ──►  Spring Boot API (Port 8080)
                                                        │
                                                        ▼
                                                   FastAPI AI Service (Port 8000)
                                                        │
                                                        ▼
                                                   PostgreSQL 16 (Port 5432)
```

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Recharts, Framer Motion, Zustand |
| **Backend** | Spring Boot 3.3, Java 21, Spring Security, JWT, Flyway, OpenAPI/Swagger |
| **AI Service** | FastAPI, Python 3.12, Scikit-learn, XGBoost, TensorFlow, SHAP, LIME |
| **Database** | PostgreSQL 16 with JSONB, UUID, pgcrypto |
| **DevOps** | Docker Compose, Nginx, Multi-stage builds |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for frontend development)
- Java 21 (for backend development)
- Python 3.12 (for AI service development)

### Run with Docker

```bash
git clone <repository>
cd innoai-heart-disease
docker compose up --build
```

Access: http://localhost

### Development Mode

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cardiovision.ai | Admin@123 |

## 📊 Features

- **AI Prediction Engine** — Random Forest, XGBoost, Neural Network models
- **Heart Age Estimation** — Biological vs chronological heart age
- **Explainable AI** — SHAP waterfall plots & LIME explanations
- **OCR Report Scanning** — Extract clinical values from PDF/image reports
- **RBAC Authentication** — Admin, Doctor, Patient roles with JWT
- **Dashboard Analytics** — Real-time charts, risk distribution, trends
- **Report Management** — Upload, download, history with pagination
- **Notification System** — In-app alerts for high-risk predictions
- **Admin Panel** — User management, audit logs, model registry

## 📁 Project Structure

```
innoai-heart-disease/
├── frontend/           # React 19 + TypeScript + Vite
├── backend/            # Spring Boot 3 + Java 21
├── ai-service/         # FastAPI + Python 3.12
├── docker/             # Nginx, PostgreSQL configs
├── docker-compose.yml  # Service orchestration
└── README.md
```

## 📝 License

MIT License — Free for academic and commercial use.
