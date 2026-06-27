# UI/UX SPECIFICATIONS - Unique Levi's Dating App

## 📐 Design System

### Color Tokens
```css
/* Primary Colors */
--color-navy: #001F3F;           /* Main buttons, headers */
--color-navy-hover: #0D47A1;     /* Hover states */
--color-navy-dark: #000A1A;      /* Very dark backgrounds */

/* Neutral Colors */
--color-bg-light: #F5F7FA;       /* Default background */
--color-bg-white: #FFFFFF;       /* Card backgrounds */
--color-text-primary: #1A1A1A;   /* Main text */
--color-text-secondary: #666666; /* Descriptions */
--color-text-tertiary: #999999;  /* Meta info */
--color-border: #E0E0E0;         /* Dividers, borders */

/* Semantic Colors */
--color-accent-red: #FF4458;     /* Likes, matches, important */
--color-success: #4CAF50;        /* Verified, online status */
--color-warning: #FF9800;        /* Warnings, caution */
--color-error: #F44336;          /* Errors, critical */
--color-info: #2196F3;           /* Info, notifications */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #001F3F 0%, #0D47A1 100%);
--gradient-accent: linear-gradient(135deg, #FF4458 0%, #FF1744 100%);
```

### Typography Scale
```css
/* Headings */
--font-size-h1: 48px;     /* Page titles */
--font-size-h2: 36px;     /* Section titles */
--font-size-h3: 28px;     /* Subsection titles */
--font-size-h4: 24px;     /* Card titles */
--font-size-h5: 20px;     /* Small titles */
--font-size-h6: 16px;     /* Mini titles */

/* Body */
--font-size-body-lg: 18px; /* Large body */
--font-size-body: 16px;    /* Default body */
--font-size-body-sm: 14px; /* Small body */
--font-size-body-xs: 12px; /* Extra small */
--font-size-caption: 11px; /* Captions, labels */

/* Font Weights */
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Spacing Scale
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 32px;
--spacing-3xl: 48px;
--spacing-4xl: 64px;
```

### Radius & Shadows
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

---

## 🎨 Component Specifications

### Button Variants

#### Primary Button (Dark Navy)
```
Style: Solid navy background
Color: White text on #001F3F
Size: 48px height (mobile), 44px (desktop)
Padding: 12px 24px
Border Radius: 12px
Font: 16px semibold
Hover: Background changes to #0D47A1
Active: Background darkens, slight shadow
Disabled: 50% opacity, cursor not-allowed
Icon: Optional, 20px left of text
Width: Full width (mobile), auto (desktop)

Examples: "Sign Up", "Create Profile", "Send", "Unmatch"
```

#### Secondary Button (Light Gray Pill)
```
Style: Light gray pill background
Color: Navy text on #F5F7FA
Size: 40px height
Padding: 8px 16px
Border Radius: 20px (pill-shaped)
Font: 14px regular
Border: 1px solid #E0E0E0
Hover: Background slightly darker, border color #001F3F
Active: 2px navy border
Icon: Optional, 16px left of text
Width: Auto

Examples: "Skip", "Details", "Interests", "Edit"
```

#### Icon Button (Circular Navy)
```
Style: Circular navy background
Color: White icon
Size: 48px diameter
Border Radius: 50% (fully circular)
Icon Size: 24px
Hover: Background #0D47A1, slight scale up (1.05x)
Active: Shadow + scale down (0.95x)
Disabled: 50% opacity

Examples: Search icon, Plus icon, Menu, Send message
```

#### Danger Button (Red)
```
Style: Red background or red text
Color: White text if filled, red text if outline
Size: 44-48px height
Padding: 12px 24px
Border Radius: 12px
Font: 16px semibold
Hover: Darker red
Used for: Unmatch, Block, Delete, Report

Examples: "Report User", "Block", "Delete Chat"
```

### Input Fields
```
Style: White background, light gray border
Height: 44px (mobile), 48px (desktop)
Padding: 12px 16px
Border Radius: 8px
Border: 1px solid #E0E0E0
Font: 16px regular, #1A1A1A text
Placeholder: #999999 color, 14px

Focus State:
  - Border: 2px solid #001F3F
  - Shadow: 0 0 0 3px rgba(0, 31, 63, 0.1)
  - Outline: None

Error State:
  - Border: 2px solid #F44336
  - Text: #F44336 error message below
  - Icon: Red exclamation icon

Success State:
  - Border: 2px solid #4CAF50
  - Icon: Green checkmark

Disabled State:
  - Background: #F5F7FA
  - Text: #999999
  - Cursor: Not-allowed

Types:
  - Text (email, name, bio)
  - Password (with eye toggle)
  - Number (age, height)
  - Date (birthday)
  - Textarea (bio, longer text)
  - Select dropdown (gender, body type)
  - Multi-select (interests)
```

