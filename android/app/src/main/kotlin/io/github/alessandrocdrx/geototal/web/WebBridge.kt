/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.web

import android.app.Activity
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.google.android.play.core.review.ReviewManagerFactory
import io.github.alessandrocdrx.geototal.R
import io.github.alessandrocdrx.geototal.files.FileSaver
import io.github.alessandrocdrx.geototal.files.ImageSharer

/**
 * Ponte exposta à página como window.AndroidBridge e usada pelo shim injetado em index.html
 * (scripts/android-shim.js). Os métodos são chamados numa thread do WebView e repassam o
 * trabalho para a thread principal.
 */
class WebBridge(
    private val activity: Activity,
    private val web: WebView,
    private val fileSaver: FileSaver,
) {

    /** Salva um arquivo de texto gerado pela página (CSV, Anki). */
    @JavascriptInterface
    fun saveFile(id: String, name: String, data: String) {
        activity.runOnUiThread { fileSaver.start(id, name, data) }
    }

    /** Compartilha a imagem do resultado (PNG em base64) com o texto. */
    @JavascriptInterface
    fun shareImage(base64Png: String, text: String) {
        activity.runOnUiThread {
            if (!ImageSharer.share(activity, base64Png, text)) {
                web.evaluateJavascript(
                    "window.setStatus && setStatus('Não consegui abrir o compartilhamento.',4000)", null
                )
            }
        }
    }

    /** Imprime ou salva em PDF a folha de estudo. */
    @JavascriptInterface
    fun print() {
        activity.runOnUiThread {
            val pm = activity.getSystemService(PrintManager::class.java) ?: return@runOnUiThread
            pm.print(
                activity.getString(R.string.app_name),
                web.createPrintDocumentAdapter("Folha de estudo"),
                PrintAttributes.Builder().build(),
            )
        }
    }

    /**
     * Pede a avaliação pelo cartão oficial do Google Play, sem sair do app. O Google decide se mostra
     * (há uma cota por pessoa), então a página nunca sabe se apareceu, e não deve insistir.
     */
    @JavascriptInterface
    fun requestReview() {
        activity.runOnUiThread {
            val manager = ReviewManagerFactory.create(activity)
            manager.requestReviewFlow().addOnCompleteListener { task ->
                if (task.isSuccessful) manager.launchReviewFlow(activity, task.result)
            }
        }
    }

    companion object {
        const val NAME = "AndroidBridge"
    }
}
