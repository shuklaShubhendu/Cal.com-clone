# Scaller Frontend

A modern, responsive scheduling web application frontend built with **Next.js 14**, designed to replicate Cal.com's elegant user interface and seamless booking experience.

![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Pages & Components](#pages--components)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Assumptions](#assumptions)

---

## 🎯 Overview

Scaller Frontend is a Cal.com clone that provides a complete scheduling solution. The UI is meticulously crafted to match Cal.com's design language, featuring:

- Clean, minimalist aesthetic with careful attention to spacing and typography
- Dark theme support following Cal.com's color palette
- Responsive layouts for desktop, tablet, and mobile devices
- Smooth animations and micro-interactions for enhanced UX

---

## 📊 Implementation Status

This section maps the **assignment requirements** to what has been **implemented** in this frontend application.

### Core Features (Must Have) - 100% Complete ✅

#### 1. Event Types Management

| Requirement | Status | Implementation Details |
|-------------|:------:|------------------------|
| Create event types with title, description, duration, URL slug | ✅ | Modal form with all fields, validation, and color picker |
| Edit existing event types | ✅ | Edit modal pre-filled with existing data |
| Delete event types | ✅ | Delete confirmation via dropdown menu |
| List all event types on dashboard | ✅ | Card-based grid layout with all event details |
| Unique public booking link per event | ✅ | Auto-generated `/username/slug` URL with copy button |

#### 2. Availability Settings

| Requirement | Status | Implementation Details |
|-------------|:------:|------------------------|
| Set available days of the week | ✅ | Day checkboxes (Mon-Sun) in schedule editor |
| Set available time slots for each day | ✅ | Start/end time pickers for each day |
| Set timezone for availability | ✅ | Timezone dropdown with globe icon display |

#### 3. Public Booking Page

| Requirement | Status | Implementation Details |
|-------------|:------:|------------------------|
| Calendar view to select date | ✅ | Interactive calendar with date navigation |
| Display available time slots | ✅ | Dynamic slot generation based on availability |
| Booking form (name & email) | ✅ | Clean form with validation |
| Prevent double booking | ✅ | Slots hidden when already booked |
| Booking confirmation page | ✅ | Success page with meeting details and actions |

#### 4. Bookings Dashboard

| Requirement | Status | Implementation Details |
|-------------|:------:|------------------------|
| View upcoming bookings | ✅ | "Upcoming" tab with future meetings |
| View past bookings | ✅ | "Past" tab with historical meetings |
| Cancel a booking | ✅ | Cancel button on each booking and confirmation page |

---

### Bonus Features (Good to Have) - 7/7 Implemented ✅

| Feature | Status | Implementation Details |
|---------|:------:|------------------------|
| **Responsive Design** | ✅ | Mobile, tablet, and desktop layouts with CSS breakpoints |
| **Multiple Availability Schedules** | ✅ | Create, edit, delete multiple schedules; set default |
| **Date Overrides** | ✅ | Block specific dates or set custom hours per date |
| **Rescheduling Flow** | ✅ | Reschedule button with new date/time selection |
| **Email Notifications** | ✅ | Confirmation & cancellation emails via backend Nodemailer |
| **Buffer Time** | ✅ | Buffer before/after meetings configurable per event type |
| **Custom Booking Questions** | ✅ | Add custom questions to event types, displayed on booking form |

---

### UI/UX Implementation - Cal.com Design Match

| Aspect | Status | Details |
|--------|:------:|---------|
| **Visual Similarity** | ✅ | Pixel-perfect match to Cal.com's dark theme |
| **Color Palette** | ✅ | Exact hex colors from Cal.com (#0f0f0f, #1c1c1c, etc.) |
| **Typography** | ✅ | System font stack matching Cal.com |
| **Spacing & Layout** | ✅ | Consistent padding, margins, and grid layouts |
| **Interactive States** | ✅ | Hover, focus, and active states on all elements |
| **Animations** | ✅ | Smooth transitions and micro-interactions |
| **Icons** | ✅ | SVG icons matching Cal.com style |
| **Dark Theme** | ✅ | Full dark mode implementation |

---

### Feature Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION SUMMARY                    │
├─────────────────────────────────────────────────────────────┤
│  Core Features:        4/4  (100%)  ████████████████████ ✅ │
│  Bonus Features:       7/7  (100%)  ████████████████████ ✅ │
│  UI/UX Match:          8/8  (100%)  ████████████████████ ✅ │
├─────────────────────────────────────────────────────────────┤
│  TOTAL COMPLETION:     100%         ████████████████████ ✅ │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Event Types Dashboard** | Create, edit, and manage event types with custom durations and colors |
| **Availability Management** | Set weekly schedules, timezone, and date overrides |
| **Public Booking Page** | Calendar view with available time slots for guests to book |
| **Bookings Dashboard** | View upcoming, past, and cancelled bookings with filters |
| **Booking Confirmation** | Clean confirmation page with meeting details |

### Bonus Features

| Feature | Description |
|---------|-------------|
| **Responsive Design** | Optimized for all screen sizes |
| **Multiple Schedules** | Support for multiple availability profiles |
| **Date Overrides** | Block specific dates or set different hours |
| **Email Notifications** | Confirmation/cancellation emails (via backend) |
| **Buffer Time** | Support for buffer before/after meetings |
| **Custom Questions** | Add custom questions to booking forms |

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI component library |
| **CSS Modules** | Scoped component styling |
| **date-fns** | Date formatting and manipulation |
| **ESLint** | Code linting and quality |

### Why This Stack?

- **Next.js App Router** - Modern file-based routing with server components support
- **Vanilla CSS** - Maximum flexibility without framework constraints, matching Cal.com's precise design
- **date-fns** - Lightweight, modular date library for formatting and timezone handling

---

## 📄 Pages & Components

### Application Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.js                 # Root layout with sidebar
│   ├── page.js                   # Home redirect
│   ├── globals.css               # Global styles & design system
│   │
│   ├── event-types/              # Event Types Management
│   │   └── page.js               # List, create, edit, delete event types
│   │
│   ├── availability/             # Availability Settings
│   │   └── page.js               # Manage schedules & overrides
│   │
│   ├── bookings/                 # Bookings Dashboard
│   │   └── page.js               # View & manage all bookings
│   │
│   └── [username]/               # Public Booking Routes
│       └── [eventSlug]/
│           ├── page.js           # Public booking page
│           └── booking/
│               └── [uid]/
│                   └── page.js   # Booking confirmation
│
└── components/                   # Reusable Components
    └── Sidebar.js               # Navigation sidebar
```

### Page Descriptions

#### `/event-types` - Event Types Dashboard
- **Features**: List all event types, create new events via modal, edit/duplicate/delete via dropdown menu
- **UI**: Card-based layout with color indicators, toggle switches for active/inactive status
- **Cal.com Matching**: Pixel-perfect recreation of event type cards, modal design, and interactions

#### `/availability` - Availability Settings
- **Features**: View/create availability schedules, set weekly hours, timezone selection, date overrides
- **UI**: Schedule cards showing days and time ranges, modal for editing
- **Cal.com Matching**: Globe icon with timezone display, default badge, action menus

#### `/bookings` - Bookings Dashboard
- **Features**: Filter by status (upcoming, unconfirmed, recurring, past, cancelled), cancel bookings
- **UI**: Grouped by date with TODAY header, booking cards with attendee info
- **Cal.com Matching**: Tab navigation, date grouping, pagination controls

#### `/[username]/[eventSlug]` - Public Booking Page
- **Features**: Calendar date picker, available time slots, booking form with custom questions
- **UI**: Two-column layout (event info + calendar), dynamic slot display
- **Cal.com Matching**: Calendar styling, slot buttons, form design

#### `/[username]/[eventSlug]/booking/[uid]` - Booking Confirmation
- **Features**: Display meeting details, success message, cancel option
- **UI**: Clean confirmation card with meeting summary
- **Cal.com Matching**: Check icon, card styling, action buttons

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- Running backend server (see [Scaller Backend](../server/README.md))

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scaller-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `NEXT_PUBLIC_API_URL` to point to your backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL
# Local Development
NEXT_PUBLIC_API_URL=http://localhost:5001

# Production (your deployed backend URL)
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 🎨 Design System

### Color Palette

The application uses Cal.com's dark theme color palette:

```css
/* Background Colors */
--bg-primary: #0f0f0f;        /* Main background */
--bg-secondary: #1c1c1c;      /* Cards, containers */
--bg-tertiary: #2a2a2a;       /* Hover states */
--bg-elevated: #262626;       /* Elevated surfaces */

/* Text Colors */
--text-primary: #ffffff;      /* Primary text */
--text-secondary: #a1a1a1;    /* Secondary text */
--text-muted: #737373;        /* Muted/disabled text */

/* Accent Colors */
--accent-primary: #e5e5e5;    /* Primary actions */
--accent-purple: #7C3AED;     /* Brand purple */
--accent-blue: #2563EB;       /* Links, info */
--accent-green: #059669;      /* Success states */
--accent-red: #dc2626;        /* Error, cancel */

/* Border Colors */
--border-color: #333333;      /* Default borders */
--border-hover: #525252;      /* Hover borders */
```

### Typography

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px - Small labels */
--text-sm: 0.875rem;   /* 14px - Body text */
--text-base: 1rem;     /* 16px - Default */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Headings */
--text-2xl: 1.5rem;    /* 24px - Page titles */
```

### Component Patterns

#### Cards
```css
.card {
  background: #1c1c1c;
  border: 1px solid #333333;
  border-radius: 8px;
  padding: 16px;
}
```

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #e5e5e5;
  color: #0f0f0f;
  border-radius: 6px;
  padding: 8px 16px;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #ffffff;
  border: 1px solid #333333;
}
```

#### Inputs
```css
.input {
  background: #1c1c1c;
  border: 1px solid #333333;
  border-radius: 6px;
  color: #ffffff;
  padding: 10px 14px;
}
```

---

## ☁️ Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.railway.app
   ```

4. **Deploy**
   Vercel will automatically build and deploy your application

### Deploy to Netlify

1. Create a new site from Git
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Site settings

---

## 📸 Screenshots

### Event Types Dashboard
The main dashboard displays all event types in a card layout with:
- Event title and duration badge
- Color-coded left border
- Active/inactive toggle
- Copy link and more options menu

### Availability Settings
Manage your schedules with:
- Schedule name and timezone
- Weekly hours displayed (e.g., "Mon - Fri, 9:00 AM - 5:00 PM")
- Default schedule badge
- Edit and delete actions

### Public Booking Page
Guest-facing booking interface featuring:
- Event host info and description
- Calendar date picker
- Available time slot buttons
- Booking form with name and email

### Bookings Dashboard
Track all meetings with:
- Tab filters (Upcoming, Past, Cancelled)
- Date-grouped booking list
- Meeting details (title, attendees, time)
- Cancel and reschedule actions

---

## 📝 Assumptions

1. **No Authentication** - The app assumes a default user is logged in. Authentication is not implemented as per assignment requirements.

2. **Default User** - All API calls are made for user ID 1, which is seeded in the database.

3. **Timezone Handling** - The frontend displays times in the user's local timezone, with timezone selection available in availability settings.

4. **Browser Support** - Designed for modern browsers (Chrome, Firefox, Safari, Edge). IE11 is not supported.

5. **API Availability** - The frontend expects the backend API to be available at the configured `NEXT_PUBLIC_API_URL`.

6. **Responsive Breakpoints**:
   - Mobile: < 640px
   - Tablet: 640px - 1024px
   - Desktop: > 1024px

---

## 📁 Project Structure

```
scaller-client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.js           # Root layout
│   │   ├── page.js             # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── event-types/        # Event types pages
│   │   ├── availability/       # Availability pages
│   │   ├── bookings/           # Bookings pages
│   │   └── [username]/         # Public booking pages
│   │
│   └── components/             # Shared components
│       └── Sidebar.js          # Navigation sidebar
│
├── public/                     # Static assets
├── package.json                # Dependencies
├── next.config.mjs             # Next.js configuration
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 🔗 Related

- [Scaller Backend](https://github.com/your-username/scaller-server) - Express.js API server
- [Cal.com](https://cal.com) - Original inspiration

---

## 🤝 Contributing

This is an assignment project. Feel free to fork and modify for learning purposes.

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

**Built with ❤️ as part of SDE Intern Fullstack Assignment**