### Cards
```
Style: White background, subtle shadow
Padding: 16px
Border Radius: 12px
Border: 1px solid #E0E0E0
Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
Hover: Shadow increases, slight scale up (1.02x)

Profile Card (Discover):
  - Height: 500px (mobile), 600px (desktop)
  - Contains: Photo carousel, name/age, distance, bio, interests
  - Bottom CTA: Like/Skip buttons

Match Card (Matches List):
  - Height: 80px
  - Layout: Avatar (60px) | Name/Last Message | Unread Badge
  - Avatar: 60px circular, border 3px if unread
  - Hover: Light gray background

Chat Message Card:
  - Background: Light gray (#F5F7FA) or navy with white text
  - Padding: 12px 16px
  - Border Radius: 16px (more rounded)
  - Max Width: 80% of screen
  - Timestamp: 12px gray below
  - Read receipt: Small eye icon
```

### Modal & Dialogs
```
Style: Dark overlay (rgba(0, 0, 0, 0.5)), centered white card
Card Padding: 24px
Card Border Radius: 16px
Card Min Width: 320px (mobile: 90vw)
Card Max Width: 500px
Shadow: Large shadow

Header:
  - Font: 20px semibold navy
  - Margin Bottom: 16px
  - Close Icon: Top right, 24px, hover effect

Content:
  - Font: 16px regular
  - Line Height: 1.5
  - Color: #1A1A1A
  - Margin Bottom: 24px

Footer:
  - Display: Flex, gap 12px
  - Buttons: Full width on mobile, auto on desktop
  - Primary button on right

Animation:
  - Enter: Fade in + scale from 0.95 (200ms)
  - Exit: Fade out + scale to 0.95 (150ms)
```

### Navigation

#### Top Navigation Bar (Desktop/Web)
```
Height: 64px
Background: #FFFFFF
Border Bottom: 1px solid #E0E0E0
Padding: 12px 24px
Display: Flex, space-between

Left:
  - Logo: 32px height
  - Spacing: 32px to nav items
  - Nav items: 16px font, navy hover, underline active

Right:
  - User avatar: 40px circular
  - Dropdown menu on click
  - Notification bell: 24px with badge count
  - Settings icon: 24px

Sticky: Yes, z-index high
```

#### Bottom Navigation Bar (Mobile)
```
Height: 64px
Background: #FFFFFF
Border Top: 1px solid #E0E0E0
Padding: 8px 0
Position: Fixed bottom
Width: 100%
z-index: High

Items: 5 max
Layout: Flex, space-around
Item Style:
  - Icon: 24px
  - Label: 12px below icon
  - Height: 100% clickable area
  - Color: Navy, #FF4458 active
  - Badge: Red dot or number for unread

Items:
  1. Discover (flame icon)
  2. Matches (heart icon)
  3. Messages (chat icon)
  4. Profile (user icon)
  5. Settings (gear icon)
```

### Form Sections
```
Label:
  - Font: 14px semibold, #1A1A1A
  - Margin Bottom: 8px
  - Asterisk (*): 14px red if required

Hint Text:
  - Font: 12px, #666666
  - Margin Top: 4px
  - May include char count for textarea

Spacing Between Fields:
  - Vertical gap: 20px

Multi-Select/Checkboxes:
  - Layout: Grid (2-3 columns on mobile, 3-4 desktop)
  - Each item: 48px height pill button
  - Selected: Navy background, white text
  - Unselected: Gray background, navy text

Radio Buttons:
  - Circle icon: 20px diameter
  - Label text: 16px, clickable
  - Spacing: 12px between options

Dropdown/Select:
  - Same styling as input field
  - Dropdown icon: 20px right aligned
  - Options: 44px height each
  - Selected: Navy background, white text
```

---

## 📱 Screen Specifications

### 1. Login Screen

**Layout (Mobile Portrait 375x812):**
```
Top: 48px padding
Logo: 64x64px centered
Spacing: 32px below logo

Form:
  - Email input (full width)
  - Password input (full width)
  - Spacing: 20px between
  - Forgot password link: 14px right-aligned, navy

Buttons:
  - Login button: Full width primary
  - OR divider: 16px spacing
  - Google login: Full width secondary with icon
  - Facebook login: Full width secondary with icon
  - Apple login: Full width secondary with icon
  - Spacing: 12px between social buttons

Footer:
  - "Don't have an account?" text
  - "Sign up" link: Navy, clickable
  - Centered, 16px from bottom
```

