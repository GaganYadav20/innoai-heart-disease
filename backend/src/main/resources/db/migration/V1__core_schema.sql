-- ============================================
-- V1: CardioVision AI - Core Schema
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Roles Table ──
CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    description     VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Users Table ──
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    email_verified  BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token     VARCHAR(255),
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    locked_until    TIMESTAMP WITH TIME ZONE,
    last_login      TIMESTAMP WITH TIME ZONE,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by      UUID
);

-- ── User Roles Junction ──
CREATE TABLE user_roles (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ── Patients Table ──
CREATE TABLE patients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth   DATE,
    gender          VARCHAR(20),
    blood_group     VARCHAR(10),
    height_cm       DECIMAL(5,2),
    weight_kg       DECIMAL(5,2),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    medical_history JSONB DEFAULT '{}',
    allergies       TEXT,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Doctors Table ──
CREATE TABLE doctors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization  VARCHAR(100),
    license_number  VARCHAR(50) UNIQUE,
    hospital        VARCHAR(200),
    department      VARCHAR(100),
    experience_years INTEGER,
    bio             TEXT,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Reports Table ──
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      UUID REFERENCES patients(id),
    doctor_id       UUID REFERENCES doctors(id),
    title           VARCHAR(255),
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_type       VARCHAR(50) NOT NULL,
    file_size       BIGINT,
    ocr_extracted_data JSONB DEFAULT '{}',
    ocr_status      VARCHAR(20) DEFAULT 'PENDING',
    notes           TEXT,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by      UUID REFERENCES users(id)
);

-- ── Predictions Table ──
CREATE TABLE predictions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id       UUID REFERENCES reports(id),
    patient_id      UUID REFERENCES patients(id),
    model_name      VARCHAR(100) NOT NULL,
    model_version   VARCHAR(50) NOT NULL,
    risk_score      DECIMAL(5,4) NOT NULL,
    risk_category   VARCHAR(20) NOT NULL,
    confidence_score DECIMAL(5,4),
    heart_age       INTEGER,
    prediction_time_ms BIGINT,
    shap_values     JSONB DEFAULT '{}',
    lime_values     JSONB DEFAULT '{}',
    feature_importance JSONB DEFAULT '{}',
    input_features  JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    status          VARCHAR(20) DEFAULT 'COMPLETED',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by      UUID REFERENCES users(id)
);

-- ── Prediction Features ──
CREATE TABLE prediction_features (
    id              BIGSERIAL PRIMARY KEY,
    prediction_id   UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    feature_name    VARCHAR(100) NOT NULL,
    feature_value   DECIMAL(10,4),
    importance_score DECIMAL(10,6),
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Audit Logs ──
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       VARCHAR(255),
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    details         JSONB DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Notifications ──
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    type            VARCHAR(50) DEFAULT 'INFO',
    is_read         BOOLEAN DEFAULT FALSE,
    link            VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Model Versions ──
CREATE TABLE model_versions (
    id              BIGSERIAL PRIMARY KEY,
    model_name      VARCHAR(100) NOT NULL,
    version         VARCHAR(50) NOT NULL,
    accuracy        DECIMAL(5,4),
    precision_val   DECIMAL(5,4),
    recall_val      DECIMAL(5,4),
    f1_score        DECIMAL(5,4),
    auc_roc         DECIMAL(5,4),
    file_path       VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    parameters      JSONB DEFAULT '{}',
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by      UUID REFERENCES users(id),
    UNIQUE(model_name, version)
);

-- ── Settings ──
CREATE TABLE settings (
    id              BIGSERIAL PRIMARY KEY,
    key             VARCHAR(100) NOT NULL UNIQUE,
    value           TEXT NOT NULL,
    description     VARCHAR(500),
    category        VARCHAR(50),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Feedback ──
CREATE TABLE feedback (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    prediction_id   UUID REFERENCES predictions(id),
    rating          INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT,
    category        VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Indexes ──
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_reports_patient_id ON reports(patient_id);
CREATE INDEX idx_reports_doctor_id ON reports(doctor_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_predictions_report_id ON predictions(report_id);
CREATE INDEX idx_predictions_patient_id ON predictions(patient_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);
CREATE INDEX idx_predictions_risk_category ON predictions(risk_category);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_model_versions_name ON model_versions(model_name);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
