/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.web;

import android.app.Activity;
import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import io.github.alessandrocdrx.geototal.R;
import io.github.alessandrocdrx.geototal.files.FileSaver;
import io.github.alessandrocdrx.geototal.files.ImageSharer;

/**
 * Ponte exposta à página como window.AndroidBridge e usada pelo shim injetado em index.html
 * (scripts/android-shim.js). Os métodos são chamados numa thread do WebView e repassam o
 * trabalho para a thread principal.
 */
public final class WebBridge {

    public static final String NAME = "AndroidBridge";

    private final Activity activity;
    private final WebView web;
    private final FileSaver fileSaver;

    public WebBridge(Activity activity, WebView web, FileSaver fileSaver) {
        this.activity = activity;
        this.web = web;
        this.fileSaver = fileSaver;
    }

    /** Salva um arquivo de texto gerado pela página (CSV, Anki). */
    @JavascriptInterface
    public void saveFile(String id, String name, String data) {
        activity.runOnUiThread(() -> fileSaver.start(id, name, data));
    }

    /** Compartilha a imagem do resultado (PNG em base64) com o texto. */
    @JavascriptInterface
    public void shareImage(String base64Png, String text) {
        activity.runOnUiThread(() -> {
            if (!ImageSharer.share(activity, base64Png, text)) {
                web.evaluateJavascript(
                        "window.setStatus && setStatus('Não consegui abrir o compartilhamento.',4000)", null);
            }
        });
    }

    /** Imprime ou salva em PDF a folha de estudo. */
    @JavascriptInterface
    public void print() {
        activity.runOnUiThread(() -> {
            PrintManager pm = (PrintManager) activity.getSystemService(Context.PRINT_SERVICE);
            if (pm == null) return;
            pm.print(activity.getString(R.string.app_name),
                    web.createPrintDocumentAdapter("Folha de estudo"),
                    new PrintAttributes.Builder().build());
        });
    }
}
