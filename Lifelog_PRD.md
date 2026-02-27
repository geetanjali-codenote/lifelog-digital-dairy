# 📔 Product Requirements Document (PRD)

**Project Name:** LifeLog – Personal Digital Diary & Habit Tracker  
---

## 1. 🎯 Executive Summary & Product Vision

### 1.1 Problem Statement
Maintaining a consistent daily journaling and habit-tracking routine is difficult. Existing applications in the market tend to fall into two extremes: they are either heavily bloated with paywalls, complex social features, and overwhelming interfaces, or they are too simplistic and lack the ability to track related lifestyle data (like habits, expenses, and mood) alongside daily journal entries. Users need a frictionless, unified, and secure platform to capture their daily lives without the cognitive overload.

### 1.2 Product Vision
LifeLog aims to be the ultimate personal companion app for self-reflection and personal growth. By combining a digital diary, mood tracking, financial logging, and habit management into a single, intuitive interface, LifeLog empowers users to gain holistic insights into their daily lives with just 5 minutes of use per day.

### 1.3 Target Audience & Personas
- **"The Self-Improver" (Habit Builders):** Individuals dedicated to personal growth, actively trying to establish and maintain daily routines (e.g., reading, hydrating, exercising).
- **"The Busy Professional":** Users who lack the time for long-form journaling but want to quickly log their mood, track a highlight of the day, and note down minor daily expenses.
- **"The Mindful Reflector":** Mental health-conscious individuals who utilize journaling as a therapeutic tool and wish to visualize their emotional trends over time.

---

## 2. ✨ Core Features & Functional Requirements

### 🔐 2.1 User Authentication & Profile Management
*   **Account Creation:** Users can register using an Email Address and Password. 
*   **Authentication:** Secure login and logout functionality with persistent sessions.
*   **Profile Management:** Users can update their display name, email, and password. Account deletion must be fully supported, ensuring the cascaded deletion of all associated personal data.
*   **Password Recovery:** Standard "Forgot Password" flow utilizing secure email reset links.

### 🏠 2.2 Home Dashboard
*   **Dynamic Welcome Banner:** A time-aware greeting (e.g., *"Good Evening, Alex 👋"*).
*   **Vitals & Statistics:** Display key metrics such as Total Entries, Current Logging Streak, and Weekly Habit Completion Rate.
*   **Recent Activity Feed:** A chronological, stylized feed of the most recent entries, displaying the date, selected mood, and a brief snippet of the journal content.
*   **Primary Action Button:** A highly visible, floating "➕ New Entry" CTA accessible from anywhere on the dashboard.

### 📝 2.3 Comprehensive Diary Entry Management
*   **Date Selection:** Auto-defaults to the current day, but users can backdate entries to fill in missed days.
*   **Mood Tracking:** A categorical selector utilizing core emotional states (e.g., 😀 Great, 🙂 Good, 😐 Neutral, 😔 Sad, 😡 Frustrated).
*   **Rich Journaling:** A multi-line text area for the main diary content.
*   **Daily Highlights:** A dedicated single-line text field for the absolute best moment of the day.
*   **Gratitude Prompt:** A dedicated field for users to practice mindfulness ("Today I am grateful for...").
*   **Daily Expense Tracking (Optional):** A numeric input field to log discretionary daily spending, helping users correlate mood with spending habits.

### 🏷️ 2.4 Tagging & Organization System
*   **Custom Tags:** Users can create personalized tags (e.g., *Travel*, *Work*, *Fitness*, *Family*) to categorize their days.
*   **Multi-Tagging:** Attach multiple tags to a single diary entry.
*   **Advanced Filtering:** The ability to filter the diary feed by an exact tag, allowing users to review specific aspects of their lives over time.

### 🖼️ 2.5 Media Attachments
*   **Photo Uploads:** Users can attach up to 4 images per daily entry to preserve visual memories. 
*   **Image Gallery:** Entries with multiple images will display them in a responsive, swipeable mini-gallery.

