# WLAN Warehouse Management System - Web UI

A modern web application for warehouse management built with React 18, Material-UI v5, and Vite.

## Tech Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **UI Library**: Material-UI v5.15.6
- **State Management**: React Context API
- **Forms**: React Hook Form 7.49.3
- **HTTP Client**: Axios 1.6.5
- **Routing**: React Router v6.21.3
- **Node Version**: v22

## Project Structure

```
src/
├── components/          # Shared components
│   ├── DashboardLayout.jsx
│   └── ProtectedRoute.jsx
├── contexts/            # React contexts for global state
│   ├── AuthContext.jsx  # Authentication state & logic
│   └── UIContext.jsx    # UI state (sidebar, snackbar, etc.)
├── features/            # Feature-based modules
│   ├── auth/
│   │   └── pages/
│   │       └── LoginPage.jsx
│   ├── dashboard/
│   ├── users/
│   ├── roles/
│   ├── categories/
│   └── products/
├── routes/              # Routing configuration
│   └── AppRoutes.jsx
├── services/            # API service layers
│   ├── api.js           # Axios instances & interceptors
│   ├── authService.js   # AUTH API endpoints
│   └── pmsService.js    # PMS API endpoints
├── theme.js             # Material-UI theme configuration
├── App.jsx              # Root component
└── main.jsx             # Application entry point
```

## Backend Services

- **AUTH Service**: `http://localhost:5001` - Authentication & user management
- **PMS Service**: `http://localhost:5002` - Product management system

## Getting Started

### Prerequisites

- Node.js v22 or higher
- Backend services running on ports 5001 (AUTH) and 5002 (PMS)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Configuration

Copy `.env.example` to `.env.development` and configure:

```env
VITE_AUTH_API_URL=http://localhost:5001
VITE_PMS_API_URL=http://localhost:5002
VITE_SESSION_TIMEOUT=1800000
VITE_TOKEN_REFRESH_INTERVAL=300000
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

### Phase 0 - Foundation ✅
- Project setup with Vite + React 18
- Material-UI theme configuration (Tabler-inspired indigo blue)
- Axios service layer with interceptors
- Authentication context with token management
- UI context for global state
- Protected routing with permission checks
- Environment configuration

### Phase 1 - Authentication Core (In Progress)
- Complete login page with form validation
- Token refresh mechanism
- Session timeout handling
- Logout functionality

### Upcoming Phases
- Phase 2: App Shell (Sidebar, TopBar, Navigation)
- Phase 3: Dashboard
- Phase 4: User Management
- Phase 5: Role Management
- Phase 6: Category Management
- Phase 7: Sub-Category Management
- Phase 8: Product Management
- Phase 9: Polish & Testing

## Authentication

The app uses JWT-based authentication with:
- Access token (short-lived)
- Refresh token (stored in httpOnly cookie)
- Automatic token refresh every 5 minutes
- Session timeout after 30 minutes of inactivity
- Automatic logout on authentication failures

## Permissions

Role-based access control with permissions:
- `user:read`, `user:write`, `user:delete`
- `role:read`, `role:write`, `role:delete`
- `category:read`, `category:write`, `category:delete`
- `subcategory:read`, `subcategory:write`, `subcategory:delete`
- `product:read`, `product:write`, `product:delete`

## Design System

### Colors
- Primary: Indigo Blue (#6366f1)
- Secondary: Slate (#64748b)
- Success: Emerald (#10b981)
- Error: Red (#ef4444)
- Warning: Amber (#f59e0b)
- Info: Sky Blue (#0ea5e9)

### Typography
- Font: Inter (system fallback: -apple-system, Segoe UI, Roboto)
- Scale: 12px to 48px with 8 variants

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Proprietary - WLAN Warehouse Management System
