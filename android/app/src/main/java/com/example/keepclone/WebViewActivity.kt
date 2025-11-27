package com.example.keepclone

import android.annotation.SuppressLint
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class WebViewActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private val WEBSITE_URL = "https://note.adrianofrongillo.ovh/"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = WebView(this)
        setContentView(webView)

        // Configurazione WebView per supporto offline e Service Workers
        val webSettings: WebSettings = webView.settings
        
        // Abilita JavaScript (necessario per React e Service Workers)
        webSettings.javaScriptEnabled = true
        
        // Abilita DOM Storage (per localStorage)
        webSettings.domStorageEnabled = true
        
        // Abilita Database Storage
        webSettings.databaseEnabled = true
        
        // Abilita cache
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT
        
        // Abilita supporto per Service Workers
        webSettings.javaScriptCanOpenWindowsAutomatically = true
        
        // Abilita supporto per file system API
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        
        // Configurazione per ridimensionamento dinamico su mobile
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true
        webSettings.setSupportZoom(true)
        webSettings.builtInZoomControls = false
        webSettings.displayZoomControls = false
        
        // Abilita layout algorithm per mobile
        webSettings.layoutAlgorithm = WebSettings.LayoutAlgorithm.TEXT_AUTOSIZING
        
        // User agent
        webSettings.userAgentString = webSettings.userAgentString + " OscKeepApp/1.0"
        
        // WebViewClient personalizzato per gestire offline e caching
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                // Il Service Worker gestirà il caching offline
                // Qui possiamo aggiungere logica aggiuntiva se necessario
                return super.shouldInterceptRequest(view, request)
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: android.webkit.WebResourceError?
            ) {
                // Se offline, il Service Worker dovrebbe gestire la cache
                super.onReceivedError(view, request, error)
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                
                // Inietta CSS per migliorare il ridimensionamento su mobile
                view?.evaluateJavascript(
                    """
                    (function() {
                        // Forza viewport mobile
                        var meta = document.querySelector('meta[name="viewport"]');
                        if (!meta) {
                            meta = document.createElement('meta');
                            meta.name = 'viewport';
                            document.getElementsByTagName('head')[0].appendChild(meta);
                        }
                        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
                        
                        // Assicura che il body occupi tutto lo spazio
                        var style = document.createElement('style');
                        style.innerHTML = 'html, body { width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden !important; } #root { width: 100% !important; max-width: 100% !important; }';
                        document.head.appendChild(style);
                    })();
                    """.trimIndent(),
                    null
                )
                
                // Forza il Service Worker a registrarsi
                view?.evaluateJavascript(
                    """
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                            if (registrations.length === 0) {
                                navigator.serviceWorker.register('/sw.js');
                            }
                        });
                    }
                    """.trimIndent(),
                    null
                )
            }
        }
        
        // WebChromeClient per progress e console
        webView.webChromeClient = WebChromeClient()
        
        // Carica il sito
        webView.loadUrl(WEBSITE_URL)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}

