# Kotatsu Parsers rules
-keep class org.kotatsu.parsers.** { *; }
-keep interface org.kotatsu.parsers.** { *; }
-keepclassmembers class org.kotatsu.parsers.** { *; }

# Kotlin rules
-keep class kotlin.** { *; }
-keep interface kotlin.** { *; }
-keepclassmembers class kotlin.** { *; }

# Coroutines rules
-keep class kotlinx.coroutines.** { *; }
-keep interface kotlinx.coroutines.** { *; }
-keepclassmembers class kotlinx.coroutines.** { *; }

# React Native rules
-keep class com.facebook.react.** { *; }
-keepclassmembers class com.facebook.react.** { *; }

# OkHttp rules
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-keepclassmembers class okhttp3.** { *; }

# Gson
-keep class com.google.gson.** { *; }
-keepclassmembers class com.google.gson.** { *; }

# Native module
-keep class com.testempo.KotatsuParserModule { *; }
-keep class com.testempo.KotatsuParserPackage { *; }
-keepclassmembers class com.testempo.KotatsuParserModule { *; }
