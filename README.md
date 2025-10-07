# Android + OpenCV (C++) + OpenGL ES + TypeScript Web Viewer

This repository contains a minimal Android application that captures camera frames, processes them via OpenCV in native C++ (through JNI), and renders the output using OpenGL ES 2.0. Additionally, there is a small TypeScript web viewer to display a sample processed frame with basic stats overlay.

## Structure

- `app/`: Android application module (Kotlin/Java)
- `jni/`: Native C++ sources and OpenCV processing code
- `gl/`: Notes for OpenGL renderer organization (renderer code lives under `app/src/main/java/.../gl`)
- `web/`: TypeScript-based minimal web viewer

## Features

- Camera feed via Camera2 with `TextureView`/`SurfaceTexture`
- Frame processing with OpenCV (C++) through JNI
- Rendering with OpenGL ES 2.0 (texture-based)
- Minimal TypeScript web page to display a sample processed frame

## Setup (High-level)

1. Install Android Studio, Android SDK, NDK, and CMake.
2. Install OpenCV Android SDK and set `OpenCV_DIR` appropriately in your environment or `local.properties`.
3. Open this project in Android Studio and let it sync Gradle.
4. Build and run on a physical device (camera required).

See detailed instructions later once the native and renderer parts are filled in.

## License

MIT


