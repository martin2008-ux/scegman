package cl.scegman.app

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.JavascriptInterface
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import java.io.File

class MainActivity : ComponentActivity() {

  private var webViewRef: WebView? = null

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    enableEdgeToEdge(
      statusBarStyle = SystemBarStyle.dark(Color.parseColor("#0F172A")),
      navigationBarStyle = SystemBarStyle.light(Color.parseColor("#F8FAFC"), Color.parseColor("#0F172A"))
    )

    onBackPressedDispatcher.addCallback(
      this,
      object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          val wv = webViewRef
          if (wv != null && wv.canGoBack()) {
            wv.goBack()
          } else {
            finish()
          }
        }
      }
    )

    setContent {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .background(ComposeColor(0xFF0F172A))
          .safeDrawingPadding()
      ) {
        AndroidView(
          modifier = Modifier.fillMaxSize(),
          factory = { context ->
            createScegmanWebView(context).also { webViewRef = it }
          }
        )
      }
    }
  }

  @SuppressLint("SetJavaScriptEnabled")
  private fun createScegmanWebView(context: Context): WebView {
    val assetLoader = WebViewAssetLoader.Builder()
      .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
      .build()

    val webView = WebView(context)
    webView.setBackgroundColor(Color.parseColor("#F8FAFC"))

    webView.settings.apply {
      javaScriptEnabled = true
      domStorageEnabled = true
      databaseEnabled = true
      allowFileAccess = false
      allowContentAccess = true
      cacheMode = WebSettings.LOAD_DEFAULT
      setSupportZoom(false)
      builtInZoomControls = false
      displayZoomControls = false
      useWideViewPort = true
      loadWithOverviewMode = true
    }

    webView.addJavascriptInterface(ScegmanNativeBridge(webView), "ScegmanAndroid")

    webView.webChromeClient = object : WebChromeClient() {
      override fun onJsConfirm(
        view: WebView?,
        url: String?,
        message: String?,
        result: JsResult?
      ): Boolean {
        AlertDialog.Builder(this@MainActivity)
          .setTitle("SCEGMAN")
          .setMessage(message ?: "¿Confirmar acción?")
          .setPositiveButton("Confirmar") { _, _ -> result?.confirm() }
          .setNegativeButton("Cancelar") { _, _ -> result?.cancel() }
          .setOnCancelListener { result?.cancel() }
          .show()
        return true
      }

      override fun onJsAlert(
        view: WebView?,
        url: String?,
        message: String?,
        result: JsResult?
      ): Boolean {
        AlertDialog.Builder(this@MainActivity)
          .setTitle("SCEGMAN")
          .setMessage(message ?: "")
          .setPositiveButton("Aceptar") { _, _ -> result?.confirm() }
          .setOnCancelListener { result?.cancel() }
          .show()
        return true
      }
    }

    webView.webViewClient = object : WebViewClient() {
      override fun shouldInterceptRequest(
        view: WebView?,
        request: WebResourceRequest?
      ): WebResourceResponse? {
        val url = request?.url ?: return null
        return assetLoader.shouldInterceptRequest(url)
      }

      override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        // Hook window.print() and CSV blob downloads to native Android handlers
        val bridgeScript = """
          (function() {
            if (window.__scegmanBridgeInstalled) return;
            window.__scegmanBridgeInstalled = true;
            window.print = function() {
              if (window.ScegmanAndroid) {
                window.ScegmanAndroid.printPage();
              }
            };
            const origClick = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function() {
              if (this.download && this.href && this.href.startsWith('blob:') && window.ScegmanAndroid) {
                const fileName = this.download || 'SCEGMAN_Informe.csv';
                fetch(this.href)
                  .then(function(r) { return r.text(); })
                  .then(function(text) {
                    window.ScegmanAndroid.shareCsv(fileName, text);
                  })
                  .catch(function() {
                    origClick.call(this);
                  });
                return;
              }
              return origClick.apply(this, arguments);
            };
          })();
        """.trimIndent()
        view?.evaluateJavascript(bridgeScript, null)
      }
    }

    webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
    return webView
  }

  private inner class ScegmanNativeBridge(private val webView: WebView) {
    @JavascriptInterface
    fun printPage() {
      runOnUiThread {
        val printManager = getSystemService(Context.PRINT_SERVICE) as? PrintManager
        if (printManager != null) {
          val adapter = webView.createPrintDocumentAdapter("SCEGMAN_Informe")
          printManager.print(
            "SCEGMAN_Informe",
            adapter,
            PrintAttributes.Builder().build()
          )
        }
      }
    }

    @JavascriptInterface
    fun shareCsv(fileName: String, content: String) {
      runOnUiThread {
        try {
          val exportsDir = File(cacheDir, "exports").apply { mkdirs() }
          val safeName = fileName.replace(Regex("[^a-zA-Z0-9._-]"), "_")
          val outFile = File(exportsDir, safeName)
          outFile.writeText(content, Charsets.UTF_8)

          val uri = FileProvider.getUriForFile(
            this@MainActivity,
            "${applicationContext.packageName}.fileprovider",
            outFile
          )

          val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, safeName)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          }
          startActivity(Intent.createChooser(shareIntent, "Exportar informe CSV"))
        } catch (e: Exception) {
          Toast.makeText(
            this@MainActivity,
            "No se pudo exportar CSV: ${e.message}",
            Toast.LENGTH_LONG
          ).show()
        }
      }
    }
  }
}
