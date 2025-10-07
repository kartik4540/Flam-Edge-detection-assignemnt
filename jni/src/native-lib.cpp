#include <jni.h>
#include <android/log.h>
#include <vector>

#ifdef OPENCV_AVAILABLE
#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>
#endif

#define LOG_TAG "EdgeProc"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_edgeviewer_NativeBridge_stringFromJNI(
        JNIEnv* env,
        jobject /* this */) {
    return env->NewStringUTF("EdgeProc JNI ready");
}

// In later steps, we will add a function to process an input RGBA buffer
// and return processed bytes (e.g., Canny edges or grayscale)

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_example_edgeviewer_NativeBridge_processRgba(
        JNIEnv* env,
        jobject /* this */,
        jbyteArray rgbaIn,
        jint width,
        jint height,
        jboolean useCanny) {
    const int w = static_cast<int>(width);
    const int h = static_cast<int>(height);
    const int numPixels = w * h;
    const int inSize = numPixels * 4; // RGBA8888

    jbyte* inPtr = env->GetByteArrayElements(rgbaIn, nullptr);
    if (!inPtr) return nullptr;

    std::vector<unsigned char> outGray(static_cast<size_t>(numPixels));

#ifdef OPENCV_AVAILABLE
    cv::Mat rgba(h, w, CV_8UC4, reinterpret_cast<unsigned char*>(inPtr));
    cv::Mat gray;
    cv::cvtColor(rgba, gray, cv::COLOR_RGBA2GRAY);
    if (useCanny) {
        cv::Mat edges;
        cv::Canny(gray, edges, 80.0, 150.0);
        gray = edges;
    }
    std::memcpy(outGray.data(), gray.data, static_cast<size_t>(numPixels));
#else
    // Fallback: naive luma approx
    const unsigned char* src = reinterpret_cast<unsigned char*>(inPtr);
    for (int i = 0; i < numPixels; ++i) {
        const int idx = i * 4;
        const unsigned char r = src[idx + 0];
        const unsigned char g = src[idx + 1];
        const unsigned char b = src[idx + 2];
        const unsigned char y = static_cast<unsigned char>(0.299f*r + 0.587f*g + 0.114f*b);
        outGray[i] = y;
    }
#endif

    env->ReleaseByteArrayElements(rgbaIn, inPtr, JNI_ABORT);
    jbyteArray out = env->NewByteArray(numPixels);
    if (!out) return nullptr;
    env->SetByteArrayRegion(out, 0, numPixels, reinterpret_cast<jbyte*>(outGray.data()));
    return out;
}


