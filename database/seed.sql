-- Seed data for FeedS database

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Academic', 'Issues related to academic matters'),
('Facilities', 'Campus facilities and infrastructure'),
('IT Services', 'Information technology support'),
('Administration', 'Administrative processes'),
('Other', 'Miscellaneous feedback');

-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@enspd.sn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyOzQq', 'Admin User', 'admin');

-- Insert sample users
INSERT INTO users (email, password_hash, full_name, role) VALUES
('student@enspd.sn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyOzQq', 'Sample Student', 'student'),
('staff@enspd.sn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyOzQq', 'Sample Staff', 'staff');