### ✅ 2.6 Daily Habit Tracking
*   **Habit Definition:** Users can define personal goals they wish to track daily (e.g., *Drink 2L Water*, *Read 10 Pages*, *Meditate*).
*   **Seamless Integration:** The daily logging form includes a checklist of these active habits, allowing users to mark them as complete simultaneously while writing their diary entry.

---

## 3. 🔄 User Experience & Workflows

### 🚀 Onboarding Journey (New User)
1.  **Landing Page:** User arrives at the visually engaging marketing page highlighting LifeLog's value proposition.
2.  **Registration:** User navigates to `/signup`, enters credentials, and undergoes email format validation.
3.  **Initial Setup:** Upon successful registration, a quick onboarding modal prompts the user to define 1-3 habits they want to start tracking immediately.
4.  **Dashboard:** The user is redirected to the `/dashboard`, which displays an empty state with a clear CTA to "Write Your First Log."

### ✍️ Daily Logging Workflow
1.  **Initiation:** From the `/dashboard`, the user clicks the "➕ New Entry" button.
2.  **Data Entry:** Route updates to `/entry/new`. The user:
    *   Selects a Mood.
    *   Writes their main journal content.
    *   Fills out gratitude and highlight fields.
    *   Uploads a photo of the day.
    *   Checks off completed habits.
3.  **Submission:** User clicks "Save." The system validates the payload, uploads the image to cloud storage, and commits the records to the database.
4.  **Confirmation:** A success notification appears, and the user is routed back to the dashboard where the new entry is instantly visible.

### � Review & Editing Workflow
1.  **Selection:** The user scrolls their feed or filters by a specific tag (e.g., *Travel*).
2.  **Viewing:** Clicking an entry card navigates to `/entry/:id`, presenting a beautifully formatted, read-only view of that day's data.
3.  **Modification:** The user selects "Edit," altering the text or correcting an expense value, and clicks "Update" to save the changes.

---

## 4. 🗄️ Database Architecture (Relational Schema)

The platform utilizes a structured, normalized relational database (PostgreSQL recommended) to maintain data integrity across users, entries, tags, and habits.

### 👤 `users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique user identifier. |
| `name` | Varchar(255) | Not Null | User's display name. |
| `email` | Varchar(255) | Unique, Not Null | Used for authentication. |
| `password_hash`| Text | Not Null | Bcrypt hashed password. |
| `created_at` | Timestamp | Default NOW() | Account creation date. |

### 📓 `diary_entries` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique entry identifier. |
| `user_id` | UUID | Foreign Key (`users.id`) | Links entry to the author. |
| `entry_date`| Date | Default TODAY() | The specific day being logged. |
| `content` | Text | Not Null | Core journal text. |
| `mood` | Varchar(50) | Not Null | Selected mood category. |
| `highlight` | Varchar(255) | Nullable | Best moment of the day. |
| `gratitude` | Varchar(255) | Nullable | What the user is thankful for. |
| `expense` | Decimal(10,2)| Nullable | Financial spend for the day. |
| `created_at`| Timestamp | Auto-generated | System insertion time. |
| `updated_at`| Timestamp | Auto-updates on edit | Last modification time. |

### �️ `tags` & 🔗 `entry_tags` Tables
*   **`tags` Table:** `id` (UUID, PK), `user_id` (UUID, FK), `name` (Varchar 50), `color` (Varchar 7 for UI hex codes).
*   **`entry_tags` Join Table:** Facilitates the Many-to-Many relationship. `entry_id` (FK) and `tag_id` (FK). Composite Primary Key: `(entry_id, tag_id)`.

### �️ `attachments` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique attachment ID. |
| `entry_id` | UUID | Foreign Key (`diary_entries.id`) | Links image to specific entry. |
| `file_url` | Text | Not Null | Secure URL from S3/CDN. |
| `created_at` | Timestamp | Default NOW() | Upload timestamp. |

### 🎯 `habits` & ✅ `habit_logs` Tables
*   **`habits` Table (Definitions):** `id` (UUID, PK), `user_id` (UUID, FK), `name` (Varchar 255 - e.g., 'Drink Water').
*   **`habit_logs` Table (Daily Tracking):** `id` (UUID, PK), `habit_id` (UUID, FK), `log_date` (Date), `is_completed` (Boolean).

