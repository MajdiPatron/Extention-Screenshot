# 📸 Pro Screenshot Tool

A professional, modern Chrome Extension for capturing beautiful screenshots with a premium UI experience.

## ✨ Features

- **🖼️ Capture Page** - Instantly capture the visible area of your current tab.
- **✂️ Capture Selection** - Select a specific area to capture with a precision spotlight tool.
- **⏱️ Timed Capture** - 3-second countdown to capture menus and transient elements.
- **🔍 Expandable Preview** - Click any preview to open it in a maximized full-screen window for verification.
- **� High Quality** - Optimized image processing for crisp, retina-ready screenshots.
- **⚡ Auto-Download** - One-click save to your Downloads folder.

## 🎯 Design Highlights

- **Vibrant gradient backgrounds** (pink → blue → lavender)
- **Glassmorphism effects** for modern aesthetic
- **Smooth animations** and micro-interactions
- **Premium button designs** with depth and shadows
- **Professional typography** using Segoe UI
- **Responsive hover effects** with scale and glow

## 📦 Installation

### From Source (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `screenshot` folder
5. The extension icon will appear in your toolbar!

### Usage

1. **Capture Page**:
   - Click the extension icon.
   - Click **Capture Page**.
   - Review in popup (click image to enlarge) or Download.
   
2. **Capture Selection**:
   - Click **Capture Selection**.
   - The screen will dim slightly (transparent).
   - Draw a box around the area you want.
   - A full-size preview window opens.
   - Click **Save Screenshot**.

3. **Timed Capture**:
   - Click **Timed Capture (3s)**.
   - Set up your screen (open menus, hovers).
   - Wait for the countdown... Flash! Capture complete.

## 🎨 Visual Assets

- **icon.png** - 128x128px extension icon with gradient camera design
- **Modern UI** - Sleek popup interface with premium aesthetics

## 🛠️ Technical Stack

- **Manifest V3** - Latest Chrome Extension standard
- **Vanilla JavaScript** - No dependencies, lightweight
- **Modern CSS** - Gradients, animations, glassmorphism
- **Chrome APIs** - `tabs`, `scripting`, `downloads`, `activeTab` permissions

## 📁 File Structure

```
screenshot/
├── manifest.json      # Extension configuration
├── popup.html         # Popup UI structure
├── popup.css          # Modern styling with animations
├── popup.js           # Screenshot capture logic
├── background.js      # Service worker & high-quality processing
├── content.js         # Selection tool & preview modal
├── content.css        # Styles for selection overlay
├── icon.png           # Extension icon
└── README.md          # This file
```

## � Key Improvements

- ✅ **Robust Selection**: Works even if page isn't refreshed.
- ✅ **Smart Preview**: Full-screen modal for detailed verification.
- ✅ **System Page Protection**: Warns if used on restricted Chrome pages.
- ✅ **English Interface**: All text standardized to English.

## 🔮 Future Enhancements

- [ ] Annotation tools (draw, text, arrows)
- [ ] Multiple screenshot formats (JPG, WebP)
- [ ] Custom save location

## 📄 License

Free to use and modify.

---

**Developed by Majdi using modern web technologies**
