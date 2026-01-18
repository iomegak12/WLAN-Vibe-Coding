# Phase 1 Testing Guide

## Prerequisites

1. **Backend Services Running:**
   - Auth Service: `http://localhost:5001/api/v1`
   - PMS Service: `http://localhost:5002/api/v1`

2. **Test User Account:**
   - Email: `test@wlan.com` (or your test account)
   - Password: `Test1234!` (minimum 8 characters)

---

## How to Run the App

### Option 1: Development Build (Recommended)
```bash
cd wlan-mobile

# Start Metro bundler
npm start

# In another terminal, run on Android
npm run android
```

### Option 2: Expo Go (If no custom native modules)
```bash
cd wlan-mobile
npx expo start
```

Then scan QR code with Expo Go app.

---

## Test Scenarios

### 1. Login Flow Testing

#### Test 1.1: Successful Login
1. Open the app
2. Complete onboarding if first time
3. Enter valid email and password
4. Check "Remember Me" checkbox
5. Tap "Sign In"

**Expected Result:**
- Loading indicator shows
- Success toast appears: "Welcome back!"
- Navigate to Home screen
- User name and email displayed

#### Test 1.2: Invalid Credentials
1. Enter invalid email or password
2. Tap "Sign In"

**Expected Result:**
- Error toast appears
- Error message displayed below button
- No navigation occurs

#### Test 1.3: Validation Errors
1. Enter invalid email format (e.g., "notanemail")
2. Tap outside input

**Expected Result:**
- Red error text: "Please enter a valid email address"

1. Enter password < 8 characters
2. Tap outside input

**Expected Result:**
- Red error text: "Password must be at least 8 characters"

#### Test 1.4: Show/Hide Password
1. Enter password
2. Tap eye icon

**Expected Result:**
- Password becomes visible/hidden

---

### 2. Session Persistence Testing

#### Test 2.1: Remember Me - Enabled
1. Login with "Remember Me" checked
2. Close app completely (swipe away from recents)
3. Reopen app

**Expected Result:**
- Loading screen shows briefly
- Auto-login to Home screen
- No login screen shown

#### Test 2.2: Remember Me - Disabled
1. Login WITHOUT "Remember Me" checked
2. Close app completely
3. Reopen app

**Expected Result:**
- Shows login screen
- Must login again

---

### 3. Auto-Logout Testing

#### Test 3.1: Inactivity Logout
1. Login successfully
2. Stay on Home screen
3. Don't interact with app for 15 minutes

**Expected Result:**
- After 15 minutes, automatically logged out
- Redirected to login screen

#### Test 3.2: Activity Tracking
1. Login successfully
2. Scroll the screen (records activity)
3. Wait 14 minutes
4. Tap logout button (records activity, resets timer)
5. Login again
6. Don't interact for 15 minutes

**Expected Result:**
- First auto-logout doesn't happen (timer reset)
- Second auto-logout happens after 15 min

---

### 4. Token Refresh Testing

> **Note:** This requires backend to return 401 for expired tokens

#### Test 4.1: Automatic Refresh
1. Login successfully
2. Wait for access token to expire (check backend expiry time)
3. Navigate or perform an action requiring API call

**Expected Result:**
- Request fails with 401
- Token refresh happens automatically
- Original request retries successfully
- No logout occurs

#### Test 4.2: Refresh Failure
1. Manually delete refresh token from storage (using dev tools)
2. Trigger an API request

**Expected Result:**
- Token refresh fails
- Automatic logout
- Redirect to login screen

---

### 5. Logout Testing

#### Test 5.1: Manual Logout
1. Login successfully
2. Tap "Logout" button on Home screen

**Expected Result:**
- Immediate logout
- All tokens cleared
- Redirect to login screen

#### Test 5.2: Logout API Call
1. Login successfully
2. Check backend logs
3. Tap "Logout"
4. Check backend logs again

**Expected Result:**
- Backend receives logout request
- Refresh token invalidated on server

---

### 6. App State Testing

#### Test 6.1: Background/Foreground
1. Login successfully
2. Send app to background (press home)
3. Wait 5 minutes
4. Open app again

**Expected Result:**
- App resumes
- Timer continues from last activity
- No unexpected logout

#### Test 6.2: Background Timeout
1. Login successfully
2. Send app to background
3. Wait 20 minutes
4. Open app again

**Expected Result:**
- Auto-logout triggered
- Redirect to login screen

---

### 7. Error Handling Testing

#### Test 7.1: Network Error
1. Turn off WiFi/mobile data
2. Try to login

**Expected Result:**
- Error toast: "Network error. Please check your connection."
- Helpful error message shown

#### Test 7.2: Server Error
1. Stop backend services
2. Try to login

**Expected Result:**
- Error toast about server unavailability
- Graceful error handling

---

## Debugging Tips

### Check Stored Tokens
Use React Native Debugger or Flipper to inspect:
- SecureStore: `access_token`, `refresh_token`
- AsyncStorage: `user_data`, `remember_me`

### Check Redux State
1. Open React Native Debugger
2. Go to Redux tab
3. Check `auth` state:
   - `isAuthenticated`
   - `user`
   - `accessToken`
   - `refreshToken`
   - `loading`
   - `error`

### Check Network Requests
1. Open Flipper
2. Go to Network tab
3. Monitor API calls to:
   - `/auth/login`
   - `/auth/refresh`
   - `/auth/logout`
   - `/auth/verify`

### Check Logs
```bash
# Android logs
npx react-native log-android

# Or use adb
adb logcat *:S ReactNative:V ReactNativeJS:V
```

---

## Common Issues & Solutions

### Issue: "Expo Secure Store not available"
**Solution:** You're using Expo Go. Need development build:
```bash
npx expo install expo-dev-client
npx expo run:android
```

### Issue: "Network request failed"
**Solution:** 
- Check backend is running
- Android emulator: Use `10.0.2.2` instead of `localhost`
- Update `src/config/api.config.js`:
  ```javascript
  BASE_URL: 'http://10.0.2.2:5001/api/v1'
  ```

### Issue: "Token refresh not working"
**Solution:**
- Check backend refresh endpoint works
- Verify token expiry times
- Check axios interceptor is configured

### Issue: "App crashes on login"
**Solution:**
- Check backend response format matches expected
- Check Redux store is properly configured
- Look at error logs

---

## Performance Checks

### App Launch Time
- **Target:** < 2 seconds to splash screen
- **Target:** < 3 seconds to login screen (first launch)
- **Target:** < 1 second to home screen (auto-login)

### Login Response Time
- **Target:** < 1 second for successful login
- **Target:** Immediate feedback on tap

### Memory Usage
- Monitor for memory leaks
- Check activity tracker cleanup

---

## Checklist Before Moving to Phase 2

- [ ] All login scenarios tested
- [ ] Session persistence works
- [ ] Auto-logout tested (15 min)
- [ ] Token refresh verified
- [ ] Logout clears all data
- [ ] Form validation works
- [ ] Error handling tested
- [ ] No crashes or freezes
- [ ] Performance acceptable
- [ ] UI looks good on different screen sizes

---

## Report Issues

When reporting bugs, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots/screen recording**
5. **Device info** (Android version, device model)
6. **Logs** (from adb logcat or Metro)

---

**Last Updated:** January 18, 2026
