/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.files;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebView;

import io.github.alessandrocdrx.geototal.web.MimeTypes;

import org.json.JSONObject;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Salva um texto gerado pela página (CSV, Anki) num arquivo escolhido pelo usuário, usando o
 * seletor "Salvar como" do Android, e avisa a página do resultado ("ok", "declined" ou "error")
 * por window.__androidSaveDone(id, status).
 */
public final class FileSaver {

    public static final int REQUEST_CODE = 2;

    private final Activity activity;
    private final WebView web;
    private String pendingId;
    private String pendingData;

    public FileSaver(Activity activity, WebView web) {
        this.activity = activity;
        this.web = web;
    }

    /** Deve ser chamado na thread principal. */
    public void start(String id, String name, String data) {
        if (pendingId != null) finish("error");
        pendingId = id;
        pendingData = data;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(MimeTypes.forName(name));
        intent.putExtra(Intent.EXTRA_TITLE, name);
        try {
            activity.startActivityForResult(intent, REQUEST_CODE);
        } catch (ActivityNotFoundException e) {
            finish("error");
        }
    }

    /** Grava o arquivo no destino escolhido. Devolve true se o resultado era deste salvamento. */
    public boolean handleResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQUEST_CODE) return false;
        Uri uri = data != null ? data.getData() : null;
        if (resultCode != Activity.RESULT_OK || uri == null || pendingData == null) {
            finish("declined");
            return true;
        }
        try (OutputStream out = activity.getContentResolver().openOutputStream(uri)) {
            if (out == null) throw new IOException("sem destino");
            out.write(pendingData.getBytes(StandardCharsets.UTF_8));
            finish("ok");
        } catch (IOException e) {
            finish("error");
        }
        return true;
    }

    private void finish(String status) {
        String id = pendingId;
        pendingId = null;
        pendingData = null;
        if (id == null) return;
        web.evaluateJavascript("window.__androidSaveDone && window.__androidSaveDone("
                + JSONObject.quote(id) + "," + JSONObject.quote(status) + ")", null);
    }
}
