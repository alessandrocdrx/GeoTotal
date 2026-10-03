/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.web;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

/** Abre o seletor de arquivos do Android para os botões "Importar textura / fronteiras / contornos". */
public final class FileChooserClient extends WebChromeClient {

    public static final int REQUEST_CODE = 1;

    private final Activity activity;
    private ValueCallback<Uri[]> pending;

    public FileChooserClient(Activity activity) {
        this.activity = activity;
    }

    @Override
    public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                     FileChooserParams params) {
        if (pending != null) pending.onReceiveValue(null);
        pending = callback;

        boolean imagesOnly = false;
        for (String type : params.getAcceptTypes()) {
            if (type.startsWith("image/")) imagesOnly = true;
        }
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        // GeoJSON costuma vir sem tipo MIME reconhecido, então aceita qualquer arquivo.
        intent.setType(imagesOnly ? "image/*" : "*/*");
        try {
            activity.startActivityForResult(Intent.createChooser(intent, null), REQUEST_CODE);
        } catch (ActivityNotFoundException e) {
            pending = null;
            callback.onReceiveValue(null);
        }
        return true;
    }

    /** Entrega o arquivo escolhido à página. Devolve true se o resultado era deste seletor. */
    public boolean handleResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQUEST_CODE) return false;
        if (pending != null) {
            pending.onReceiveValue(FileChooserParams.parseResult(resultCode, data));
            pending = null;
        }
        return true;
    }
}
