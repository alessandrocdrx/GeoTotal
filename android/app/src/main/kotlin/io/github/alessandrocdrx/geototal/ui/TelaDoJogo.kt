/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.ui

import android.webkit.WebView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.viewinterop.AndroidView
import io.github.alessandrocdrx.geototal.R

/**
 * O jogo ocupa a tela toda, desenhado atrás das barras do sistema, mas afastado delas, do recorte
 * da câmera e do teclado (safeDrawing).
 */
@Composable
fun TelaDoJogo(web: WebView) {
    Box(
        Modifier
            .fillMaxSize()
            .background(colorResource(R.color.page_bg))
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        AndroidView(factory = { web }, modifier = Modifier.fillMaxSize())
    }
}
