# Regras do R8 (encolhe e otimiza o código do app na versão da Play).

# Ponte entre o jogo (JavaScript) e o Android: o WebView chama estes métodos pelo nome
# (AndroidBridge.saveFile, shareImage, print, pedirAvaliacao…). Se o R8 renomear ou apagar algum,
# a função para de funcionar sem dar erro. Mantém todo método marcado com @JavascriptInterface.
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class io.github.alessandrocdrx.geototal.web.WebBridge { *; }
