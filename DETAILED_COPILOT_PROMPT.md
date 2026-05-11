# COPILOT PROMPT - Build Unique Levi's Dating App

## 🎯 PROJECT OVERVIEW

I want you to build a production-ready dating application called **"Unique Levi's"**. This is a full-stack project that requires backend, web frontend, and mobile frontend. The app should feel like Tinder or Bumble with all core features functional.

**The design should be based on this theme:** https://thefullstackcreators.com/

This means:
- Navy blue (#001F3F) as primary color
- Light gray (#F5F7FA) backgrounds
- Clean, modern, minimalist aesthetic
- Large readable typography
- Rounded buttons with icons
- Card-based layouts
- Professional appearance

### Project Stats
- **Name:** Unique Levi's
- **Type:** Dating Application (Full Stack)
- **Target:** Production-ready in 4-6 months
- **Scope:** MVP + Premium features
- **Users:** Scale to 50k+ in year 1

---

## 🏗️ TECHNICAL STACK (REQUIRED)

### Frontend Web
- **Framework:** Next.js (React 18+) with TypeScript
- **Styling:** Tailwind CSS with custom color palette
- **State Management:** Redux Toolkit or Context API
- **Real-time:** Socket.io client
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod validation
- **Testing:** Jest + React Testing Library
- **Build:** Next.js built-in bundler

### Mobile App
- **Framework:** Flutter (Dart) OR React Native (JavaScript)
  - *If Flutter:* Provider for state management, GetX for routing
  - *If React Native:* Redux/Context API, React Navigation
- **Real-time:** Socket.io-client-dart (Flutter) or socket.io-client-js (RN)
- **Notifications:** Firebase Cloud Messaging
- **Local Storage:** Hive (Flutter) or AsyncStorage (RN)
- **HTTP:** Dio (Flutter) or Axios (RN)

### Backend
- **Runtime:** Node.js 18+ with Express.js (TypeScript)
  - *Alternative:* Python 3.10+ with FastAPI
- **Database:** PostgreSQL 14+
- **Cache/Real-time:** Redis 6+
- **ORM:** Prisma (Node) or SQLAlchemy (Python)
- **Authentication:** JWT with bcrypt
- **Real-time Communication:** Socket.io with Redis adapter
- **File Storage:** AWS S3 or Google Cloud Storage
- **Payment Processing:** Stripe API
- **Push Notifications:** Firebase Cloud Messaging
- **Job Queue:** Bull (Node) or Celery (Python)
- **Testing:** Jest or Pytest with mocking
- **API Documentation:** Swagger/OpenAPI

### DevOps & Infrastructure
- **Containerization:** Docker + Docker Compose
- **Container Orchestration:** Kubernetes (optional, for scaling)
- **Hosting Options:** AWS EC2 + RDS, Google Cloud Platform, or Azure
- **CI/CD:** GitHub Actions or GitLab CI
- **CDN:** Cloudflare or AWS CloudFront
- **Error Tracking:** Sentry
- **Monitoring:** DataDog or New Relic
- **Database Backup:** Automated daily backups to S3

---

## 🎨 DESIGN & COLOR SCHEME

### Primary Colors
```
Dark Navy: #001F3F       // Main buttons, headers
Deep Blue: #0D47A1       // Hover states, accents
Light Gray: #F5F7FA      // Backgrounds
Dark Text: #1A1A1A       // Main text
Med Gray: #666666        // Secondary text
Accent Red: #FF4458      // Likes, matches, attention
Success: #4CAF50         // Verified, online
Border: #E0E0E0          // Dividers
```

### Typography (Web & Mobile)
- **Headings:** 24-48px, bold, navy (#001F3F)
- **Body:** 14-16px, regular, dark gray (#1A1A1A)
- **Small:** 12-14px, regular, medium gray (#666666)
- **Line Height:** 1.5-1.6 for readability
- **Font Stack:** System fonts or Inter/Poppins

### Component Design Patterns
- Rounded corners: 8-12px on cards
- Buttons: 14-16px, pill-shaped (secondary), circular with icons (primary CTAs)
- Modals: Dark overlay, centered white card
- Cards: Subtle shadow, hover lift effect
- Input fields: 12px border, focus ring
- Lists: Card-based or rows with dividers

---

## 📱 CORE FEATURES - PHASE 1 (MVP)

### 1. USER AUTHENTICATION
```
Endpoints Needed:
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/refresh-token
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/verify-email
- POST /api/auth/verify-phone
- POST /api/auth/google-login
- POST /api/auth/apple-login
```

**Requirements:**
- Email + password signup with email verification
- Phone number verification (SMS via Twilio)
- Social login (Google, Facebook, Apple)
- JWT-based authentication (15-min access token, 7-day refresh)
- Password reset via email link
- Remember me option (persistent login)
- Account lockout after 5 failed login attempts
- Session management on web and mobile
- Logout clears all tokens and local data

**Database:**
```sql
Users table:
- id (UUID primary key)
- email (unique, indexed)
- phone (unique, indexed)
- password_hash (bcrypt, salt=10)
- first_name
- last_name
- date_of_birth
- gender (enum: male, female, non-binary)
- sexual_orientation (enum: straight, gay, lesbian, bisexual, other)
- verified_email (boolean)
- verified_phone (boolean)
- last_login (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
- deleted_at (soft delete, nullable)

UserSessions table (optional):
- id (UUID)
- user_id (FK)
- refresh_token
- expires_at
- device_info
- ip_address
```

---

### 2. PROFILE MANAGEMENT
```
Endpoints Needed:
- POST /api/profiles (create)
- GET /api/profiles/:userId (view)
- PUT /api/profiles/:userId (update)
- DELETE /api/profiles/:userId (delete)
- POST /api/profiles/:userId/photos (upload)
- DELETE /api/profiles/:userId/photos/:photoId (delete photo)
- GET /api/profiles/:userId/photos (list photos)
- GET /api/profiles/me (current user profile)
```

**Requirements:**
- Profile creation on signup with required fields
- Upload up to 6 profile photos (drag & drop on web)
- Reorder photos (drag and drop)
- Set primary photo (first in swipe)
- Compress photos before upload (webp format)
- Delete individual photos
- Bio (up to 500 characters, emoji support)
- Basic info: age, height, body type, education, occupation
- Interests: Select from predefined list + add custom
- Location: City, latitude/longitude
- Zodiac sign
- Age range & distance filters (for matching)
- Edit all fields anytime
- Soft delete profile (account deactivation)
- Profile completion progress indicator (0-100%)

**Validation Rules:**
- Age: 18-80 only
- Bio: No excessive links, profanity filter
- Photos: Max 20MB each, dimensions 600x800+ min
- Distance filter: 1-200 km

**Database:**
```sql
Profiles table:
- id (UUID)
- user_id (FK)
- bio (text, max 500)
- height_cm (integer)
- body_type (enum: slim, average, athletic, curvy, muscular)
- education (varchar)
- occupation (varchar)
- zodiac_sign (varchar)
- city (varchar)
- latitude (decimal)
- longitude (decimal)
- min_age_preference (integer)
- max_age_preference (integer)
- max_distance_km (integer)
- profile_completion (integer 0-100)
- view_count (integer)
- like_count (integer)
- match_count (integer)
- last_updated (timestamp)

ProfilePhotos table:
- id (UUID)
- profile_id (FK)
- photo_url (string, S3 URL)
- thumbnail_url (string, S3 URL)
- order (integer)
- uploaded_at (timestamp)

UserInterests junction table:
- id (UUID)
- user_id (FK)
- interest_id (FK)
```

---

### 3. DISCOVERY & SWIPING ENGINE
```
Endpoints Needed:
- GET /api/discover (get next batch of profiles)
- POST /api/interactions/like (like a user)
- POST /api/interactions/skip (skip a user)
- POST /api/interactions/super-like (super like, limited)
- POST /api/interactions/undo (undo last action)
- GET /api/interactions/likes (who liked you)
- GET /api/discover/profile/:userId (view before swipe)
```

**Requirements:**
- Card-based swiping interface (swipe right = like, left = skip)
- Show 1 profile at a time with full details
- Display all photos in carousel on card detail
- Info shown: name, age, distance, bio, interests, location
- Swipe response time < 500ms (no lag)
- Like/skip persists immediately
- Super like: 1 per day (free), unlimited (premium)
- Undo: 1 per day (free), unlimited (premium)
- No repeat showing: Don't show already swiped profiles
- Smart matching: Show best matches first based on preferences
- Show progress: "X profiles remaining" before reload

**Swiping Logic:**
1. Load 50 profile IDs matching user's filters
2. Randomize with preference-based weighting
3. Load first profile details
4. On swipe action: save to DB immediately
5. Check for mutual match
6. Load next profile (pre-fetch for smooth experience)
7. When 40 profiles shown, reload batch

**Matching Check (On Like):**
- Query: Did liked_user_id also like user_id?
- If yes: Create match, send notifications to both
- If no: Store like, add to their "Likes" list

**Database:**
```sql
Interactions table:
- id (UUID)
- user_id (FK, who swiped)
- target_user_id (FK, who was swiped on)
- interaction_type (enum: like, super_like, skip)
- created_at (timestamp)
- unique constraint: (user_id, target_user_id)

Matches table:
- id (UUID)
- user_1_id (FK, lower ID)
- user_2_id (FK, higher ID)
- matched_at (timestamp)
- status (enum: active, archived, blocked, unmatched)
- is_mutual (boolean, always true on creation)
- updated_at (timestamp)
```

---

### 4. MATCHING & NOTIFICATIONS
```
Endpoints Needed:
- GET /api/matches (list all matches)
- GET /api/matches/:matchId (match details)
- POST /api/matches/:matchId/unmatch (break match)
- POST /api/matches/:matchId/block (block user)
- GET /api/notifications (list in-app notifications)
- PUT /api/notifications/:notificationId/read (mark as read)
- DELETE /api/notifications/:notificationId (delete)
```

**Requirements:**
- Instant match notification when mutual like
- Show match with both users' photos side by side
- Match list shows: profile pic, name, last message preview, timestamp
- Search/sort matches by name or recent
- Unmatched profiles stay searchable but can't chat
- Block user (they can't see your profile, can't match)
- Notification types: match, message, like, super_like
- In-app notification center (unread count badge)
- Read receipts on notifications
- 30-day notification retention

**Push Notifications (Mobile & Web):**
- When you match: "You matched with [Name]!"
- New message: "[Name]: [Message preview]"
- Liked you: "[Name] liked your profile!"
- Only if user enabled (notification settings)

**Database:**
```sql
Matches table (from swiping section, expanded):
- id (UUID)
- user_1_id (FK)
- user_2_id (FK)
- matched_at (timestamp)
- status (active, archived, blocked, unmatched)
- is_mutual (boolean)
- created_at (timestamp)
- updated_at (timestamp)

Notifications table:
- id (UUID)
- user_id (FK)
- type (enum: match, message, like, super_like, verification)
- related_user_id (FK, optional)
- title (varchar)
- body (text)
- image_url (optional)
- is_read (boolean)
- action_url (optional)
- read_at (timestamp, nullable)
- created_at (timestamp)
- expires_at (timestamp, 30 days)
```

---

### 5. MESSAGING SYSTEM (REAL-TIME)
```
Endpoints Needed:
- GET /api/messages/:matchId (load history)
- POST /api/messages/:matchId (send message)
- PUT /api/messages/:messageId/read (mark as read)
- DELETE /api/messages/:messageId (delete message)
- POST /api/messages/:matchId/photos (upload photo in chat)
- GET /api/matches/:matchId/messages (paginated messages)

WebSocket Events:
- message:send (user sends message)
- message:received (user receives message)
- message:read (user reads message)
- typing:start (user typing indicator)
- typing:stop (user stopped typing)
- user:online (user came online)
- user:offline (user went offline)
```

**Requirements:**
- Real-time messaging via WebSocket (Socket.io)
- Message persistence in database
- Read receipts (delivered, read with timestamp)
- Online/offline status visible
- Typing indicators ("User is typing...")
- Photo sharing in chat (upload, compression, display)
- Message history pagination (50 messages per page)
- Clear chat option (local deletion)
- Edit message (show "edited" label)
- Delete message (show "Message deleted")
- Emoji support
- Link preview (show title + thumbnail for shared links)
- Unsend message (if within 5 minutes)

**Message Structure:**
- Text messages: < 5000 characters
- Photos: Up to 3 per message, auto-compress to 2MB
- Validation: No spam (rate limit 5 msgs per second per user)

**Delivery Guarantee:**
- Fallback to polling if WebSocket fails
- Auto-reconnect with exponential backoff
- Queue messages offline, send on reconnect
- Show "sending..." → "sent" → "delivered" → "read" states

**Database:**
```sql
Messages table:
- id (UUID)
- match_id (FK)
- sender_id (FK)
- content (text)
- message_type (enum: text, photo, link, system)
- is_read (boolean)
- read_at (timestamp, nullable)
- edited_at (timestamp, nullable)
- deleted_at (timestamp, nullable, soft delete)
- created_at (timestamp)
- unique index: (match_id, created_at) for pagination

MessagePhotos table:
- id (UUID)
- message_id (FK)
- photo_url (S3 URL)
- thumbnail_url (S3 URL)

MessageReactions table (for future emoji reactions):
- id (UUID)
- message_id (FK)
- user_id (FK)
- reaction_type (emoji)
- created_at (timestamp)
```

**Online Status:**
- Track last_activity in Redis (TTL 30 seconds)
- Query: `GET user:{userId}:online` → true/false
- Update: User sends heartbeat every 20 seconds
- Show: "Online" or "Active 2h ago"

---

## 📱 PHASE 2: ENHANCED FEATURES

### 1. Advanced Filtering & Preferences
```
Endpoints Needed:
- GET /api/preferences (user's swipe preferences)
- PUT /api/preferences (update preferences)
```

**Filters:**
- Age range (18-80, default 18-80)
- Distance (1-200km, default 50km)
- Height range
- Body type (multi-select)
- Education level (multi-select)
- Interests (multi-select, show matches with mutual interests)
- Zodiac compatibility
- Smoking/drinking (yes/no/sometimes)
- Looking for (relationship, casual, friends, not sure)
- Has photos only (exclude those without pics)
- Verified only (show only verified users)
- Recently active (online in last 7 days)
- Location: Specific cities or current location

---

### 2. User Verification System
```
Endpoints Needed:
- GET /api/verification/status (current status)
- POST /api/verification/phone (request SMS)
- POST /api/verification/email (request confirmation)
- POST /api/verification/id (upload ID, manual review)
- GET /api/verification/methods (available verification types)
```

**Verification Types:**
1. **Email:** Click link → auto verified (instant)
2. **Phone:** SMS code (6 digits) → verified (instant)
3. **ID/Selfie:** Upload ID + selfie → manual review (1-24h)

**Verification Badge:**
- Phone icon: Phone verified
- Email icon: Email verified
- ID icon: Identity verified
- Show badge count on profile
- Higher visibility in discovery (verified users shown first)

**Database:**
```sql
Verifications table:
- id (UUID)
- user_id (FK)
- type (enum: email, phone, id)
- status (enum: pending, verified, rejected)
- verification_code (varchar, for phone/email)
- expires_at (timestamp)
- verified_at (timestamp, nullable)
- metadata (JSON, store verification details)
- created_at (timestamp)

IDVerifications table (sensitive):
- id (UUID)
- user_id (FK)
- id_type (enum: passport, driver_license, national_id)
- id_number_hash (hashed, never store plain)
- selfie_url (S3, encrypted)
- status (pending, verified, rejected)
- reviewed_at (timestamp, nullable)
- reviewed_by (admin_id, nullable)
- rejection_reason (varchar, nullable)
- created_at (timestamp)
```

---

### 3. Safety, Reporting & Blocking
```
Endpoints Needed:
- POST /api/users/:userId/report (report profile)
- POST /api/users/:userId/block (block user)
- GET /api/blocks (list blocked users)
- DELETE /api/blocks/:blockedUserId (unblock)
- GET /api/safety/tips (safety guidelines)
```

**Reporting System:**
- Reason: Inappropriate content, fake profile, harassment, scam, other
- Evidence: Optional description, screenshot upload
- Auto-hide reported profiles (won't show in discovery)
- Auto-ban if reported 5+ times
- Manual review by moderators
- Privacy: Report is anonymous to reported user

**Blocking:**
- User is hidden immediately
- Can't message, match, or see profile
- Can unblock anytime
- History not accessible

**Safety Features:**
- Community guidelines on signup
- Safety tips section in app
- Fraud warning signs article
- Report button on every profile
- Block button in chat

---

## 💳 PHASE 3: PREMIUM & MONETIZATION

### Subscription Plans
```
Endpoints Needed:
- GET /api/subscriptions/plans (available plans)
- POST /api/subscriptions (create subscription)
- GET /api/subscriptions (current subscription)
- DELETE /api/subscriptions (cancel)
- PUT /api/subscriptions (update plan)
- GET /api/billing/invoices (invoice history)
```

**Tiers:**
```
FREE:
- 50 swipes per day
- Can't see who liked you
- Can't undo swipes
- Can't super like
- Ads (optional)
- Basic profile

PREMIUM ($14.99/month):
- Unlimited swipes
- See who liked you
- 5 undos per day
- 5 super likes per day
- Boost profile 1x/month (24h visibility increase)
- Priority support
- No ads
- Advanced filters

VIP ($29.99/month):
- Everything in Premium
- 1 free boost per week
- Unlimited undo
- Unlimited super likes
- See who viewed your profile
- Profile priority (shown to more people)
- Priority support (phone/email)
- Exclusive features first
```

**Payment Integration:**
- Stripe for web (card, Apple Pay, Google Pay)
- App Store for iOS (in-app purchase)
- Google Play for Android (in-app purchase)
- Monthly auto-renewal with 7-day trial option
- Cancel anytime, no questions

**Database:**
```sql
SubscriptionPlans table:
- id (UUID)
- name (free, premium, vip)
- monthly_price (decimal)
- features (JSON array)
- stripe_price_id (varchar)
- app_store_product_id (varchar, iOS)
- google_play_product_id (varchar, Android)

UserSubscriptions table:
- id (UUID)
- user_id (FK)
- plan_id (FK)
- status (enum: active, cancelled, expired)
- billing_cycle_start (timestamp)
- billing_cycle_end (timestamp)
- renewal_enabled (boolean)
- stripe_subscription_id (varchar, nullable)
- app_store_receipt (varchar, nullable)
- google_play_receipt (varchar, nullable)
- created_at (timestamp)
- cancelled_at (timestamp, nullable)

Invoices table:
- id (UUID)
- subscription_id (FK)
- amount (decimal)
- currency (varchar)
- status (enum: paid, pending, failed)
- invoice_url (varchar, Stripe)
- created_at (timestamp)
- paid_at (timestamp, nullable)
```

---

## 🔐 SECURITY REQUIREMENTS

### Authentication
- [ ] JWT tokens: 15-min access, 7-day refresh
- [ ] Refresh token rotation on each use
- [ ] Bcrypt password hashing (salt 10-12 rounds)
- [ ] Rate limiting: 5 login attempts per 15 min per IP
- [ ] HTTPS/TLS for all endpoints
- [ ] CORS configured (whitelist frontend domains)
- [ ] CSRF tokens for state-changing operations

### Data Protection
- [ ] Encrypt sensitive fields: phone, SSN (if collected)
- [ ] Hash user IDs when exposing in APIs
- [ ] Never store payment card info (use Stripe tokens)
- [ ] Secure password reset links (token expires in 1 hour)
- [ ] Never send passwords in emails or logs

### User Safety
- [ ] No phone numbers visible in public (show "...4567")
- [ ] Block list is private
- [ ] Report system is anonymous
- [ ] Content moderation for profile photos
- [ ] Profanity filter in bios and messages
- [ ] Rate limiting on messages (10 per user per minute in one chat)

### API Security
- [ ] Input validation on all endpoints (Zod/Joi schemas)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize user inputs)
- [ ] Rate limiting per user (100 req/min)
- [ ] Endpoint authentication (require JWT)
- [ ] Endpoint authorization (user can only access their own data)
- [ ] OWASP Top 10 compliance

### Infrastructure
- [ ] Database backups: Daily automated to S3
- [ ] Encryption at rest: RDS encrypted
- [ ] Encryption in transit: TLS 1.3
- [ ] Security headers: CSP, X-Frame-Options, X-Content-Type-Options
- [ ] WAF (Web Application Firewall) enabled
- [ ] DDoS protection (Cloudflare)
- [ ] IP whitelisting for admin panel

---

## 📊 ANALYTICS & TRACKING

### Events to Track
```
- user:signup → track source, device, country
- user:login → track device, location
- profile:completed → track completion time
- profile:photo_uploaded → track count, format
- discovery:viewed_profile → track order shown
- discovery:swiped → track like/skip ratio
- interaction:matched → track time to match, distance
- message:sent → track count, media types
- message:opened → track read time
- subscription:created → track plan, device, duration
- subscription:cancelled → track plan, reason (if collected)
- payment:failed → track plan, error reason
- user:reported → track reason
- user:blocked → anonymous event
```

### KPIs
- **MAU/DAU:** Monthly/Daily Active Users
- **Conversion:** Free to premium conversion rate (target 5%)
- **Engagement:** Swipes per user, messages per match
- **Retention:** Day 1, 7, 30 retention rates
- **LTV:** Lifetime Value per user
- **Churn:** Subscription cancellation rate
- **Revenue:** MRR, ARR, ARPU
- **Support:** Avg response time, resolution rate

### Dashboards
- Admin dashboard: User growth, revenue, reports
- Analytics dashboard (public): Public metrics page
- Developer dashboard: API usage, errors, webhooks

---

## 🚀 DEPLOYMENT & PRODUCTION

### Pre-Launch Checklist
- [ ] All features tested (unit, integration, E2E)
- [ ] Load testing: 10k concurrent users
- [ ] Security audit: Penetration testing, OWASP
- [ ] GDPR/Privacy compliance review
- [ ] Terms of Service drafted
- [ ] Privacy Policy drafted
- [ ] Moderation team trained
- [ ] Support process documented
- [ ] Database optimized (indexes, query analysis)
- [ ] CDN configured
- [ ] SSL certificate installed
- [ ] Monitoring/alerting setup
- [ ] Disaster recovery plan
- [ ] Backup testing
- [ ] Email templates tested
- [ ] SMS templates tested
- [ ] Push notification templates tested

### Deployment Strategy
1. Deploy backend to staging
2. Run full test suite
3. Load testing on staging
4. Security scan
5. Deploy frontend to staging
6. E2E testing
7. Deploy to production (during low-traffic hours)
8. Monitor error logs & performance
9. Be ready to rollback

### Production Environment
- **Backend:** Dockerized, auto-scaling group (2-10 instances)
- **Database:** PostgreSQL RDS Multi-AZ, automated backups
- **Cache:** Redis cluster
- **Storage:** S3 with CloudFront CDN
- **Monitoring:** CloudWatch, DataDog, Sentry
- **Logging:** CloudWatch Logs, ELK stack (optional)
- **Uptime Target:** 99.9% SLA

---

## 📋 FILE STRUCTURE (RECOMMENDED)

```
unique-levis/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── profiles.ts
│   │   │   ├── discover.ts
│   │   │   ├── messages.ts
│   │   │   ├── matches.ts
│   │   │   ├── interactions.ts
│   │   │   ├── subscriptions.ts
│   │   │   ├── admin.ts
│   │   │   └── index.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── profile.model.ts
│   │   │   ├── match.model.ts
│   │   │   ├── message.model.ts
│   │   │   └── subscription.model.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── profiles.controller.ts
│   │   │   ├── discover.controller.ts
│   │   │   ├── messages.controller.ts
│   │   │   └── subscriptions.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── stripe.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   ├── s3.service.ts
│   │   │   ├── matching.service.ts
│   │   │   └── notification.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── errorHandler.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── schemas/
│   │   │   ├── auth.schema.ts
│   │   │   ├── profile.schema.ts
│   │   │   └── message.schema.ts
│   │   ├── utils/
│   │   │   ├── jwt.util.ts
│   │   │   ├── password.util.ts
│   │   │   ├── validators.util.ts
│   │   │   └── logger.util.ts
│   │   ├── sockets/
│   │   │   ├── message.socket.ts
│   │   │   ├── presence.socket.ts
│   │   │   └── notification.socket.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   ├── stripe.ts
│   │   │   ├── aws.ts
│   │   │   └── env.ts
│   │   ├── tests/
│   │   │   ├── auth.test.ts
│   │   │   ├── matching.test.ts
│   │   │   └── messages.test.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
├── frontend-web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (home)
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── discover/
│   │   │   ├── matches/
│   │   │   ├── messages/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── SwipeCard.tsx
│   │   │   ├── PhotoCarousel.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ... (other components)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── useMatches.ts
│   │   │   └── ... (other hooks)
│   │   ├── store/
│   │   │   ├── authSlice.ts
│   │   │   ├── matchesSlice.ts
│   │   │   ├── messagesSlice.ts
│   │   │   └── store.ts
│   │   ├── utils/
│   │   │   ├── api.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── tailwind.config.js
│   │   └── app.tsx
│   ├── public/
│   │   └── ... (images, favicon)
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── README.md
├── frontend-mobile/
│   ├── lib/
│   │   ├── screens/
│   │   │   ├── LoginScreen.dart
│   │   │   ├── SignupScreen.dart
│   │   │   ├── DiscoverScreen.dart
│   │   │   ├── MatchesScreen.dart
│   │   │   ├── MessagesScreen.dart
│   │   │   ├── ChatScreen.dart
│   │   │   └── ProfileScreen.dart
│   │   ├── widgets/
│   │   │   ├── SwipeCard.dart
│   │   │   ├── BottomNav.dart
│   │   │   ├── ChatBubble.dart
│   │   │   └── ... (other widgets)
│   │   ├── providers/
│   │   │   ├── auth_provider.dart
│   │   │   ├── matches_provider.dart
│   │   │   └── messages_provider.dart
│   │   ├── services/
│   │   │   ├── api_service.dart
│   │   │   ├── socket_service.dart
│   │   │   └── storage_service.dart
│   │   ├── models/
│   │   │   ├── user_model.dart
│   │   │   ├── match_model.dart
│   │   │   └── message_model.dart
│   │   ├── utils/
│   │   │   ├── constants.dart
│   │   │   ├── validators.dart
│   │   │   └── colors.dart
│   │   ├── main.dart
│   │   └── app.dart
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── pubspec.yaml
│   ├── .env.example
│   └── README.md
├── docker-compose.yml
├── .gitignore
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT.md
└── README.md
```

---

## 🎯 SUCCESS CRITERIA

### MVP Completion
- [ ] Users can signup, create profiles, upload photos
- [ ] Swiping works smoothly with no lag
- [ ] Matching is instant when mutual
- [ ] Real-time messaging works
- [ ] Notifications deliver reliably
- [ ] Payment processing works
- [ ] Mobile app downloads/runs on iOS and Android
- [ ] Web app responsive on all devices

### Performance
- [ ] Page load time < 2 seconds
- [ ] Swipe response < 500ms
- [ ] Message delivery < 1 second
- [ ] Database query < 200ms
- [ ] Can handle 10k concurrent users
- [ ] 99.9% uptime

### Business
- [ ] 5% free-to-premium conversion
- [ ] 40% Day 7 retention
- [ ] 20% month-over-month growth
- [ ] Zero critical security issues

---

## ⚙️ ENVIRONMENT VARIABLES TEMPLATE

```bash
# Backend .env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/unique_levis_db
REDIS_URL=redis://host:6379

# JWT
JWT_ACCESS_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_key_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=unique-levis-profiles
AWS_S3_REGION=us-east-1

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Email (SendGrid or similar)
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@uniquelevis.com

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email

# Frontend .env.local (web)
NEXT_PUBLIC_API_URL=https://api.uniquelevis.com
NEXT_PUBLIC_SOCKET_URL=https://api.uniquelevis.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxx

# Frontend .env (mobile)
API_URL=https://api.uniquelevis.com
SOCKET_URL=https://api.uniquelevis.com
```

---

## 🚀 START HERE: PHASE 1 BUILD STEPS

1. **Setup Backend Project**
   - Initialize Node.js + Express + TypeScript
   - Setup Prisma ORM with PostgreSQL
   - Create .env files from template
   - Initialize Redis connection
   - Setup basic middleware (CORS, auth, logging)

2. **Create Auth System**
   - User signup/login endpoints
   - Email verification
   - Phone SMS verification (Twilio)
   - JWT token generation & refresh
   - Password reset flow

3. **Build Profile Management**
   - Profile creation endpoint
   - Photo upload to S3
   - Profile update endpoints
   - Profile retrieval

4. **Implement Discovery & Swiping**
   - Get discover profiles endpoint (with filters)
   - Like/skip endpoints
   - Mutual match detection
   - Undo functionality

5. **Build Messaging System**
   - WebSocket setup with Socket.io
   - Message save endpoint
   - Message history endpoint
   - Real-time message events
   - Read receipt tracking

6. **Create Web Frontend**
   - Login/signup pages
   - Discover page with swiping
   - Matches list
   - Chat interface
   - Profile management

7. **Build Mobile Frontend**
   - Same screens as web
   - Mobile-optimized swiping
   - Push notifications setup
   - Bottom navigation

8. **Testing & Deployment**
   - Write unit tests
   - Integration tests
   - Setup CI/CD
   - Deploy to staging
   - Load testing
   - Deploy to production

---

## 📞 SUPPORT & REFERENCES

- **Stripe Docs:** https://stripe.com/docs
- **Socket.io Docs:** https://socket.io/docs/
- **Prisma Docs:** https://www.prisma.io/docs/
- **Next.js Docs:** https://nextjs.org/docs
- **Firebase Docs:** https://firebase.google.com/docs/

---

## NOTES FOR COPILOT

- **Start with Phase 1 (MVP)** - Don't build premium features until MVP is done
- **Prioritize MVP features:** Auth, Profiles, Swiping, Matching, Messaging
- **Security first:** Hash passwords, validate inputs, implement rate limiting
- **Real-time first:** WebSockets for messaging, not polling
- **Database design first:** Get schema right before coding
- **Test as you build:** Unit tests for each feature
- **Ask clarifications:** If tech stack choices arise, ask which I prefer
- **Production-ready:** Code should be deployable to production
- **Documentation:** Keep docs updated as you build
- **Performance:** Optimize queries, cache, minimize N+1 problems

---

**This prompt is comprehensive and should be pasted directly to Copilot to begin development.**