**Elements:**
- Background: Light gray (#F5F7FA)
- Form container: White card, padding 24px
- Fields have error states with red text below
- Loading state: Button disabled, spinner inside
- Success: Navigate to discover screen
- Error: Show alert/toast with message

---

### 2. Signup/Profile Creation Screen

**Layout (Multi-step wizard or single long form):**

**Step 1: Basic Info**
```
- First name input
- Last name input
- Email input
- Password input (show strength indicator)
- Birth date picker (age must be 18+)
- Gender select dropdown
- Sexual orientation select
- Continue button
```

**Step 2: Profile Photos**
```
- Photo upload area (drag & drop)
- Grid: 2 columns (mobile), 3 (desktop)
- Each photo: 160x160px thumbnail
- Add button: "+" centered
- Reorder: Drag to reorder
- Delete: X button on hover
- Primary photo indicator
- Max 6 photos
- Continue button (min 1 photo required)
```

**Step 3: About You**
```
- Bio textarea: 500 char limit with counter
- Height dropdown
- Body type multi-select
- Education input
- Occupation input
- Zodiac sign select
- Continue button
```

**Step 4: Interests**
```
- Multi-select grid (2-3 columns)
- 20+ predefined interests
- Custom interest input (type to add)
- Max 15 interests
- Continue/Complete button
```

**Step 5: Preferences**
```
- Min age slider (18-80)
- Max age slider (18-80)
- Max distance slider (1-200km)
- Looking for select (relationship/casual/etc)
- Notification preferences checkboxes
- Complete Profile button
```

---

### 3. Discover Screen (Main Swiping)

**Layout:**
```
Header:
  - "Discover" title: 24px semibold
  - Filter icon: 24px navy (optional for Phase 2)
  - Right side: Notification bell

Card Stack (Main):
  - Full width minus 24px padding
  - 500px height (mobile), 600px (desktop)
  - White card with shadow
  - Photo carousel at top (80% of height)
  - Info section below (20% height)

Info Section:
  - Name, age, distance: 20px semibold navy
  - Bio: 14px secondary text
  - Interests: Pill buttons below
  - Indicator: "X of Y profiles remaining"

Bottom Controls:
  - Skip button (left): 48px icon button
  - Super like (top center): 48px icon button
  - Like button (right): 48px icon button
  - Undo button (optional, below): Gray text link
  - Mobile: Buttons in bottom nav, with action overlay

Loading State:
  - Skeleton card while loading next
  - Smooth fade transition
```

**Interactions:**
- Swipe right: Trigger like animation + sound
- Swipe left: Trigger skip animation
- Tap card: Show full profile modal with more details
- Like/match: Show "It's a match!" overlay with both photos
- Notification badge: Red number on notifications bell

---

### 4. Matches Screen

**Layout:**
```
Header:
  - "Matches" title: 24px semibold
  - Filter/sort button: 24px icon

List:
  - Full width list of cards
  - Each card: 80px height
  - Layout: Avatar | Name + Last Message | Unread badge

Card Details:
  Avatar:
    - 60px circular
    - 3px border if unread
    - Border color: #FF4458 (red)

Info:
  - Name: 16px semibold
  - Last message: 14px gray, truncated (1 line)
  - Timestamp: 12px gray (right side)

Unread Badge:
  - Red dot or number
  - Top right of card
  - If > 99: Show "99+"

Empty State:
  - Icon: Heart icon, 64px gray
  - Text: "No matches yet"
  - Subtitle: "Swipe to start matching"
  - Button: "Go to Discover"
```

---

### 5. Chat/Messages Screen

**Layout:**
```
Header:
  - Match name: 18px semibold
  - Online status: Green dot + "Online"
  - More options: 24px icon (block, report, unmatch)

Message List:
  - Full height scrollable
  - Messages grouped by sender
  - Self messages: Right aligned, navy background, white text
  - Other messages: Left aligned, gray background, navy text
  - Timestamp: Center below message (12px gray)
  - Read receipt: Small eye icon below self message

Input Area (Fixed Bottom):
  - Height: 56px
  - Layout: Flex
  - Input field: Expandable textarea (max 4 lines)
  - Send button: 40px icon on right
  - Photo button: 40px camera icon (optional)
  - Emoji button: 40px smiley icon (optional)

Typing Indicator:
  - "[Name] is typing..." (12px gray italic)
  - Or: Animated dots animation

Photo Sharing:
  - Grid layout: 2-3 columns
  - Each photo: Rounded corners, centered
  - Caption below (optional)
```

---

### 6. Profile/Account Screen

**Layout:**
```
Header:
  - User avatar: 100px circular, centered
  - Edit button: "Edit Profile" link below

Sections:

Basic Info:
  - Name: 20px
  - Age, location: 14px gray
  - Verification badges: Inline icons

Quick Stats:
  - Likes: Number + icon
  - Matches: Number + icon
  - Views: Number + icon
  - 3 columns, centered

About:
  - Bio: Full text
  - Interests: Pill buttons
  - Info: Age, height, education, etc.

Actions:
  - Edit Profile button: Full width primary
  - View as Others See: Secondary button (optional)

Settings:
  - Preferences: Link
  - Notifications: Link
  - Verification: Link
  - Privacy: Link
  - Account Settings: Link
  - Help & Support: Link
  - Logout: Danger button
```

---

### 7. Settings/Preferences Screen

**Sections:**

**Discovery Preferences:**
```
- Age range slider: Visual double slider
- Distance slider: 1-200km
- Looking for: Radio buttons
- Body type: Multi-select
- Verified only: Toggle
- Recently active: Toggle
```

**Notifications:**
```
- Messages: Toggle
- Likes: Toggle
- Matches: Toggle
- Email digest: Toggle
- Notification time range: Time pickers
```

**Account:**
```
- Email: Editable text
- Phone: Editable text with verify button
- Password change: Link to modal
- Two-factor auth: Toggle
- Login activity: Link to view
```

**Privacy & Safety:**
```
- Profile visibility: Public/Private toggle
- Block list: Link
- Report settings: Link
- Community guidelines: Link
```

**Premium:**
```
- Current plan: Display
- Billing info: Link
- Manage subscription: Button
- Upgrade: Button
```

---

## 🎬 Animation Specifications

### Swipe Card Animations
```
Swipe Right (Like):
  - Card rotates slightly (5deg) to right
  - Moves to right + down with acceleration
  - Opacity fades to 0
  - Duration: 300ms
  - Green "LIKE" overlay appears (with checkmark icon)
  - Sound effect: Soft "whoosh"

Swipe Left (Skip):
  - Card rotates slightly (-5deg) to left
  - Moves to left + down with acceleration
  - Opacity fades to 0
  - Duration: 300ms
  - Gray "PASS" overlay appears
  - Sound effect: Soft "whoosh"

Match Animation (Mutual Like):
  - Current card exits with celebratory animation
  - Confetti animation (5-10 pieces fall)
  - Modal pops up: Both user photos side by side
  - Large "It's a Match!" text with animation
  - Button: "Send a Message" prominent
  - Duration: 1 second for popup
  - Sound effect: Bell or celebratory chime
```

### Transition Animations
```
Page Transitions:
  - Fade in: 200ms (0 → 1 opacity)
  - Fade out: 150ms (1 → 0 opacity)
  - Scale: Light scale in (0.98 → 1) on page open
  - No slide transitions (too trendy/dated)

Modal/Dialog:
  - Backdrop fade in: 200ms
  - Card scale in: 200ms (0.95 → 1)
  - Combined: 200ms total

Button Interactions:
  - Hover: Scale 1.05, shadow increase (100ms)
  - Active: Scale 0.98, shadow decrease (50ms)
  - Disabled: No animation

Message Bubble Animations:
  - Self message: Slide in from right + fade (200ms)
  - Other message: Slide in from left + fade (200ms)
  - New messages: Smooth scroll to bottom
```

---

## 🌐 Responsive Design

### Breakpoints
```
Mobile: 375px - 767px
Tablet: 768px - 1023px
Desktop: 1024px+

Adjustments:

Mobile (Portrait):
  - Cards: Full width - 16px padding
  - Buttons: Full width
  - Font sizes: -2px from base
  - Navigation: Bottom nav only
  - Spacing: Slightly reduced

Tablet (Landscape):
  - Cards: 60% width centered
  - Buttons: 200px max width
  - Sidebar: Optional left sidebar
  - Top nav + bottom nav possible

Desktop:
  - Cards: 50% width centered
  - Buttons: Auto width (max 300px)
  - Top navigation prominent
  - Sidebar for filters/options
  - Multiple columns where applicable
```

---

## 📐 Accessibility Standards

- [ ] WCAG 2.1 AA compliance
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Touch targets ≥ 44x44px (mobile)
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility (semantic HTML)
- [ ] Focus indicators visible
- [ ] Alt text for all images
- [ ] ARIA labels where needed
- [ ] Animations respect prefers-reduced-motion
- [ ] Form labels associated with inputs

---

## 📝 Design Tokens Export (CSS)

Save as `design-tokens.css` and import into all components:

```css
:root {
  /* Colors */
  --primary: #001F3F;
  --primary-hover: #0D47A1;
  --secondary: #F5F7FA;
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --accent: #FF4458;
  --success: #4CAF50;
  --border: #E0E0E0;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;

  /* Spacing */
  --spacing-unit: 4px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

---

**Design System Version:** 1.0  
**Last Updated:** May 6, 2026  
**Status:** Ready for Implementation
