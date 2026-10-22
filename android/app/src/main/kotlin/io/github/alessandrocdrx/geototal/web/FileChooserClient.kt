/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.web

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts

/**
 * Abre o seletor de arquivos do Android para os botões "Importar textura / fronteiras / contornos".
 * Precisa ser criado junto com a Activity (registra o seletor).
 */
class FileChooserClient(activity: ComponentActivity) : WebChromeClient() {

    private var pending: ValueCallback<Array<Uri>>? = null

    private val launcher = activity.registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        pending?.onReceiveValue(FileChooserParams.parseResult(result.resultCode, result.data))
        pending = null
    }

    override fun onShowFileChooser(
        view: WebView,
        callback: ValueCallback<Array<Uri>>,
        params: FileChooserParams,
    ): Boolean {
        pending?.onReceiveValue(null)
        pending = callback

        val imagesOnly = params.acceptTypes.any { it.startsWith("image/") }
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            // GeoJSON costuma vir sem tipo MIME reconhecido, então aceita qualquer arquivo.
            type = if (imagesOnly) "image/*" else "*/*"
        }
        try {
            launcher.launch(Intent.createChooser(intent, null))
        } catch (_: ActivityNotFoundException) {
            pending = null
            callback.onReceiveValue(null)
        }
        return true
    }
}
