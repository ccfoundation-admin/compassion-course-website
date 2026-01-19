---
name: compassion-course-website
description: Specialized agent for the Compassion Course website project. Provides context-aware assistance for Firebase integration, admin management, webcast scheduling, Circle community integration, and platform features.
metadata:
  short-description: Compassion Course website development assistant
---

# Compassion Course Website Agent

This skill provides specialized knowledge and workflows for developing and maintaining the Compassion Course website.

## Project Overview

The Compassion Course website is a React/TypeScript application built with:
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Firebase (Firestore, Authentication, Hosting, Functions)
- **Styling**: Custom CSS with #002B4D as primary color
- **Deployment**: Firebase Hosting via GitHub Actions

## Key Features

### Authentication
- Firebase Authentication with Email/Password and Google Sign-in
- Admin authentication via Firestore `admins` collection or custom claims
- User profiles stored in Firestore `userProfiles` collection
- Protected routes: `UserProtectedRoute` for users, `ProtectedRoute` for admins

### Admin Features
- Admin Dashboard: `/admin`
- Webcast Management: `/admin/webcasts` - Schedule and manage Google Meet webcasts
- Admin Management: `/admin/manage` - Grant/revoke admin rights
- Admin Login: `/admin/login-4f73b2c` or `/admin/login` (supports Google Sign-in)

### User Features
- Portal: `/portal` - Main user portal
- Circle Community: `/portal/circle` - Embedded Circle.so community
- Platform Dashboard: `/platform` - Access to communities, courses, webcasts
- Webcasts: `/platform/webcasts` - View and join Google Meet webcasts with translation support

### Webcast System
- Google Meet integration with 69 language translation support
- Recurring webcast patterns (daily/weekly/monthly)
- Embedded Meet iframe with language selection
- Admin scheduling interface

## Project Structure

```
src/
├── pages/
│   ├── admin/          # Admin-only pages
│   ├── platform/       # User platform pages
│   └── ...             # Public pages
├── components/         # Reusable components
├── context/            # React contexts (Auth, Content)
├── services/           # Firebase service functions
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Important Files

- `src/App.tsx` - Main routing configuration
- `src/context/AuthContext.tsx` - Authentication and admin checking
- `src/firebase/firebaseConfig.ts` - Firebase configuration
- `src/services/webcastService.ts` - Webcast management
- `src/utils/meetLanguages.ts` - Google Meet language support (69 languages)

## Common Tasks

### Adding New Features
1. Create component in appropriate `pages/` subdirectory
2. Add route to `src/App.tsx` with appropriate protection
3. Update navigation if needed
4. Add service functions if database operations needed

### Admin Access
- First admin: `info@compassioncf.com` (set in `ADMIN_EMAILS` array)
- Admin documents stored in Firestore: `admins/{email}` with `{ role: 'admin' }`
- Custom claims: `admin: true` in JWT token (future enhancement)

### Styling Guidelines
- Primary color: `#002B4D`
- Secondary text: `#6b7280`
- Use consistent card styling with white background, rounded corners, subtle shadows
- Navigation always visible via `Layout` component

## Deployment

- GitHub Actions workflow: `.github/workflows/firebase-deploy.yml`
- Uses `google-github-actions/auth@v2` for authentication
- Secrets required: `GCP_SA_KEY_JSON` (raw JSON service account key)
- Project ID: `compassion-course-websit-937d6` (Firebase), `compassioncf-web-site` (GCP)

## Notes

- Always keep site navigation visible (use `Layout` component)
- Handle offline Firebase errors gracefully (they're expected during initialization)
- Use `UserProtectedRoute` for user pages, `ProtectedRoute` for admin pages
- Google Meet links can be manual or auto-generated (placeholder for future API integration)
- Admin management uses Firestore `admins` collection with email as document ID
