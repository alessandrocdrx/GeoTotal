/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.web;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;

/**
 * Serve a pasta assets/ em https://appassets.androidplatform.net/ e abre links externos no
 * navegador do aparelho.
 *
 * Uma origem https estável faz o localStorage e o IndexedDB (progresso do treino, filtros
 * favoritos, textura e fronteiras importadas) continuarem salvos entre as aberturas do app.
 */
public final class AssetWebViewClient extends WebViewClient {

    public static final String HOST = "appassets.androidplatform.net";
    public static final String START_URL = "https://" + HOST + "/www/index.html";

    private final Activity activity;

    public AssetWebViewClient(Activity activity) {
        this.activity = activity;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        if (!HOST.equals(url.getHost())) return null;
        String path = url.getPath();
        if (path == null || path.contains("..")) return notFound();
        path = path.startsWith("/") ? path.substring(1) : path;
        try {
            InputStream in = activity.getAssets().open(path);
            return new WebResourceResponse(MimeTypes.forName(path), "UTF-8", in);
        } catch (IOException e) {
            return notFound();
        }
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        if (HOST.equals(url.getHost())) return false;
        try {
            activity.startActivity(new Intent(Intent.ACTION_VIEW, url));
        } catch (ActivityNotFoundException ignored) {
            // sem navegador instalado: o toque no link não faz nada
        }
        return true;
    }

    private static WebResourceResponse notFound() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
    }
}
