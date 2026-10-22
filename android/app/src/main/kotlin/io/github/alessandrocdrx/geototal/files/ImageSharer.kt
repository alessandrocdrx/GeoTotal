/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.files

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.Intent
import android.net.Uri
import android.util.Base64
import io.github.alessandrocdrx.geototal.ShareProvider
import java.io.File
import java.io.IOException

/** Compartilha a imagem do resultado da partida (PNG) pelo menu "Compartilhar" do Android. */
object ImageSharer {

    private const val FILE_NAME = "geototal-resultado.png"

    /**
     * Grava o PNG em cache/share/ e abre o menu de compartilhar. Devolve false se não deu
     * (sem espaço, imagem inválida ou nenhum app capaz de receber).
     */
    fun share(activity: Activity, base64Png: String, text: String): Boolean = try {
        val dir = ShareProvider.dir(activity)
        if (!dir.exists() && !dir.mkdirs()) throw IOException("sem pasta")
        val file = File(dir, FILE_NAME)
        file.writeBytes(Base64.decode(base64Png, Base64.DEFAULT))
        val uri = Uri.parse("content://${ShareProvider.AUTHORITY}/${file.name}")
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "image/png"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_TEXT, text)
            clipData = ClipData.newRawUri("", uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        activity.startActivity(Intent.createChooser(intent, "Compartilhar resultado"))
        true
    } catch (_: IOException) {
        false
    } catch (_: IllegalArgumentException) {
        false
    } catch (_: ActivityNotFoundException) {
        false
    }
}