---

## 5. 🌐 System Architecture & API Design

### 5.1 Technology Stack
*   **Frontend Client:** React.js (Next.js framework for SEO/routing) utilizing Tailwind CSS for responsive, accessible design.
*   **Backend Application:** Node.js (Express or NestJS) providing a robust RESTful API.
*   **Database Engine:** PostgreSQL managed via an ORM (e.g., Prisma or TypeORM) for schema safety and migration management.
*   **Cloud Storage:** AWS S3 or Cloudinary for secure, scalable image hosting.
*   **Authentication:** JWT (JSON Web Tokens) delivered via HTTP-only cookies to prevent XSS vulnerabilities.

### 5.2 Core RESTful API Endpoints
*   **Authentication:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`.
*   **Entries (CRUD):** `/api/entries` (GET, POST), `/api/entries/:id` (GET, PUT, DELETE). Note: GET endpoint supports query parameters for pagination and tagging (`?tag=travel&limit=10`).
*   **Tags & Habits:** `/api/tags` (GET, POST), `/api/habits` (GET, POST), `/api/habits/log` (POST/PUT).
*   **Analytics:** `/api/dashboard/stats` (Fetches aggregated data: streaks, habit compliance %, total counts).

---

## 6. 🔒 Non-Functional Requirements

### 6.1 Security & Data Privacy
*   **Data Isolation:** Multi-tenant architecture requires rigid authorization checks. A user must **never** be able to read, mutate, or delete records where the `user_id` does not match their verified JWT identity.
*   **Password Cryptography:** All passwords must be salted and hashed using `bcrypt` (minimum 10 rounds) before database insertion. Plaintext passwords are strictly prohibited.
*   **Input Sanitization:** All user-generated text must be sanitized on the server to prevent Cross-Site Scripting (XSS) attacks before being stored or broadcasted back to the client.
*   **Rate Limiting:** Authentication routes must implement IP-based rate limiting to prevent brute-force attacks.

### 6.2 Performance & Scalability
*   **Latency:** The 95th percentile response time for standard API requests (dashboard load, entry viewing) must be under 300ms.
*   **Responsive Design:** The UI hierarchy must be fluid, adopting a "mobile-first" approach that looks exceptional on 320px screens and scales intelligently up to 4K desktop monitors.
*   **Image Optimization:** Frontend clients must compress metadata and resize images locally before transmission to the server to reduce bandwidth and storage overhead.

---

## 7. � Key Performance Indicators (KPIs)

To measure the success and adoption of LifeLog post-launch, the following metrics will be actively monitored:

1.  **User Acquisition & Activation:** Total registered users and the percentage of users who complete their first diary entry within 24 hours of signing up.
2.  **Daily Active Users (DAU) & Monthly Active Users (MAU):** Core indicators of platform traffic.
3.  **Retention Rate (Day 1, Day 7, Day 30):** Measures the product's ability to successfully build the journaling habit in users.
4.  **Habit Engagement Score:** The average number of habits tracked and completed per active user per week.
5.  **System Reliability:** 99.9% uptime, with targeted zero critical severity bugs resulting in data loss.

---

## 8. 🔮 Future Roadmap (Post-Launch Scope)

While not included in the initial V1 release, the following features are slated for future development cycles:

*   **� Interactive Calendar Matrix:** A full visual calendar view allowing users to see a heat-map of their logging consistency and mood history at a glance.
*   **📉 Advanced Analytics & Insights:** Dynamic charting tools to visualize mood correlations (e.g., "On days you spend more than $50, your mood is generally 'Sad'").
*   **🌙 Dark Mode & Theming:** Extensive UI customization allowing users to adapt the app interface to their system preferences.
*   **🔔 Push Reminders:** Customizable daily notifications (email/mobile push) to gently nudge users to complete their daily log.
*   **📤 Data Export:** Empowering users with data ownership by allowing full JSON or PDF exports of their entire diary history.
