/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal

import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.provider.OpenableColumns
import java.io.File
import java.io.FileNotFoundException
import java.io.IOException

/**
 * Entrega a outros apps (WhatsApp, Instagram...) a imagem do resultado que o app salvou em
 * cache/share/, só para leitura e só com a permissão temporária dada pelo Intent de compartilhar.
 */
class ShareProvider : ContentProvider() {

    private fun fileFor(uri: Uri): File {
        val name = uri.lastPathSegment ?: throw FileNotFoundException()
        val base = dir(context ?: throw FileNotFoundException())
        val f = File(base, name)
        try {
            if (!f.canonicalPath.startsWith(base.canonicalPath + File.separator)) throw FileNotFoundException()
        } catch (_: IOException) {
            throw FileNotFoundException()
        }
        if (!f.exists()) throw FileNotFoundException()
        return f
    }

    override fun onCreate() = true

    override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor =
        ParcelFileDescriptor.open(fileFor(uri), ParcelFileDescriptor.MODE_READ_ONLY)

    override fun getType(uri: Uri) = "image/png"

    override fun query(
        uri: Uri, projection: Array<String>?, selection: String?,
        selectionArgs: Array<String>?, sortOrder: String?,
    ): Cursor? {
        val f = try { fileFor(uri) } catch (_: FileNotFoundException) { return null }
        return MatrixCursor(arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE)).apply {
            addRow(arrayOf<Any>(f.name, f.length()))
        }
    }

    override fun insert(uri: Uri, values: ContentValues?): Uri? = null

    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<String>?) = 0

    override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<String>?) = 0

    companion object {
        const val AUTHORITY = "io.github.alessandrocdrx.geototal.share"

        fun dir(c: Context) = File(c.cacheDir, "share")
    }
}
