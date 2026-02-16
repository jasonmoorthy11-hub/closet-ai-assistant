

# EasyClosets AI Design Assistant

## Overview
A mobile-first chat application where users upload photos of their spaces and receive AI-generated closet design inspiration. The app features a branded EasyClosets experience with navy blue (#1B3A5C) theming.

## Pages & Navigation

### Bottom Tab Bar
- Two tabs: **Chat** and **Gallery**
- Fixed at the bottom of the screen, above the input bar on the Chat page

### 1. Chat Page (Main)
- **Fixed Header**: Navy blue (#1B3A5C) background with white "EasyClosets" logo text on the left and a "New Chat" button on the right
- **Scrollable Chat Area**: Messages displayed in bubbles — AI messages (left-aligned, light gray #F3F4F6) and user messages (right-aligned, navy blue with white text)
- **Inline Images**: Uploaded photos and AI-generated designs render full-width inside chat bubbles with rounded corners
- **Quick Reply Pills**: After AI messages, a horizontally scrollable row of pill-shaped suggestion buttons (white background, navy border). Tapping sends that text as a message
- **Fixed Input Bar**: Pinned to the bottom with a camera icon (opens file picker for image upload), a text input field, and a send button

### 2. Template Gallery Page
- **Filter Chips**: Horizontal row at the top — All, Closet, Pantry, Laundry, Garage
- **Image Grid**: Curated inspiration images displayed in a responsive grid
- Tapping a template navigates to the Chat page with a pre-filled message referencing that design

### 3. Onboarding Overlay
- Full-screen overlay shown on first visit (tracked via localStorage)
- Three steps with illustrations:
  1. "Upload a photo of your space"
  2. "Chat about your style and needs"
  3. "Get AI-generated design inspiration"
- Skip button and Next/Done navigation buttons
- Dismissed permanently after completion or skip

## API Integration
- All API calls routed through a configurable `BASE_URL` variable (defaulting to `http://localhost:8000`)
- Chat messages, image uploads, and design generation requests will call this external backend
- No Supabase or Lovable Cloud backend needed — the app is a frontend client for an existing API

## Design System
- **Primary Color**: Navy blue (#1B3A5C)
- **AI Bubble**: Light gray (#F3F4F6)
- **Quick Reply Pills**: White with navy border
- **Typography**: Clean, modern sans-serif
- **Mobile-first layout** optimized for phone screens

