-- ============================================
-- LifeLog Database Schema (PostgreSQL)
-- Auto-generated reference from Prisma
-- Use Prisma migrations for actual database setup
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- DIARY ENTRIES TABLE
-- ============================================
CREATE TABLE diary_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    mood VARCHAR(50) NOT NULL,
    highlight VARCHAR(255),
    gratitude VARCHAR(255),
    expense DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX idx_diary_entries_entry_date ON diary_entries(entry_date);
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, entry_date);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_diary_entries_updated_at 
    BEFORE UPDATE ON diary_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7), -- Hex color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);

-- ============================================
-- ENTRY TAGS (Many-to-Many Join Table)
-- ============================================
CREATE TABLE entry_tags (
    entry_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, tag_id)
);

CREATE INDEX idx_entry_tags_entry_id ON entry_tags(entry_id);
CREATE INDEX idx_entry_tags_tag_id ON entry_tags(tag_id);

-- ============================================
-- ATTACHMENTS TABLE
-- ============================================
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_entry_id ON attachments(entry_id);

-- ============================================
-- HABITS TABLE
-- ============================================
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_user_active ON habits(user_id, is_active);

-- ============================================
-- HABIT LOGS TABLE
-- ============================================
CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, log_date)
);

CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_log_date ON habit_logs(log_date);

-- ============================================
-- SAMPLE QUERIES
-- ============================================

-- Get user's diary entries with tags for a specific date range
-- SELECT 
--     de.id,
--     de.entry_date,
--     de.mood,
--     de.content,
--     de.highlight,
--     de.expense,
--     ARRAY_AGG(t.name) as tags
-- FROM diary_entries de
-- LEFT JOIN entry_tags et ON de.id = et.entry_id
-- LEFT JOIN tags t ON et.tag_id = t.id
-- WHERE de.user_id = 'user-uuid-here'
--     AND de.entry_date BETWEEN '2026-01-01' AND '2026-01-31'
-- GROUP BY de.id
-- ORDER BY de.entry_date DESC;

-- Calculate habit completion rate for a user
-- SELECT 
--     h.name,
--     COUNT(hl.id) FILTER (WHERE hl.is_completed = true) as completed,
--     COUNT(hl.id) as total,
--     ROUND(
--         COUNT(hl.id) FILTER (WHERE hl.is_completed = true)::numeric / 
--         NULLIF(COUNT(hl.id), 0) * 100, 
--         2
--     ) as completion_rate
-- FROM habits h
-- LEFT JOIN habit_logs hl ON h.id = hl.habit_id
-- WHERE h.user_id = 'user-uuid-here'
--     AND hl.log_date >= CURRENT_DATE - INTERVAL '7 days'
-- GROUP BY h.id, h.name;

-- Get user's current logging streak
-- WITH daily_entries AS (
--     SELECT 
--         entry_date,
--         entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date))::integer AS grp
--     FROM diary_entries
--     WHERE user_id = 'user-uuid-here'
-- ),
-- streak_groups AS (
--     SELECT 
--         MIN(entry_date) as streak_start,
--         MAX(entry_date) as streak_end,
--         COUNT(*) as streak_length
--     FROM daily_entries
--     GROUP BY grp
-- )
-- SELECT 
--     streak_length as current_streak
-- FROM streak_groups
-- WHERE streak_end = CURRENT_DATE
-- ORDER BY streak_end DESC
-- LIMIT 1;
