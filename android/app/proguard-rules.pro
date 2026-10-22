# geoTotal: a página chama os métodos da ponte (window.AndroidBridge) pelo nome, então o R8 não
# pode renomeá-los nem removê-los.
-keepclassmembers class io.github.alessandrocdrx.geototal.web.WebBridge {
    @android.webkit.JavascriptInterface <methods>;
}
