-- ============================================
-- V2: Seed Default Data
-- ============================================

-- ── Insert Default Roles ──
INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN', 'System administrator with full access'),
    ('ROLE_DOCTOR', 'Medical professional who can manage patients and reports'),
    ('ROLE_PATIENT', 'Patient who can view their own data and reports');

-- ── Insert Default Admin User (password: Admin@123) ──
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, email_verified, status)
VALUES (
    uuid_generate_v4(),
    'admin@cardiovision.ai',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System',
    'Admin',
    '+1234567890',
    TRUE,
    'ACTIVE'
);

-- ── Assign Admin Role ──
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@cardiovision.ai' AND r.name = 'ROLE_ADMIN';

-- ── Insert Default Settings ──
INSERT INTO settings (key, value, description, category) VALUES
    ('app.name', 'CardioVision AI', 'Application name', 'general'),
    ('app.version', '1.0.0', 'Application version', 'general'),
    ('app.default_model', 'random_forest', 'Default prediction model', 'ai'),
    ('app.max_upload_size', '52428800', 'Maximum file upload size in bytes', 'storage'),
    ('app.ocr_enabled', 'true', 'Enable OCR processing', 'ai'),
    ('app.notification_enabled', 'true', 'Enable notifications', 'notification'),
    ('app.max_login_attempts', '5', 'Maximum failed login attempts before lock', 'security'),
    ('app.lock_duration_minutes', '30', 'Account lock duration in minutes', 'security');

-- ── Insert Default Model Versions ──
INSERT INTO model_versions (model_name, version, accuracy, precision_val, recall_val, f1_score, auc_roc, is_active, description) VALUES
    ('random_forest', '1.0.0', 0.8950, 0.8800, 0.9100, 0.8947, 0.9200, TRUE, 'Random Forest classifier for cardiac risk prediction'),
    ('xgboost', '1.0.0', 0.9100, 0.9000, 0.9200, 0.9099, 0.9400, TRUE, 'XGBoost gradient boosting for cardiac risk prediction'),
    ('neural_network', '1.0.0', 0.8700, 0.8600, 0.8800, 0.8699, 0.9000, TRUE, 'Deep neural network for cardiac risk prediction'),
    ('heart_age', '1.0.0', NULL, NULL, NULL, NULL, NULL, TRUE, 'Heart age regression model');
