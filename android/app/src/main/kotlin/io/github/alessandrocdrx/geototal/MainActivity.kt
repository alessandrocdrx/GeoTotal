/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.addCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import io.github.alessandrocdrx.geototal.files.FileSaver
import io.github.alessandrocdrx.geototal.ui.TelaDoJogo
import io.github.alessandrocdrx.geototal.web.AssetWebViewClient
import io.github.alessandrocdrx.geototal.web.FileChooserClient
import io.github.alessandrocdrx.geototal.web.WebBridge

/**
 * Tela única do app: abre o geoTotal (assets/www/index.html) num WebView, mostrado pelo Compose,
 * e liga as peças nativas — servidor de assets, seletor e salvamento de arquivos,
 * compartilhamento, impressão, barras do sistema e botão Voltar.
 */
class MainActivity : ComponentActivity() {

    private lateinit var web: WebView

    // Os seletores do sistema precisam ser registrados antes da tela abrir (Activity Result API).
    private val fileChooser = FileChooserClient(this)
    private val fileSaver = FileSaver(this) { web }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        web = WebView(this).apply { isHapticFeedbackEnabled = false }
        configureWebView()
        setContent { TelaDoJogo(web) }

        // A página só abre depois que o WebView está na tela e com tamanho (post roda após ele ser
        // anexado). Aberta antes, ela começava com a tela 0×0 e o mapa não era desenhado.
        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null) {
            web.post { web.loadUrl(AssetWebViewClient.START_URL) }
        }

        // Voltar fecha o painel aberto na página (filtros, treino, cartão...) antes de sair do app.
        onBackPressedDispatcher.addCallback(this) {
            web.evaluateJavascript("window.__androidBack ? window.__androidBack() : false") { result ->
                if (result != "true") finish()
            }
        }
    }

    private fun configureWebView() {
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            textZoom = 100
        }
        web.webViewClient = AssetWebViewClient(this)
        web.webChromeClient = fileChooser
        web.addJavascriptInterface(WebBridge(this, web, fileSaver), WebBridge.NAME)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    override fun onResume() {
        super.onResume()
        web.onResume()
    }

    override fun onPause() {
        web.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }
}
