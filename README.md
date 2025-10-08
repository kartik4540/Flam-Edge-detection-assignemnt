# Real-Time Edge Detection System
**Android + OpenCV + OpenGL + Web Viewer**

An R&D Intern Assessment Project demonstrating real-time camera processing with edge detection using native Android development and web technologies.

## 📋 Table of Contents
- [Features](#-features-implemented)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Setup Instructions](#-setup-instructions)
- [How to Run](#-how-to-run)
- [Project Structure](#-project-structure)
- [Development Process](#-development-process)

## ✅ Features Implemented

### Android App
- **📸 Camera Integration**: Camera2 API with TextureView for live preview
- **🔄 Real-time Processing**: YUV to RGBA conversion with JNI bridge
- **🎨 OpenGL Rendering**: OpenGL ES 2.0 texture rendering with custom shaders
- **⚡ Performance**: 10-15+ FPS with FPS counter overlay
- **🎛️ Toggle Controls**: Switch between raw grayscale and Canny edge detection
- **📱 Native UI**: Clean Android interface with real-time feedback

### Web Viewer
- **🌐 Live Webcam**: Browser-based camera access with getUserMedia
- **🎨 Real-time Effects**: Grayscale and Sobel edge detection
- **💾 Save Frames**: Download processed frames as PNG files
- **📊 Performance Stats**: FPS and resolution monitoring
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🎯 Professional UI**: Modern gradient design with glassmorphism effects

## 📷 Screenshots

*Add your screenshots here showing:*
- Android app running with camera feed and edge detection
- Web viewer with live processing
- FPS performance metrics
- Toggle between different processing modes

## 🛠️ Tech Stack

### Required Technologies (All Used)
- **Android SDK**: Kotlin/Java for mobile app development
- **NDK**: Native Development Kit for C++ integration
- **OpenGL ES 2.0+**: Hardware-accelerated graphics rendering
- **OpenCV (C++)**: Computer vision library for image processing
- **JNI**: Java Native Interface for Android ↔ C++ communication
- **TypeScript**: Web-based viewer and debug tool

### Optional Technologies (Used)
- **GLSL Shaders**: Custom vertex and fragment shaders for OpenGL
- **Camera2 API**: Modern Android camera access (instead of CameraX)

### Dependencies
- **Android**: AndroidX libraries (appcompat, material, camera2, lifecycle)
- **Web**: TypeScript compiler and http-server only
- **Native**: OpenCV C++ and Android log library

## 🧠 Architecture

### High-Level Flow
```
Camera2 → YUV Frames → RGBA Conversion → JNI → OpenCV C++ → OpenGL ES → Display
                                                                    ↓
Web Camera → Canvas Processing → Sobel/Grayscale → Real-time Display
```

### Detailed Architecture

#### Android App (`/app`)
- **MainActivity.kt**: Main UI controller, FPS counter, toggle logic
- **CameraController.kt**: Camera2 API integration, YUV→RGBA conversion
- **NativeBridge.kt**: JNI interface declarations
- **GLView.kt**: OpenGL ES 2.0 surface wrapper
- **GrayFrameRenderer.kt**: OpenGL renderer with custom shaders

#### Native Processing (`/jni`)
- **native-lib.cpp**: OpenCV C++ processing (Canny edge detection, grayscale)
- **CMakeLists.txt**: Build configuration for NDK and OpenCV

#### Web Viewer (`/web`)
- **index.html**: Professional UI with responsive design
- **index.ts**: TypeScript implementation with Canvas API
- **package.json**: Build configuration and dependencies

### Data Flow
1. **Camera Capture**: Camera2 API captures YUV_420_888 frames
2. **Format Conversion**: YUV converted to RGBA8888 in Kotlin
3. **JNI Bridge**: RGBA data sent to native C++ via JNI
4. **OpenCV Processing**: C++ applies Canny edge detection or grayscale
5. **OpenGL Rendering**: Processed grayscale data rendered as texture
6. **Web Processing**: Parallel web viewer with browser camera and Canvas API

## ⚙️ Setup Instructions

### Prerequisites
- **Android Studio** (latest version)
- **Android SDK** (API level 34)
- **Android NDK** (r26 or later)
- **CMake** (3.22.1 or later)
- **OpenCV Android SDK** (4.x)
- **Node.js** (for web viewer)

### Step 1: Install Android Development Tools
1. Download and install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio and install:
   - Android SDK (API 34)
   - Android NDK (r26+)
   - CMake (3.22.1+)
3. Set up environment variables:
   ```bash
   export ANDROID_HOME=/path/to/Android/Sdk
   export NDK_HOME=$ANDROID_HOME/ndk/26.x.x.x
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

### Step 2: Install OpenCV
1. Download [OpenCV Android SDK](https://opencv.org/releases/)
2. Extract to a folder (e.g., `C:\OpenCV-android-sdk`)
3. Set OpenCV path in `local.properties`:
   ```properties
   opencv.dir=C:\\path\\to\\OpenCV-android-sdk
   ```
4. Or set environment variable:
   ```bash
   export OpenCV_DIR=/path/to/OpenCV-android-sdk/sdk/native/jni
   ```

### Step 3: Clone and Setup Project
```bash
git clone <your-repo-url>
cd edge-detection-system
```

### Step 4: Build Android App
1. Open project in Android Studio
2. Let Gradle sync and CMake configure
3. Connect Android device or start emulator
4. Build and run the `app` configuration

### Step 5: Setup Web Viewer
```bash
cd web
npm install
npm run build
npm start
```

## 🚀 How to Run

### Android App
1. **Launch**: Open the app on your Android device
2. **Permissions**: Grant camera permission when prompted
3. **View**: See live camera feed with processed frames
4. **Toggle**: Tap "Toggle" button to switch between grayscale and edge detection
5. **Monitor**: Watch FPS counter for performance metrics

### Web Viewer
1. **Open**: Navigate to `http://localhost:8080`
2. **Start**: Click "Start Camera" and allow browser permissions
3. **Process**: Toggle "Grayscale" or "Edge Detection" checkboxes
4. **Save**: Click "Save Frame" to download processed images
5. **Stop**: Click "Stop" to end camera session

## 📁 Project Structure

```
edge-detection-system/
├── app/                          # Android application
│   ├── src/main/
│   │   ├── java/com/example/edgeviewer/
│   │   │   ├── MainActivity.kt           # Main UI controller
│   │   │   ├── NativeBridge.kt           # JNI interface
│   │   │   ├── camera/
│   │   │   │   └── CameraController.kt   # Camera2 integration
│   │   │   └── gl/
│   │   │       ├── GLView.kt             # OpenGL surface
│   │   │       └── GrayFrameRenderer.kt  # OpenGL renderer
│   │   ├── res/                          # Android resources
│   │   └── AndroidManifest.xml           # App configuration
│   └── build.gradle                      # Android build config
├── jni/                          # Native C++ code
│   ├── src/
│   │   └── native-lib.cpp                # OpenCV processing
│   └── CMakeLists.txt                    # CMake configuration
├── web/                          # TypeScript web viewer
│   ├── src/
│   │   └── index.ts                      # Web viewer logic
│   ├── index.html                        # Web UI
│   ├── package.json                      # Node.js dependencies
│   └── tsconfig.json                     # TypeScript config
├── build.gradle                  # Root build configuration
├── settings.gradle               # Gradle settings
└── README.md                     # This file
```

## 🔄 Development Process

### Git Commit History
The project follows incremental development with meaningful commits:

1. **Initial Setup**: Project scaffolding and basic structure
2. **Android Foundation**: Gradle configuration, manifest, basic UI
3. **JNI Integration**: Native bridge and CMake setup
4. **Camera Implementation**: Camera2 API with TextureView
5. **OpenGL Renderer**: ES 2.0 rendering with custom shaders
6. **OpenCV Processing**: C++ edge detection and grayscale
7. **Web Viewer**: TypeScript implementation with live camera
8. **UI Polish**: Professional design and mobile responsiveness
9. **Features**: Save functionality and performance optimizations

### Key Development Decisions
- **Camera2 over CameraX**: More control over frame processing
- **OpenGL ES 2.0**: Wide device compatibility
- **JNI over NDK**: Direct C++ integration for performance
- **TypeScript**: Type safety for web development
- **Canvas API**: No external frameworks for web processing

## 🐛 Troubleshooting

### Common Issues

#### Android Build Issues
- **OpenCV not found**: Ensure `OpenCV_DIR` is set correctly
- **NDK errors**: Update to NDK r26 or later
- **CMake errors**: Check CMake version (3.22.1+)

#### Web Viewer Issues
- **Camera not working**: Ensure HTTPS or localhost
- **getUserMedia error**: Check browser permissions
- **Build errors**: Run `npm install` and `npm run build`

#### Performance Issues
- **Low FPS**: Reduce camera resolution or processing complexity
- **Memory leaks**: Ensure proper cleanup in onDestroy()
- **JNI crashes**: Check array bounds and null pointers

## 📝 License

This project is created for educational purposes as part of an R&D Intern Assessment.

## 👨‍💻 Author

**Kartik Mittal**
- GitHub: [@kartikmittal](https://github.com/kartikmittal)
- Project: Real-Time Edge Detection System

---
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/173f58a1-416e-467b-8898-79c364903c53" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/8f1cd921-88da-459d-a751-95b90b10fd20" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/8580bfdd-a8bc-48fb-a81d-abbf5d3872a0" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/02df6f77-6edb-4889-bf95-b37783fd55cb" />


*This project demonstrates proficiency in Android native development, computer vision, graphics programming, and web technologies.*
