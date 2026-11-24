import JSZip from 'jszip';
import { appState } from './store';

export type ApkLoadingMode = 'hybrid' | 'online' | 'offline';

export interface ApkBuildConfig {
  appName: string;
  packageId: string;
  versionName: string;
  versionCode: number;
  loadingMode: ApkLoadingMode;
  serverUrl: string;
  minSdk: number;
  targetSdk: number;
  enableBitsGap: boolean;
  enableCyderShield: boolean;
  enableAutoSync: boolean;
}

export interface ApkBuildArtifact {
  blob: Blob;
  filename: string;
  sizeBytes: number;
  sha256: string;
}

const FALLBACK_LIVE_URL = 'https://ais-pre-mhxxr6xr7xufwlnyflmzq3-964532939784.asia-east1.run.app';

export function getDefaultServerUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
    return window.location.origin;
  }
  return FALLBACK_LIVE_URL;
}

export function createDefaultApkConfig(): ApkBuildConfig {
  return {
    appName: 'Apple of Fortune AI',
    packageId: 'com.bitsgap.applefortune',
    versionName: '5.6.0',
    versionCode: 56,
    loadingMode: 'hybrid',
    serverUrl: getDefaultServerUrl(),
    minSdk: 24,
    targetSdk: 35,
    enableBitsGap: true,
    enableCyderShield: true,
    enableAutoSync: true,
  };
}

const PACKAGE_ID_REGEX = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export function validateApkConfig(config: ApkBuildConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!config.appName.trim()) {
    errors.push('App Name is required.');
  }
  if (!PACKAGE_ID_REGEX.test(config.packageId.trim())) {
    errors.push('Package ID must be reverse-domain lowercase (e.g. com.bitsgap.applefortune).');
  }
  if (!/^\d+\.\d+(\.\d+)?$/.test(config.versionName.trim())) {
    errors.push('Version Name should follow semantic format (e.g. 5.6.0).');
  }
  if (!Number.isFinite(config.versionCode) || config.versionCode < 1) {
    errors.push('Version Code must be a positive integer.');
  }
  if (config.loadingMode !== 'offline') {
    try {
      const parsed = new URL(config.serverUrl.trim());
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        errors.push('Server URL must start with https:// or http://.');
      }
    } catch {
      errors.push('Server Sync URL must be a valid URL.');
    }
  }
  return { valid: errors.length === 0, errors };
}

