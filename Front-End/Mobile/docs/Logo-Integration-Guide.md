# Logo Integration Guide

## Current Status
The default Expo icons are currently in use. For a professional warehouse/scanning logo, we recommend:

## Recommended Free Icon Sources

### Option 1: Material Design Icons (Recommended)
- **Website**: https://materialdesignicons.com/
- **Suggested Icons**:
  - `warehouse` - Classic warehouse building icon
  - `barcode-scan` - Scanning icon
  - `package-variant` - Package/box icon
  - `qrcode-scan` - QR code scanner icon

### Option 2: Ionicons (Built into Expo)
Already included with React Native Paper:
- `ios-barcode-outline`
- `scan-outline`
- `cube-outline`

### Option 3: Custom Logo Design
For a branded logo, consider:
1. Combining warehouse + barcode imagery
2. Using brand colors: Primary #1976D2, Secondary #FF9800
3. Formats needed:
   - `icon.png` - 1024x1024px (app icon)
   - `adaptive-icon.png` - 1024x1024px (Android adaptive icon)
   - `splash-icon.png` - 1284x2778px (splash screen)

## How to Replace Icons

1. **Download/Create Icons**
   - Save as PNG format
   - Transparent background for adaptive icon

2. **Place in Assets Folder**
   ```
   wlan-mobile/
   ├── assets/
   │   ├── icon.png           (1024x1024)
   │   ├── adaptive-icon.png  (1024x1024)
   │   ├── splash-icon.png    (1284x2778)
   │   └── favicon.png        (48x48)
   ```

3. **Update app.json**
   Already configured - just replace the files!

## Current Configuration (app.json)
```json
{
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash-icon.png",
    "backgroundColor": "#1976D2"
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#1976D2"
    }
  }
}
```

## For Now
The default Expo icons are fine for development. We can update them before deployment in Phase 11.

## Recommended Action
Team can design a custom logo or select from Material Design Icons during Phase 1-2.

**Priority**: Low (can wait until Phase 10-11)
