/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.web

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

/**
 * Serve a pasta assets/ em https://appassets.androidplatform.net/ (WebViewAssetLoader, do
 * AndroidX) e abre links externos no navegador do aparelho.
 *
 * Uma origem https estável faz o localStorage e o IndexedDB (progresso do treino, filtros
 * favoritos, textura e fronteiras importadas) continuarem salvos entre as aberturas do app.
 * O endereço é o mesmo das versões em Java: mudar o host ou o caminho apagaria o progresso.
 */
class AssetWebViewClient(private val activity: Activity) : WebViewClient() {

    private val loader = WebViewAssetLoader.Builder()
        .setDomain(HOST)
        .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(activity))
        .build()

    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
        loader.shouldInterceptRequest(request.url)

    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        if (request.url.host == HOST) return false
        try {
            activity.startActivity(Intent(Intent.ACTION_VIEW, request.url))
        } catch (_: ActivityNotFoundException) {
            // sem navegador instalado: o toque no link não faz nada
        }
        return true
    }

    companion object {
        const val HOST = "appassets.androidplatform.net"
        const val START_URL = "https://$HOST/www/index.html"
    }
}