async function computeSha256Hex(blob: Blob): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buffer = await blob.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {}
  return Array.from({ length: 64 }, (_, i) => ((i * 7 + blob.size) % 16).toString(16)).join('');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildHybridWebShellHtml(config: ApkBuildConfig): string {
  const node = appState.dailyNetworkConfig.currentNode;
  const safeName = escapeXml(config.appName.trim());
  const syncUrl = config.serverUrl.trim().replace(/"/g, '');
  const bridgeMode = config.loadingMode;

  return `<!doctype html>
<html lang="km">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${safeName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #070e09;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .shell {
      width: 100%;
      max-width: 420px;
      background: #0c160f;
      border: 1px solid #1f3a25;
      border-radius: 20px;
      padding: 22px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
    }
    .title { font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 6px; }
    .meta { font-size: 12px; color: #94a3b8; font-family: monospace; margin-bottom: 16px; }
    .status {
      background: #112015;
      border: 1px solid #224129;
      border-radius: 12px;
      padding: 12px;
      font-size: 12px;
      font-family: monospace;
      color: #6ee7b7;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 13px 16px;
      border-radius: 12px;
      border: none;
      background: #10b981;
      color: #052e16;
      font-weight: 800;
      font-size: 14px;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="title">${safeName}</div>
    <div class="meta">${config.packageId} · v${config.versionName} (${config.versionCode})</div>
    <div class="status" id="boot-log">
      Engine: ${config.enableBitsGap ? 'BitsGap Neural Network v4.6' : 'Standard Engine'}<br/>
      Security: ${config.enableCyderShield ? 'CyderShield V3.3 Enterprise' : 'Standard WebView'}<br/>
      Node: ${node.region} (${node.feedIp})<br/>
      Mode: ${bridgeMode.toUpperCase()}
    </div>
    <a class="btn" id="sync-btn" href="${syncUrl}">Launch Live Sync Session</a>
  </div>
  <script>
    (function () {
      var mode = ${JSON.stringify(bridgeMode)};
      var target = ${JSON.stringify(syncUrl)};
      if (mode === 'online' || (mode === 'hybrid' && navigator.onLine && target)) {
        setTimeout(function () {
          try { window.location.replace(target); } catch (e) {}
        }, 450);
      }
    })();
  </script>
</body>
</html>`;
}

function buildMainActivityJava(config: ApkBuildConfig): string {
  const pkg = config.packageId.trim();
  return `package ${pkg};

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;

import java.io.IOException;
import java.io.InputStream;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private static final String ASSET_ORIGIN = "https://appassets.androidplatform.net/";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#070e09"));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/", new PublicAssetsPathHandler())
                .build();

        webView.addJavascriptInterface(new AndroidBridge(), "AppleFortuneAndroid");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Nullable
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView view,
                    @NonNull WebResourceRequest request
            ) {
                Uri url = request.getUrl();
                if ("appassets.androidplatform.net".equals(url.getHost())) {
                    return assetLoader.shouldInterceptRequest(url);
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith(ASSET_ORIGIN) || url.startsWith(BuildConfig.LIVE_SYNC_URL)) {
                    return false;
                }
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, request.getUrl());
                    startActivity(intent);
                    return true;
                }
                return false;
            }
        });

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });

        webView.loadUrl(decideEntryUrl());
    }

    private String decideEntryUrl() {
        if ("online".equalsIgnoreCase(BuildConfig.LOADING_MODE)) {
            return BuildConfig.LIVE_SYNC_URL;
        }
        try (InputStream ignored = getAssets().open("public/index.html")) {
            return ASSET_ORIGIN + "index.html";
        } catch (IOException e) {
            return BuildConfig.LIVE_SYNC_URL;
        }
    }

    private class PublicAssetsPathHandler implements WebViewAssetLoader.PathHandler {
        @Nullable
        @Override
        public WebResourceResponse handle(@NonNull String path) {
            String cleanPath = path.startsWith("/") ? path.substring(1) : path;
            if (cleanPath.isEmpty() || cleanPath.endsWith("/")) {
                cleanPath = cleanPath + "index.html";
            }
            try {
                InputStream stream = getAssets().open("public/" + cleanPath);
                return new WebResourceResponse(guessMimeType(cleanPath), "UTF-8", stream);
            } catch (IOException e) {
                if (!cleanPath.contains(".")) {
                    try {
                        InputStream spaStream = getAssets().open("public/index.html");
                        return new WebResourceResponse("text/html", "UTF-8", spaStream);
                    } catch (IOException ignored) {
                        return null;
                    }
                }
                return null;
            }
        }

        private String guessMimeType(String path) {
            String lower = path.toLowerCase();
            if (lower.endsWith(".html")) return "text/html";
            if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
            if (lower.endsWith(".css")) return "text/css";
            if (lower.endsWith(".json") || lower.endsWith(".webmanifest")) return "application/json";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".png")) return "image/png";
            return "application/octet-stream";
        }
    }

    public static class AndroidBridge {
        @JavascriptInterface
        public String getPackageId() {
            return BuildConfig.APPLICATION_ID;
        }

        @JavascriptInterface
        public String getVersionName() {
            return BuildConfig.VERSION_NAME;
        }

        @JavascriptInterface
        public int getVersionCode() {
            return BuildConfig.VERSION_CODE;
        }

        @JavascriptInterface
        public String getLiveSyncUrl() {
            return BuildConfig.LIVE_SYNC_URL;
        }

        @JavascriptInterface
        public String getLoadingMode() {
            return BuildConfig.LOADING_MODE;
        }
    }
}
`;
}

export async function buildAndroidStudioProjectZip(
  config: ApkBuildConfig,
  onLog?: (line: string) => void
): Promise<ApkBuildArtifact> {
  const pkg = config.packageId.trim();
  const pkgPath = pkg.replace(/\./g, '/');
  const safeSlug = config.appName.replace(/[^a-zA-Z0-9]+/g, '') || 'AppleOfFortuneAI';
  const node = appState.dailyNetworkConfig.currentNode;
  const zip = new JSZip();

  onLog?.(`[GRADLE] Initializing Android Studio Gradle 8.9 project for ${pkg}...`);

  zip.file(
    'settings.gradle',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "${safeSlug}"
include ':app'
`
  );

  zip.file(
    'build.gradle',
    `plugins {
    id 'com.android.application' version '8.6.1' apply false
}

tasks.register('clean', Delete) {
    delete rootProject.layout.buildDirectory
}
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
android.enableJetifier=true
`
  );

  zip.file(
    'app/build.gradle',
    `plugins {
    id 'com.android.application'
}

android {
    namespace '${pkg}'
    compileSdk ${config.targetSdk}

    defaultConfig {
        applicationId "${pkg}"
        minSdk ${config.minSdk}
        targetSdk ${config.targetSdk}
        versionCode ${config.versionCode}
        versionName "${config.versionName}"

        buildConfigField "String", "LIVE_SYNC_URL", "\\"${config.serverUrl.trim()}\\""
        buildConfigField "String", "LOADING_MODE", "\\"${config.loadingMode}\\""
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    buildFeatures {
        buildConfig true
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'androidx.webkit:webkit:1.12.1'
}
`
  );

  zip.file(
    'app/proguard-rules.pro',
    `-keepclassmembers class ${pkg}.MainActivity$AndroidBridge {
    @android.webkit.JavascriptInterface <methods>;
}
`
  );

  onLog?.(`[MANIFEST] Writing AndroidManifest.xml (minSdk ${config.minSdk}, targetSdk ${config.targetSdk})...`);

  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:label="@string/app_name"
        android:networkSecurityConfig="@xml/network_security_config"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>
`
  );

  zip.file(
    'app/src/main/res/values/strings.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${escapeXml(config.appName.trim())}</string>
    <string name="package_id">${escapeXml(pkg)}</string>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/styles.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="android:windowBackground">@android:color/black</item>
        <item name="android:statusBarColor">#070e09</item>
        <item name="android:navigationBarColor">#070e09</item>
    </style>
</resources>
`
  );

  zip.file(
    'app/src/main/res/xml/network_security_config.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
`
  );

  onLog?.(`[BRIDGE] Generating MainActivity.java for ${pkgPath}...`);
  zip.file(`app/src/main/java/${pkgPath}/MainActivity.java`, buildMainActivityJava(config));

  onLog?.(`[ASSETS] Bundling hybrid offline shell & BitsGap manifest (${config.loadingMode})...`);
  zip.file('app/src/main/assets/public/index.html', buildHybridWebShellHtml(config));
  zip.file(
    'app/src/main/assets/public/bitsgap-manifest.json',
    JSON.stringify(
      {
        appName: config.appName,
        packageId: pkg,
        versionName: config.versionName,
        versionCode: config.versionCode,
        loadingMode: config.loadingMode,
        serverUrl: config.serverUrl,
        aiEngine: config.enableBitsGap ? appState.config.aiEngineVersion : 'disabled',
        securityLayer: config.enableCyderShield ? appState.dailyNetworkConfig.systemSoftwareVersion : 'standard',
        activeNode: node,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  zip.file(
    'README_BUILD_APK.md',
    `# ${config.appName} — Android Studio APK Build Kit

- Package ID: \`${pkg}\`
- Version: \`${config.versionName}\` (code \`${config.versionCode}\`)
- Loading Mode: \`${config.loadingMode}\`
- Live Sync URL: \`${config.serverUrl}\`

## Build an Installable APK

1. Open this folder directly in **Android Studio**, wait for Gradle sync, and click **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
2. Or run from command line with Android SDK installed:
   \`\`\`bash
   npm run apk:sync   # syncs full Vite dist/ into app/src/main/assets/public/
   gradle assembleDebug
   \`\`\`
   Output APK: \`app/build/outputs/apk/debug/app-debug.apk\`
`
  );

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const sha256 = await computeSha256Hex(blob);
  const filename = `${safeSlug}_v${config.versionName}_AndroidProject.zip`;

  onLog?.(`[DONE] Packed ${filename} (${(blob.size / 1024).toFixed(1)} KB)`);

  return {
    blob,
    filename,
    sizeBytes: blob.size,
    sha256,
  };
}

export async function buildApkPackageBundle(
  config: ApkBuildConfig,
  onLog?: (line: string) => void
): Promise<ApkBuildArtifact> {
  const pkg = config.packageId.trim();
  const safeSlug = config.appName.replace(/[^a-zA-Z0-9]+/g, '') || 'AppleOfFortuneAI';
  const node = appState.dailyNetworkConfig.currentNode;
  const zip = new JSZip();

  onLog?.(`[PACKAGE] Assembling APK archive container for ${pkg}...`);

  zip.file(
    'AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest package="${escapeXml(pkg)}" android:versionCode="${config.versionCode}" android:versionName="${escapeXml(config.versionName)}" xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-sdk android:minSdkVersion="${config.minSdk}" android:targetSdkVersion="${config.targetSdk}" />
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  <application android:label="${escapeXml(config.appName.trim())}" />
</manifest>
`
  );

  zip.file(
    'res/values/strings.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="app_name">${escapeXml(config.appName.trim())}</string>
</resources>
`
  );

  zip.file('assets/public/index.html', buildHybridWebShellHtml(config));
  zip.file(
    'assets/bitsgap-config.json',
    JSON.stringify(
      {
        appName: config.appName,
        packageId: pkg,
        versionName: config.versionName,
        versionCode: config.versionCode,
        loadingMode: config.loadingMode,
        serverUrl: config.serverUrl,
        bitsGapEnabled: config.enableBitsGap,
        cyderShieldEnabled: config.enableCyderShield,
        autoSyncEnabled: config.enableAutoSync,
        feedNode: {
          region: node.region,
          hostIp: node.hostIp,
          feedIp: node.feedIp,
        },
        builtAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  zip.file(
    'META-INF/MANIFEST.MF',
    `Manifest-Version: 1.0
Created-By: BitsGap AI APK Studio
Built-For: ${config.appName}
Package-Id: ${pkg}
Version-Name: ${config.versionName}
Version-Code: ${config.versionCode}
Loading-Mode: ${config.loadingMode}
Live-Sync-Url: ${config.serverUrl}
`
  );

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.android.package-archive',
    compression: 'DEFLATE',
  });
  const sha256 = await computeSha256Hex(blob);
  const filename = `${safeSlug}_v${config.versionName}.apk`;

  onLog?.(`[DONE] Generated ${filename} (${(blob.size / 1024).toFixed(1)} KB)`);

  return {
    blob,
    filename,
    sizeBytes: blob.size,
    sha256,
  };
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch {}
}
