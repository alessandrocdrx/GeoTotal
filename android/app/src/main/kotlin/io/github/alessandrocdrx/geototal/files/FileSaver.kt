/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.files

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import io.github.alessandrocdrx.geototal.web.MimeTypes
import org.json.JSONObject
import java.io.IOException

/**
 * Salva um texto gerado pela página (CSV, Anki) num arquivo escolhido pelo usuário,
 * usando o seletor "Salvar como" do Android, e avisa a página do resultado ("ok", "declined" ou
 * "error") por window.__androidSaveDone(id, status). Precisa ser criado junto com a Activity.
 */
class FileSaver(private val activity: ComponentActivity, private val web: () -> WebView) {

    private var pendingId: String? = null
    private var pendingData: String? = null

    private val launcher = activity.registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val uri = result.data?.data
        val data = pendingData
        if (result.resultCode != Activity.RESULT_OK || uri == null || data == null) {
            finish("declined")
            return@registerForActivityResult
        }
        try {
            activity.contentResolver.openOutputStream(uri)?.use { it.write(data.toByteArray()) }
                ?: throw IOException("sem destino")
            finish("ok")
        } catch (_: IOException) {
            finish("error")
        }
    }

    /** Deve ser chamado na thread principal. */
    fun start(id: String, name: String, data: String) {
        if (pendingId != null) finish("error")
        pendingId = id
        pendingData = data
        val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = MimeTypes.forName(name)
            putExtra(Intent.EXTRA_TITLE, name)
        }
        try {
            launcher.launch(intent)
        } catch (_: ActivityNotFoundException) {
            finish("error")
        }
    }

    private fun finish(status: String) {
        val id = pendingId ?: return
        pendingId = null
        pendingData = null
        web().evaluateJavascript(
            "window.__androidSaveDone && window.__androidSaveDone(" +
                JSONObject.quote(id) + "," + JSONObject.quote(status) + ")", null
        )
    }
}
