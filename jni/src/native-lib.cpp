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


