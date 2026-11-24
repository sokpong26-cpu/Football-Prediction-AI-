package com.bitsgap.applefortune;

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

        String startUrl = decideEntryUrl();
        webView.loadUrl(startUrl);
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
                // SPA history fallback to index.html for routes without extension
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
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".webp")) return "image/webp";
            if (lower.endsWith(".woff2")) return "font/woff2";
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
