/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
package io.github.alessandrocdrx.geototal;

import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.window.OnBackInvokedDispatcher;
import android.widget.FrameLayout;

import io.github.alessandrocdrx.geototal.files.FileSaver;
import io.github.alessandrocdrx.geototal.ui.EdgeToEdge;
import io.github.alessandrocdrx.geototal.web.AssetWebViewClient;
import io.github.alessandrocdrx.geototal.web.FileChooserClient;
import io.github.alessandrocdrx.geototal.web.WebBridge;

/**
 * Tela única do app: abre o geoTotal (assets/www/index.html) num WebView e liga as peças
 * nativas — servidor de assets, seletor e salvamento de arquivos, compartilhamento,
 * impressão, barras do sistema e botão Voltar.
 */
public class MainActivity extends Activity {

    private WebView web;
    private FileChooserClient fileChooser;
    private FileSaver fileSaver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        web = new WebView(this);
        web.setHapticFeedbackEnabled(false);
        root.addView(web, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);
        EdgeToEdge.apply(this, root);

        configureWebView();

        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null) {
            web.loadUrl(AssetWebViewClient.START_URL);
        }

        // A partir do Android 16 (targetSdk 36) o sistema não chama mais onBackPressed().
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
    }

    private void configureWebView() {
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);

        fileChooser = new FileChooserClient(this);
        fileSaver = new FileSaver(this, web);
        web.setWebViewClient(new AssetWebViewClient(this));
        web.setWebChromeClient(fileChooser);
        web.addJavascriptInterface(new WebBridge(this, web, fileSaver), WebBridge.NAME);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        web.destroy();
        super.onDestroy();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleBack();
    }

    /** Voltar fecha o painel aberto na página (filtros, treino, cartão...) antes de sair do app. */
    private void handleBack() {
        web.evaluateJavascript("window.__androidBack ? window.__androidBack() : false", result -> {
            if (!"true".equals(result)) {
                finish();
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (!fileChooser.handleResult(requestCode, resultCode, data)) {
            fileSaver.handleResult(requestCode, resultCode, data);
        }
    }
}
