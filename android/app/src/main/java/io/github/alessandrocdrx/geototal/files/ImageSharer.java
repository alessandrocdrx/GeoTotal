/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal.files;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;

import io.github.alessandrocdrx.geototal.ShareProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/** Compartilha a imagem do resultado da partida (PNG) pelo menu "Compartilhar" do Android. */
public final class ImageSharer {

    private static final String FILE_NAME = "geototal-resultado.png";

    private ImageSharer() {
    }

    /**
     * Grava o PNG em cache/share/ e abre o menu de compartilhar. Devolve false se não deu
     * (sem espaço, imagem inválida ou nenhum app capaz de receber).
     */
    public static boolean share(Activity activity, String base64Png, String text) {
        try {
            File dir = ShareProvider.dir(activity);
            if (!dir.exists() && !dir.mkdirs()) throw new IOException("sem pasta");
            File file = new File(dir, FILE_NAME);
            try (FileOutputStream out = new FileOutputStream(file)) {
                out.write(Base64.decode(base64Png, Base64.DEFAULT));
            }
            Uri uri = Uri.parse("content://" + ShareProvider.AUTHORITY + "/" + file.getName());
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("image/png");
            intent.putExtra(Intent.EXTRA_STREAM, uri);
            intent.putExtra(Intent.EXTRA_TEXT, text);
            intent.setClipData(ClipData.newRawUri("", uri));
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            activity.startActivity(Intent.createChooser(intent, "Compartilhar resultado"));
            return true;
        } catch (IOException | IllegalArgumentException | ActivityNotFoundException e) {
            return false;
        }
    }
}
