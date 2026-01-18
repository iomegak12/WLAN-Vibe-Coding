# WLAN Warehouse Mobile App

**Android Warehouse Management System**

## 📱 About

WLAN Warehouse is a mobile application designed for warehouse staff to efficiently manage products through scanning, searching, and CRUD operations. Built with React Native and Expo for Android devices.

## 🚀 Features

- **Fast Product Scanning**: QR code and barcode scanning
- **Product Search**: Advanced search with filters
- **Product Management**: Create, read, update, and delete products
- **Profile Management**: User profile and settings
- **Offline Support**: (Coming Soon)

## 🛠 Tech Stack

- **Framework**: React Native 0.73+ / Expo SDK 54
- **Language**: JavaScript (ES6+)
- **UI Library**: React Native Paper (Material Design 3)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v6
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Yup
- **Storage**: AsyncStorage + Expo Secure Store

## 📦 Installation

```bash
# Install dependencies
npm install

# Run on Android
npx expo run:android

# Development build
npx expo prebuild
cd android && ./gradlew assembleDebug
```

## 🏗 Project Structure

```
wlan-mobile/
├── src/
│   ├── api/              # API services and interceptors
│   ├── assets/           # Images, icons
│   ├── components/       # Reusable components
│   ├── config/           # App configuration
│   ├── constants/        # Constants
│   ├── hooks/            # Custom hooks
│   ├── navigation/       # Navigation setup
│   ├── screens/          # Screen components
│   ├── store/            # Redux store and slices
│   ├── theme/            # Theme configuration
│   ├── utils/            # Utility functions
│   └── validators/       # Validation schemas
├── App.js
└── app.json
```

## 📋 Development Phases

- [x] **Phase 0**: Foundation Setup ✅
- [ ] **Phase 1**: Authentication & Session Management
- [ ] **Phase 2**: Profile Management
- [ ] **Phase 3**: Categories & Sub-categories
- [ ] **Phase 4**: Product Search & List
- [ ] **Phase 5**: Product Details Screen
- [ ] **Phase 6**: Scanner Implementation
- [ ] **Phase 7**: Product Create/Edit Forms
- [ ] **Phase 8**: Error Handling & Feedback
- [ ] **Phase 9**: Testing & QA
- [ ] **Phase 10**: Optimization & Polish
- [ ] **Phase 11**: Deployment Preparation

## 🔧 Environment Variables

Create a `.env` file:

```env
ENV=development
API_BASE_URL_AUTH=http://localhost:5001/api/v1
API_BASE_URL_PMS=http://localhost:5002/api/v1
```

## 📱 Minimum Requirements

- Android 12+ (API Level 31)
- 2GB RAM minimum
- Camera (for scanning)

## 👥 Team

- Development Team Lead
- Mobile Developers
- QA Engineers

## 📄 License

Proprietary - WLAN Corporation

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2026
