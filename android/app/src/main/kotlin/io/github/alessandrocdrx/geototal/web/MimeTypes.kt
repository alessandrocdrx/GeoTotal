/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.web

import java.util.Locale

/** Tipo MIME pela extensão do arquivo, para salvar exportações. */
object MimeTypes {

    fun forName(name: String): String {
        val n = name.lowercase(Locale.ROOT)
        return when {
            n.endsWith(".html") || n.endsWith(".htm") -> "text/html"
            n.endsWith(".js") -> "text/javascript"
            n.endsWith(".css") -> "text/css"
            n.endsWith(".json") || n.endsWith(".geojson") -> "application/json"
            n.endsWith(".csv") -> "text/csv"
            n.endsWith(".png") -> "image/png"
            n.endsWith(".jpg") || n.endsWith(".jpeg") -> "image/jpeg"
            n.endsWith(".svg") -> "image/svg+xml"
            else -> "text/plain"
        }
    }
}
