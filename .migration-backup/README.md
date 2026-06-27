# Unique Levi's - Dating App Development Guide

**Project Name:** Unique Levi's  
**Project Type:** Full-Stack Dating Application  
**Theme Reference:** The Full Stack Creators (https://thefullstackcreators.com/)  
**Status:** Planning & Development  
**Target:** Production-Ready Application

---

## 📋 Executive Summary

Unique Levi's is a modern dating application designed to provide users with an intuitive, engaging platform to meet and connect with potential matches. The app combines the aesthetic and UX principles of The Full Stack Creators platform with dating-specific features like swiping, messaging, matching, and profile discovery.

## Billing Provider Migration (June 2026)

The backend billing provider is now Flutterwave only.

- Checkout creation: /api/billing/checkout
- Payment verification: /api/billing/verify-checkout
- Webhook endpoint: /api/billing/webhook/flutterwave

Required server environment variables:

- FLUTTERWAVE_PUBLIC_KEY
- FLUTTERWAVE_SECRET_KEY
- FLUTTERWAVE_ENCRYPTION_KEY
- FLUTTERWAVE_WEBHOOK_SECRET_HASH
- FLUTTERWAVE_API_BASE
- FLUTTERWAVE_PAYMENT_OPTIONS (optional)
- BILLING_CURRENCY
- BILLING_AMOUNT_PLATINUM
- BILLING_AMOUNT_SILVER
- BILLING_AMOUNT_GOLD
- BILLING_AMOUNT_DIAMOND

Security note:

- If any live key was shared in screenshots or chat, rotate keys immediately in Flutterwave dashboard before production use.

### Key Highlights
- **Tinder-like swiping interface** for core discovery
- **Comprehensive profiles** with photos, bio, interests, and verified badges
- **Real-time messaging** between matches
- **Smart matching algorithm** based on preferences and compatibility
- **Security & Safety** features (verification, reporting, blocking)
- **Production-ready** backend and database
- **Scalable architecture** for future growth

---

## 🎨 Design Theme & Visual Identity

### Color Palette (From Full Stack Creators)
- **Primary Dark:** `#001F3F` (Navy Blue) - Main buttons, headers, CTAs
- **Secondary Dark:** `#0D47A1` (Deep Blue) - Hover states, accents
- **Neutral Light:** `#F5F7FA` (Light Gray/White) - Backgrounds
- **Text Primary:** `#1A1A1A` (Almost Black) - Main text
- **Text Secondary:** `#666666` (Medium Gray) - Descriptions, meta
- **Accent:** `#FF4458` or similar warm color - Likes, matches, notifications
- **Success:** `#4CAF50` (Green) - Verified, online status
- **Border:** `#E0E0E0` (Light Gray) - Dividers, card borders

### Typography
- **Headings:** Bold, large (24-48px), dark navy blue
- **Body Text:** 14-16px, readable line-height (1.5-1.6)
- **Buttons:** 14-16px, semi-bold, clear CTAs
- **Cards:** Rounded corners (8-12px), subtle shadows

### UI Components
- Rounded pill-shaped buttons (secondary actions)
- Dark navy circular buttons with icons (primary CTAs)
- Search bars with dropdown filters
- Card-based layouts with hover effects
- Modal dialogs for important actions
- Toast notifications for feedback
- Bottom navigation bar (mobile)
- Top navigation bar (desktop)

---

## 🚀 Core Features

### Phase 1: MVP (Core Functionality)
1. **User Authentication**
   - Email/password signup and login
   - Phone number verification (SMS)
   - Social login (Google, Facebook, Apple)
   - Password reset functionality
   - Email verification

2. **Profile Management**
   - Profile creation with multiple photos (max 6)
   - Bio, age, location, height, body type
   - Interests/hobbies (select from predefined list + custom)
   - Education, occupation, zodiac sign
   - Verification badge (phone, email, identity verification)
   - Age range & distance filters
   - Profile edit/update functionality

3. **Discovery & Swiping**
   - Card-based swiping interface (Tinder-style)
   - Swipe right to like, swipe left to skip
   - Super like functionality (limited per day)
   - View profile details before swiping
   - Undo last swipe (limited per day)
   - Mutual matching when both users like each other
   - Match notifications

4. **Messaging**
   - One-to-one chat with matched users
   - Real-time message delivery
   - Message history
   - Read receipts (online/offline status)
   - Photo sharing in chats
   - Typing indicators
   - Clear chat/unmatch option

5. **Likes & Matches**
   - View who likes you (premium feature option)
   - Match list with last message preview
   - Search matches by name
   - Mutual likes counter

### Phase 2: Enhanced Features
1. **Advanced Filtering**
   - Height, body type, education, occupation filters
   - Zodiac/astrology compatibility
   - Interests-based discovery
   - "Mutual interests" matching algorithm

2. **Notifications**
   - Push notifications for matches, messages, likes
   - In-app notification center
   - Notification preferences/settings

3. **User Safety & Verification**
   - Photo verification (to prevent catfishing)
   - ID verification (optional for trust badge)
   - Report/block functionality
   - Safety tips & community guidelines
   - Two-factor authentication (2FA)

4. **User Engagement**
   - Daily swipe limit (free users)
   - Likes counter (premium feature)
   - Super likes per day limit
   - Boost profile for 24 hours (premium)
   - View match percentage/compatibility score

### Phase 3: Premium & Monetization
1. **Subscription Tiers**
   - **Free Tier:** Limited swipes, no who-liked-you, basic matching
   - **Premium:** Unlimited swipes, see who liked you, rewind swipes, boost profile
   - **VIP:** All premium features + priority messaging, advanced filters, undo unlimited

2. **Features**
   - In-app purchase (iOS) & Google Play Billing (Android)
   - Stripe integration (web & desktop)
   - Subscription management
   - Refund policies

3. **Analytics Dashboard (Admin)**
   - User growth metrics
   - Revenue tracking
   - Engagement metrics
   - Report management

---

## 💾 Database Schema (Overview)

### Key Tables/Collections

```
Users
├── id (UUID)
├── email (unique)
├── phone (unique)
├── password_hash
├── first_name
├── last_name
├── date_of_birth
├── gender
├── sexual_orientation
├── bio
├── location (lat, lng)
├── city
├── height
├── body_type
├── education
├── occupation
├── zodiac_sign
├── interests (array)
├── profile_photos (array of URLs)
├── verified (boolean)
├── verified_badge (verification_type)
├── last_active (timestamp)
├── created_at
└── updated_at

Profiles
├── user_id (FK)
├── profile_completion (%)
├── view_count
├── like_count
└── match_count

Likes/Interactions
├── id (UUID)
├── user_id (who liked)
├── target_user_id (who was liked)
├── type (like, super_like, skip)
├── created_at
└── is_mutual (boolean)

Matches
├── id (UUID)
├── user_1_id
├── user_2_id
├── matched_at
├── status (active, blocked, unmatched)
└── updated_at

Messages
├── id (UUID)
├── match_id (FK)
├── sender_id
├── content
├── is_read
├── read_at
├── created_at
└── media (optional: photos, links)

Blocks
├── id (UUID)
├── user_id (who blocked)
├── blocked_user_id
├── reason
└── created_at

Reports
├── id (UUID)
├── reporter_id
├── reported_user_id
├── reason
├── description
├── status (open, investigating, resolved)
└── created_at

Subscriptions
├── id (UUID)
├── user_id
├── plan_type (free, premium, vip)
├── start_date
├── end_date
├── payment_method
├── is_active
└── auto_renew

Notifications
├── id (UUID)
├── user_id
├── type (match, message, like, etc.)
├── related_user_id
├── title
├── body
├── is_read
└── created_at
```

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Web:** React.js (Next.js for SSR & routing)
- **Mobile:** React Native or Flutter
- **State Management:** Redux or Context API (web), Provider or Riverpod (Flutter)
- **Real-Time:** Socket.io / WebSockets for messaging
- **UI Components:** Custom components + Tailwind CSS (web)
- **Build Tools:** Webpack/Next.js, Expo/Android Studio (mobile)

### Backend Stack
- **Runtime:** Node.js (Express.js) or Python (Django/FastAPI)
- **API:** RESTful API + WebSockets for real-time features
- **Authentication:** JWT tokens + refresh tokens
- **Payment Processing:** Stripe API
- **Push Notifications:** Firebase Cloud Messaging (FCM) / APNs

### Database
- **Primary:** PostgreSQL (relational data)
- **Cache/Sessions:** Redis
- **Real-Time Data:** Socket.io emitter with Redis adapter
- **File Storage:** AWS S3 or Google Cloud Storage (for photos)
- **Search/Discovery:** Elasticsearch (optional, for advanced filtering)

### DevOps & Deployment
- **Hosting:** AWS EC2 / Google Cloud Platform / Azure
- **Container:** Docker + Kubernetes (optional for scaling)
- **CI/CD:** GitHub Actions / GitLab CI
- **Database Backup:** Automated daily backups
- **CDN:** Cloudflare or AWS CloudFront (for images)
- **Monitoring:** Sentry (errors), DataDog (performance)

---

## 📱 Application Flows

### User Journey 1: Discovery & Matching
1. User logs in → Views homepage with discover card
2. Sees profile cards one by one
3. Swipes right (like) or left (skip)
4. When mutual match → Match notification & chat enabled
5. Goes to matches tab → Clicks match → Opens chat

### User Journey 2: Messaging
1. User in Matches list
2. Clicks a match
3. Chat opens with message history
4. Types message → Real-time delivery
5. Can share photos in chat
6. Online/offline status visible

### User Journey 3: Profile Creation
1. User signs up
2. Enters basic info (name, age, gender, orientation)
3. Uploads profile photos (draggable upload)
4. Fills bio and interests (multi-select)
5. Sets location preferences (distance, age range)
6. Profile goes live

### User Journey 4: Safety & Verification
1. User goes to Settings → Verification
2. Selects verification type (phone, email, ID)
3. Completes verification (SMS, email link, or upload ID)
4. Gets verified badge on profile
5. Higher visibility in discovery

---

## 🔧 Key Implementation Details

### Swiping Algorithm
- Load user profiles in batches (20-50)
- Filter based on user's preferences (age, distance, etc.)
- Return 3-5 new profiles before reload
- Store swipes immediately (like/skip)
- Check for mutual match on each like

### Matching Algorithm
- When user A likes user B:
  - Check if user B has liked user A
  - If yes → Create match, send notifications to both
  - If no → Store like, add to user B's "Likes" list

### Real-Time Messaging
- Use WebSocket connection for live messages
- Fall back to polling if WebSocket unavailable
- Store all messages in database
- Read receipts update via WebSocket
- Typing indicators (real-time)

### Photo Upload & Storage
- Client-side validation (format, size, dimensions)
- Compress photos before upload (to reduce bandwidth)
- Store original + thumbnail versions in S3
- Serve via CDN with caching
- Delete old photos when replaced

### Notification System
- Push notifications via FCM (Android) / APNs (iOS)
- In-app notification center (stored in DB)
- Email notifications (daily digest option)
- User can customize notification preferences

---

## 🔐 Security Considerations

### Authentication & Authorization
- Implement JWT with 15-minute expiry + refresh tokens
- Hash passwords with bcrypt (salt rounds: 10-12)
- CORS configuration (only trusted domains)
- Rate limiting on login attempts (5 attempts per 15 minutes)

### Data Protection
- HTTPS/TLS for all communications
- Encrypt sensitive fields (phone, SSN if collected)
- Secure session management
- GDPR compliance (data deletion, export)
- Never store payment card info (use Stripe tokens)

### User Safety
- Mandatory verification for initial profile
- Report/block system with moderator review
- Photo moderation (AI + manual review)
- Ban repeat offenders
- Safety tips & community guidelines display

### API Security
- Input validation & sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (Content Security Policy headers)
- CSRF tokens for state-changing operations
- API rate limiting per user/IP

---

## 📊 Analytics & Monitoring

### Key Metrics to Track
- **User Growth:** Daily/monthly active users (DAU/MAU)
- **Engagement:** Swipes per user, matches per user, messages sent
- **Conversion:** Free to premium conversion rate
- **Retention:** Day 1, 7, 30 retention rates
- **Revenue:** MRR (Monthly Recurring Revenue), churn rate
- **Performance:** API response times, database query times
- **Errors:** Error rates by endpoint, user reports

### Tools
- **Analytics:** Mixpanel, Amplitude, or custom logging
- **Error Tracking:** Sentry
- **Performance:** NewRelic, DataDog
- **Database Monitoring:** pgAdmin for PostgreSQL

---

## 🚢 Deployment & Production Checklist

### Before Launch
- [ ] All core features implemented and tested
- [ ] Load testing (can handle 10k+ concurrent users)
- [ ] Security audit (OWASP, penetration testing)
- [ ] GDPR/privacy compliance review
- [ ] Terms of Service & Privacy Policy drafted
- [ ] Moderation team trained
- [ ] Payment processing tested (sandbox → production)
- [ ] Email templates tested
- [ ] Push notifications tested
- [ ] Backup & disaster recovery plan
- [ ] Uptime monitoring & alerting configured
- [ ] SSL certificate installed
- [ ] Database indexed for performance
- [ ] CDN configured for image delivery
- [ ] Admin dashboard functional

### Post-Launch
- [ ] Monitor error rates closely
- [ ] Watch for spam/bot accounts
- [ ] Gather user feedback
- [ ] A/B test features
- [ ] Optimize performance based on real usage
- [ ] Plan Phase 2 enhancements

---

## 📈 Development Timeline (Estimated)

| Phase | Duration | Key Deliverables |
|-------|----------|-----------------|
| **Setup & Planning** | 1 week | Architecture, DB design, API specs |
| **Phase 1: MVP** | 6-8 weeks | Auth, profiles, swiping, messaging, basic matching |
| **Phase 1.5: QA & Polish** | 2 weeks | Bug fixes, performance optimization, UI refinement |
| **Phase 2: Enhanced Features** | 3-4 weeks | Advanced filters, notifications, verification, safety |
| **Phase 3: Premium & Payment** | 2-3 weeks | Subscriptions, analytics, monetization |
| **Pre-Launch Testing** | 2 weeks | Security audit, load testing, beta testing |
| **Launch** | 1 week | Final deployment, monitoring setup, support readiness |

**Total Estimated Time:** 17-25 weeks (4-6 months)

---

## 📦 File Structure (Recommended)

```
unique-levis/
├── frontend/
│   ├── web/                    # React/Next.js web app
│   │   ├── pages/
│   │   ├── components/
│   │   ├── styles/
│   │   ├── utils/
│   │   └── package.json
│   └── mobile/                 # React Native/Flutter mobile app
│       ├── lib/ (Flutter) or src/ (React Native)
│       └── pubspec.yaml or package.json
├── backend/
│   ├── routes/                 # API endpoints
│   ├── models/                 # Database models
│   ├── controllers/            # Business logic
│   ├── middleware/             # Auth, validation, etc.
│   ├── services/               # External service integrations
│   ├── config/                 # Database, environment configs
│   ├── tests/                  # Unit & integration tests
│   └── package.json or requirements.txt
├── database/
│   ├── migrations/             # Database schema migrations
│   ├── seeds/                  # Sample data
│   └── schema.sql or alembic/
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_DESIGN.md
│   └── DEPLOYMENT_GUIDE.md
├── .env.example                # Environment variables template
├── docker-compose.yml          # Local development setup
└── README.md                   # This file
```

---

## 🎯 Success Criteria

### Functional
- ✅ Users can sign up, create profiles, and upload photos
- ✅ Core swiping mechanism works smoothly (no lag)
- ✅ Matching is instant when mutual
- ✅ Real-time messaging between matches
- ✅ Payment processing works (Stripe integration)
- ✅ Notifications delivery (push + in-app)

### Performance
- ✅ Page load time < 2 seconds
- ✅ Swipe response < 500ms
- ✅ Message delivery < 1 second
- ✅ 99.9% uptime SLA
- ✅ Can handle 10,000+ concurrent users

### Business
- ✅ 5% free-to-premium conversion rate (or client target)
- ✅ DAU growth of 20% month-over-month
- ✅ User retention of 40% at Day 7
- ✅ Zero critical security issues

---

## 🔄 Next Steps

1. **Review & Approval** - Client reviews this document, provides feedback
2. **Tech Stack Finalization** - Choose specific frameworks (React vs Vue, Node vs Python, etc.)
3. **Detailed API Specification** - Create OpenAPI/Swagger docs
4. **Database Design** - Create ERD diagram, write migration files
5. **UI/UX Design** - Create Figma mockups based on theme
6. **Development Sprint Planning** - Break into 2-week sprints
7. **Development Begins** - Start Phase 1 implementation

---

## 📝 Notes & Assumptions

- **User Base:** Assuming 50k+ users in first year
- **Geographic:** Multi-country support with location-based matching
- **Devices:** Web, iOS, Android support needed
- **Languages:** English as primary, expandable to other languages
- **Monetization:** Freemium model with premium subscriptions
- **Timeline:** 4-6 month development for full launch

---

## 📞 Contact & Support

For questions, clarifications, or changes to this specification, please contact the development team.

---

**Version:** 1.0  
**Last Updated:** May 6, 2026  
**Status:** Ready for Development
