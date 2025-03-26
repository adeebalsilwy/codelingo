-- Drop existing tables and types
DROP TABLE IF EXISTS challenge_options CASCADE;
DROP TABLE IF EXISTS challenge_progress CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS user_course_progress CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS user_subscription CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TYPE IF EXISTS challenge_type CASCADE;

-- Create challenge_type enum
CREATE TYPE challenge_type AS ENUM ('SELECT', 'ASSIST');

-- Create tables with proper constraints
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    image_src TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    video_youtube VARCHAR(255),
    unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE NOT NULL,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    type challenge_type NOT NULL,
    question TEXT NOT NULL,
    explanation TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenge_options (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    correct BOOLEAN NOT NULL,
    image_src TEXT,
    audio_src TEXT,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_progress (
    user_id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL DEFAULT 'User',
    user_image_src TEXT NOT NULL DEFAULT '/mascot.svg',
    active_course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    last_active_unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
    last_lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    hearts INTEGER NOT NULL DEFAULT 5,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_course_progress (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_progress(user_id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    last_active_unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
    last_lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenge_progress (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_subscription (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_price_id TEXT NOT NULL,
    stripe_current_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 