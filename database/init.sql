-- PostgreSQL database initialization script for FeedS

CREATE TYPE user_role AS ENUM ('etudiant', 'personnel', 'admin');
CREATE TYPE feedback_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    nom VARCHAR NOT NULL,
    prenom VARCHAR NOT NULL,
    date_naissance DATE NOT NULL,
    role user_role DEFAULT 'etudiant' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id),
    status feedback_status DEFAULT 'open',
    priority priority DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    feedback_id INTEGER REFERENCES feedbacks(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    feedback_id INTEGER REFERENCES feedbacks(id) ON DELETE CASCADE,
    filename VARCHAR NOT NULL,
    filepath VARCHAR NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE activity_type AS ENUM (
    'login', 'logout', 'feedback_created', 'feedback_updated', 'feedback_assigned',
    'feedback_resolved', 'user_created', 'user_updated', 'user_deleted',
    'password_changed', 'profile_updated', 'category_created', 'category_updated',
    'category_deleted', 'notification_sent', 'file_uploaded', 'search_performed', 'admin_action'
);

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    activity_type activity_type NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR,
    user_agent VARCHAR,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_category_id ON feedbacks(category_id);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_attachments_feedback_id ON attachments(feedback_id);
CREATE INDEX idx_responses_feedback_id ON responses(feedback_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_matricule ON users(matricule);
CREATE INDEX idx_users_role ON users(role);