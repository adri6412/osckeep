package com.example.keepclone

import android.app.Activity
import android.app.AlarmManager
import android.app.AlarmManager.AlarmClockInfo
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import android.util.Log
import java.util.Calendar

class NotificationBridge(private val context: Context) {
    private val channelId = "reminder_notifications"
    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Reminder Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for note reminders"
                enableVibration(true)
                enableLights(true)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    @android.webkit.JavascriptInterface
    fun showNotification(title: String, body: String, noteId: Int) {
        // Mostra notifica immediata (per reminder già scaduti)
        val intent = Intent(context, WebViewActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            noteId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("🔔 $title")
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(noteId, notification)
    }
    
    @android.webkit.JavascriptInterface
    fun scheduleReminder(title: String, body: String, noteId: Int, reminderDate: String) {
        try {
            val reminderTime = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault()).parse(reminderDate)
            if (reminderTime == null || reminderTime.time <= System.currentTimeMillis()) {
                // Se il reminder è già scaduto, mostra subito la notifica
                showNotification(title, body, noteId)
                return
            }
            
            // Crea sveglia di sistema Android
            setSystemAlarm(title, body, reminderTime, noteId)
            
            // Schedula anche la notifica tramite AlarmManager per backup
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, ReminderReceiver::class.java).apply {
                putExtra("title", title)
                putExtra("body", body)
                putExtra("noteId", noteId)
            }
            
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                noteId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    reminderTime.time,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    reminderTime.time,
                    pendingIntent
                )
            }
            
            Log.d("NotificationBridge", "Reminder scheduled for noteId: $noteId at $reminderDate")
        } catch (e: Exception) {
            Log.e("NotificationBridge", "Error scheduling reminder for noteId: $noteId", e)
            // Se c'è un errore nel parsing, mostra la notifica immediatamente
            showNotification(title, body, noteId)
        }
    }
    
    /**
     * Crea una sveglia di sistema Android usando AlarmManager.setAlarmClock()
     * Questo crea una sveglia che appare nell'app Sveglia nativa del telefono
     */
    private fun setSystemAlarm(title: String, message: String, alarmTime: java.util.Date, noteId: Int) {
        try {
            val calendar = Calendar.getInstance().apply {
                timeInMillis = alarmTime.time
            }
            
            val hour = calendar.get(Calendar.HOUR_OF_DAY)
            val minute = calendar.get(Calendar.MINUTE)
            
            // Usa AlarmManager per impostare la sveglia di sistema
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            
            // Crea un PendingIntent che apre l'app quando la sveglia suona
            val openAppIntent = Intent(context, WebViewActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                putExtra("reminder_note_id", noteId)
                putExtra("reminder_title", title)
                putExtra("reminder_body", message)
            }
            
            val showIntent = PendingIntent.getActivity(
                context,
                noteId + 10000, // Offset per evitare conflitti con altri pending intent
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            // Crea un PendingIntent per il broadcast (usato come fallback)
            val broadcastIntent = Intent(context, ReminderReceiver::class.java).apply {
                putExtra("title", title)
                putExtra("body", message)
                putExtra("noteId", noteId)
            }
            val broadcastPendingIntent = PendingIntent.getBroadcast(
                context,
                noteId,
                broadcastIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            // Crea AlarmClockInfo per la sveglia di sistema
            // Il secondo parametro è il PendingIntent che viene mostrato quando la sveglia suona
            val alarmClockInfo = AlarmClockInfo(alarmTime.time, showIntent)
            
            // Imposta la sveglia di sistema (appare nell'app Sveglia nativa)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                alarmManager.setAlarmClock(alarmClockInfo, broadcastPendingIntent)
                Log.d("NotificationBridge", "System alarm set for noteId: $noteId at $hour:$minute")
            } else {
                // Fallback per versioni precedenti: usa setExact
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, alarmTime.time, broadcastPendingIntent)
                Log.d("NotificationBridge", "Alarm set (fallback) for noteId: $noteId at $hour:$minute")
            }
        } catch (e: Exception) {
            Log.e("NotificationBridge", "Error setting system alarm for noteId: $noteId", e)
        }
    }
    
    @android.webkit.JavascriptInterface
    fun cancelReminder(noteId: Int) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        // Cancella la notifica schedulata
        val intent = Intent(context, ReminderReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            noteId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
        
        // Cancella anche la sveglia di sistema se esiste
        try {
            val openAppIntent = Intent(context, WebViewActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            }
            val showIntent = PendingIntent.getActivity(
                context,
                noteId + 10000,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(showIntent)
        } catch (e: Exception) {
            Log.e("NotificationBridge", "Error cancelling system alarm for noteId: $noteId", e)
        }
        
        Log.d("NotificationBridge", "Reminder cancelled for noteId: $noteId")
    }

    @android.webkit.JavascriptInterface
    fun requestPermission(): String {
        // Su Android 13+ serve richiedere il permesso runtime
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val hasPermission = PackageManager.PERMISSION_GRANTED ==
                ContextCompat.checkSelfPermission(context, android.Manifest.permission.POST_NOTIFICATIONS)
            if (!hasPermission && context is Activity) {
                // Richiedi permesso dall'Activity
                ActivityCompat.requestPermissions(
                    context,
                    arrayOf(android.Manifest.permission.POST_NOTIFICATIONS),
                    1001
                )
                return "default"
            }
            return if (hasPermission) "granted" else "default"
        }
        return "granted"
    }
    
    @android.webkit.JavascriptInterface
    fun hasPermission(): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return PackageManager.PERMISSION_GRANTED ==
                ContextCompat.checkSelfPermission(context, android.Manifest.permission.POST_NOTIFICATIONS)
        }
        return true
    }
}

