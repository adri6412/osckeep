package com.example.keepclone

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class WebViewActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var notificationBridge: NotificationBridge
    private val WEBSITE_URL = "https://note.adrianofrongillo.ovh/"
    private val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001
    
    // Funzione per controllare se c'è connessione internet
    private fun isNetworkAvailable(): Boolean {
        return try {
            val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            if (connectivityManager == null) return true // Assume connessione disponibile se non può verificare
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val network = connectivityManager.activeNetwork ?: return true // Assume connessione disponibile
                val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return true
                capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
            } else {
                @Suppress("DEPRECATION")
                val networkInfo = connectivityManager.activeNetworkInfo
                @Suppress("DEPRECATION")
                networkInfo?.isConnected == true
            }
        } catch (e: Exception) {
            // In caso di errore, assume connessione disponibile
            true
        }
    }
    
    // Aggiorna la modalità di cache in base alla connettività
    private fun updateCacheMode() {
        if (!::webView.isInitialized) return
        try {
            val webSettings = webView.settings
            if (isNetworkAvailable()) {
                // Se c'è internet, usa LOAD_DEFAULT (carica dalla rete, usa cache solo se necessario)
                webSettings.cacheMode = WebSettings.LOAD_DEFAULT
            } else {
                // Se non c'è internet, usa solo la cache
                webSettings.cacheMode = WebSettings.LOAD_CACHE_ONLY
            }
        } catch (e: Exception) {
            // In caso di errore, usa modalità default
            webView.settings.cacheMode = WebSettings.LOAD_DEFAULT
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Richiedi permesso notifiche su Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.POST_NOTIFICATIONS) 
                != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(android.Manifest.permission.POST_NOTIFICATIONS),
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                )
            }
        }
        
        try {
            webView = WebView(this)
            setContentView(webView)
            
            // Inizializza bridge notifiche
            notificationBridge = NotificationBridge(this)
        } catch (e: Exception) {
            // Se c'è un errore nell'inizializzazione, mostra un messaggio e termina
            android.util.Log.e("WebViewActivity", "Error initializing WebView", e)
            finish()
            return
        }

        // Configurazione WebView per supporto offline e Service Workers
        val webSettings: WebSettings = webView.settings
        
        // Abilita JavaScript (necessario per React e Service Workers)
        webSettings.javaScriptEnabled = true
        
        // Abilita DOM Storage (per localStorage)
        webSettings.domStorageEnabled = true
        
        // Abilita Database Storage
        webSettings.databaseEnabled = true
        
        // Imposta modalità cache in base alla connettività
        updateCacheMode()
        
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
        
        // Aggiungi JavaScript Interface per notifiche native
        webView.addJavascriptInterface(notificationBridge, "AndroidNotificationBridge")
        
        // WebViewClient personalizzato per gestire offline e caching
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                // NON chiamare updateCacheMode() qui perché viene eseguito su thread di background
                // La modalità cache viene aggiornata solo dal thread principale
                return super.shouldInterceptRequest(view, request)
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: android.webkit.WebResourceError?
            ) {
                // Se c'è un errore di rete, passa alla modalità cache-only
                // Questo viene chiamato dal thread principale, quindi è sicuro
                if (!isNetworkAvailable()) {
                    webView.post {
                        webView.settings.cacheMode = WebSettings.LOAD_CACHE_ONLY
                    }
                }
                super.onReceivedError(view, request, error)
            }
            
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                // Aggiorna modalità cache all'inizio del caricamento pagina
                updateCacheMode()
                // Inietta il bridge all'inizio del caricamento pagina
                view?.evaluateJavascript(
                    """
                    (function() {
                        // Setup Android notification bridge PRIMA che React si carichi
                        if (typeof AndroidNotificationBridge !== 'undefined') {
                            console.log('AndroidNotificationBridge detected');
                            
                            // Verifica permesso
                            const hasPerm = AndroidNotificationBridge.hasPermission();
                            const permission = hasPerm ? 'granted' : 'default';
                            
                            // Override Notification API per usare notifiche native Android
                            const OriginalNotification = window.Notification;
                            
                            function AndroidNotification(title, options) {
                                if (AndroidNotificationBridge && AndroidNotificationBridge.hasPermission()) {
                                    const body = options?.body || '';
                                    const noteId = options?.tag ? parseInt(options.tag.replace('reminder-', '')) || Date.now() : Date.now();
                                    AndroidNotificationBridge.showNotification(title, body, noteId);
                                    return {
                                        close: function() {},
                                        onclick: null,
                                        onclose: null,
                                        onerror: null,
                                        onshow: null,
                                        tag: options?.tag || '',
                                        title: title,
                                        body: body
                                    };
                                }
                                if (OriginalNotification) {
                                    return new OriginalNotification(title, options);
                                }
                            }
                            
                            // Copia proprietà statiche
                            if (OriginalNotification) {
                                AndroidNotification.prototype = OriginalNotification.prototype;
                            }
                            
                            AndroidNotification.permission = permission;
                            AndroidNotification.requestPermission = function() {
                                return new Promise(function(resolve) {
                                    const perm = AndroidNotificationBridge.requestPermission();
                                    resolve(perm);
                                });
                            };
                            
                            // Sostituisci Notification globale
                            window.Notification = AndroidNotification;
                            
                            console.log('Notification API overridden for Android, permission:', permission);
                        } else {
                            console.log('AndroidNotificationBridge NOT detected');
                        }
                    })();
                    """.trimIndent(),
                    null
                )
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
                                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                                    console.log('Service Worker registered');
                                });
                            }
                        });
                    }
                    """.trimIndent(),
                    null
                )
                
                // Riapplica override Notification dopo che React si è caricato
                view?.evaluateJavascript(
                    """
                    setTimeout(function() {
                        if (typeof AndroidNotificationBridge !== 'undefined' && typeof Notification !== 'undefined') {
                            const hasPerm = AndroidNotificationBridge.hasPermission();
                            const permission = hasPerm ? 'granted' : 'default';
                            
                            const OriginalNotification = window.Notification;
                            
                            function AndroidNotification(title, options) {
                                if (AndroidNotificationBridge && AndroidNotificationBridge.hasPermission()) {
                                    const body = options?.body || '';
                                    const noteId = options?.tag ? parseInt(options.tag.replace('reminder-', '')) || Date.now() : Date.now();
                                    // Se c'è una data reminder, schedulala invece di mostrare subito
                                    if (options?.reminderDate) {
                                        AndroidNotificationBridge.scheduleReminder(title, body, noteId, options.reminderDate);
                                    } else {
                                        AndroidNotificationBridge.showNotification(title, body, noteId);
                                    }
                                    return {
                                        close: function() {},
                                        onclick: null,
                                        onclose: null,
                                        onerror: null,
                                        onshow: null,
                                        tag: options?.tag || '',
                                        title: title,
                                        body: body
                                    };
                                }
                                if (OriginalNotification) {
                                    return new OriginalNotification(title, options);
                                }
                            }
                            
                            if (OriginalNotification) {
                                AndroidNotification.prototype = OriginalNotification.prototype;
                            }
                            
                            AndroidNotification.permission = permission;
                            AndroidNotification.requestPermission = function() {
                                return new Promise(function(resolve) {
                                    const perm = AndroidNotificationBridge.requestPermission();
                                    resolve(perm);
                                });
                            };
                            
                            window.Notification = AndroidNotification;
                            
                            // Funzione helper per schedulare tutti i reminder quando l'app si carica
                            window.scheduleAllReminders = function(notes) {
                                if (!notes || !Array.isArray(notes)) return;
                                
                                notes.forEach(function(note) {
                                    if (note.reminder_date && note.id) {
                                        const reminderDate = new Date(note.reminder_date);
                                        const now = new Date();
                                        
                                        // Schedula solo se il reminder è nel futuro
                                        if (reminderDate > now) {
                                            const title = note.title || 'Reminder';
                                            const body = note.content || 'You have a reminder';
                                            AndroidNotificationBridge.scheduleReminder(title, body, note.id, note.reminder_date);
                                        }
                                    }
                                });
                            };
                            
                            console.log('Notification API re-overridden after React load, permission:', permission);
                            console.log('scheduleAllReminders function available');
                        }
                    }, 1000);
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

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST_CODE) {
            val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
            // Aggiorna il bridge JavaScript con il nuovo stato del permesso
            webView.evaluateJavascript(
                """
                if (typeof AndroidNotificationBridge !== 'undefined' && typeof Notification !== 'undefined') {
                    const permission = '$granted' === 'true' ? 'granted' : 'denied';
                    Object.defineProperty(Notification, 'permission', {
                        value: permission,
                        writable: false,
                        configurable: true
                    });
                    console.log('Notification permission updated:', permission);
                    // Triggera un evento custom per notificare React
                    window.dispatchEvent(new Event('notificationpermissionchanged'));
                }
                """.trimIndent(),
                null
            )
        }
    }

    override fun onResume() {
        super.onResume()
        // Aggiorna modalità cache quando l'app torna in primo piano
        if (::webView.isInitialized) {
            updateCacheMode()
        }
    }
    
    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}

