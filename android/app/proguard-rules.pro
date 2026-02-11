# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ===========================================
# AppsFlyer ProGuard Rules
# ===========================================

# Keep all AppsFlyer classes
-keep class com.appsflyer.** { *; }
-keep class com.af.** { *; }
-keep class appsflyer.** { *; }

# Keep Install Referrer classes
-keep class com.android.installreferrer.** { *; }

# Keep conversion data callback classes
-keep class * implements com.appsflyer.AppsFlyerConversionListener { *; }

# Keep the conversion listener in the Application class
-keep class * extends android.app.Application {
    public void onConversionDataSuccess(***);
    public void onConversionDataFail(***);
    public void onAppOpenAttribution(***);
    public void onAttributionFailure(***);
}

# Keep AppsFlyer broadcast receivers
-keep class * extends com.appsflyer.AFEvent { *; }

# Keep AppsFlyer internal classes
-keep class com.appsflyer.internal.** { *; }

# Keep AppsFlyer's SDK version and build number
-keep class com.appsflyer.AFVersionDeclaration { *; }

# ===========================================
# Deep Linking / Intent Handling Rules
# ===========================================

# Keep activities that handle deep links
-keepclassmembers class * extends android.app.Activity {
    public void onCreate(android.os.Bundle);
    public void onNewIntent(android.content.Intent);
}

# Keep intent filter classes
-keep class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep classes that handle URIs and intents
-keep class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ===========================================
# Reflection / JSON / Serialization Rules
# ===========================================

# Keep classes that are used via reflection (common for deep link handlers)
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod

# Keep line numbers for stack traces
-keepattributes SourceFile,LineNumberTable

# Keep generic types for GSON/Jackson
-keepattributes Signature

# Keep class and member names for JSON serialization
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep model/POJO classes for deep link data
-keep class com.yourpackage.model.** { *; }
-keep class * implements java.io.Serializable { *; }

# ===========================================
# React Native Specific Rules (if using RN)
# ===========================================

# If you're using React Native, add these:
# -keep class com.facebook.react.** { *; }
# -keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
# -keep class * extends com.facebook.react.bridge.NativeModule { *; }
# -keep class com.facebook.react.bridge.CatalystInstanceImpl { *; }
# -keep class com.facebook.react.bridge.JavaScriptExecutor { *; }
# -keep class com.facebook.react.bridge.queue.** { *; }

# ===========================================
# Firebase / Other SDK Rules (if using)
# ===========================================

# If using Firebase with AppsFlyer:
# -keep class com.google.firebase.** { *; }
# -keep class com.google.android.gms.** { *; }

# ===========================================
# Network/HTTP Rules
# ===========================================

# Keep OkHttp/Retrofit classes if used
# -keep class okhttp3.** { *; }
# -keep class okio.** { *; }
# -keep class retrofit2.** { *; }

# ===========================================
# Debugging/Testing
# ===========================================

# Keep these for debugging deep link issues
-dontwarn com.appsflyer.**
-dontwarn com.android.installreferrer.**

# Keep log messages for debugging
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# ===========================================
# Custom Rules for Your App
# ===========================================

# Add your app's specific packages that handle deep links
# Example: -keep class com.yourcompany.yourapp.deeplink.** { *; }

# Keep your deep link receiver/parser classes
-keep class * {
    *** parseDeepLink(...);
    *** handleDeepLink(...);
    *** onDeepLinkReceived(...);
}

# If you use reflection to parse deep link data
-keepclassmembers class ** {
    @androidx.annotation.Keep <methods>;
    @com.yourcompany.KeepForDeepLinking <methods>;
}