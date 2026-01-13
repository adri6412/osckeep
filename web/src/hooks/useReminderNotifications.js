import { useEffect, useRef } from 'react';

export const useReminderNotifications = (notes) => {
  const notificationPermissionRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const notifiedRemindersRef = useRef(new Set());

  // Richiedi permesso notifiche al caricamento
  useEffect(() => {
    // Funzione per controllare Android bridge
    const checkAndroidBridge = () => {
      try {
        return typeof window !== 'undefined' && 
               typeof window.AndroidNotificationBridge !== 'undefined' &&
               typeof window.AndroidNotificationBridge.hasPermission === 'function';
      } catch (e) {
        return false;
      }
    };
    
    // Controlla immediatamente e dopo un delay per assicurarsi che il bridge sia caricato
    const checkPermission = () => {
      const isAndroid = checkAndroidBridge();
      
      if (isAndroid) {
        // Su Android, verifica il permesso tramite il bridge
        try {
          const hasPerm = window.AndroidNotificationBridge.hasPermission();
          notificationPermissionRef.current = hasPerm ? 'granted' : 'default';
          
          // Aggiorna Notification.permission se disponibile
          if (typeof Notification !== 'undefined') {
            Object.defineProperty(Notification, 'permission', {
              value: hasPerm ? 'granted' : 'default',
              writable: false,
              configurable: true
            });
          }
        } catch (e) {
          console.error('Error checking Android notification permission:', e);
          notificationPermissionRef.current = 'default';
        }
      } else if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          notificationPermissionRef.current = permission;
        });
      } else if ('Notification' in window) {
        notificationPermissionRef.current = Notification.permission;
      }
    };
    
    checkPermission();
    // Ricontrolla più volte per assicurarsi che il bridge sia disponibile
    const timeoutId1 = setTimeout(checkPermission, 500);
    const timeoutId2 = setTimeout(checkPermission, 1500);
    const timeoutId3 = setTimeout(checkPermission, 3000);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, []);

  // Controlla reminder scaduti ogni secondo per massima precisione
  useEffect(() => {
    const checkReminders = () => {
      const isAndroid = typeof window !== 'undefined' && 
                        typeof window.AndroidNotificationBridge !== 'undefined' &&
                        typeof window.AndroidNotificationBridge.hasPermission === 'function';
      
      let hasPermission = false;
      if (isAndroid) {
        try {
          hasPermission = window.AndroidNotificationBridge.hasPermission();
        } catch (e) {
          console.error('Error checking Android permission:', e);
        }
      } else {
        hasPermission = 'Notification' in window && Notification.permission === 'granted';
      }
      
      if (!hasPermission) {
        return;
      }

      const now = Date.now();
      const overdueReminders = notes.filter(note => {
        if (!note.reminder_date) return false;
        
        try {
          const reminderDate = new Date(note.reminder_date).getTime();
          // Usa solo l'ID come chiave per evitare problemi quando la data viene aggiornata
          const reminderKey = `reminder-${note.id}`;
          
          // Se il reminder è scaduto e non è stato ancora notificato
          // Usa <= per includere anche i reminder che scadono esattamente ora
          if (reminderDate <= now && !notifiedRemindersRef.current.has(reminderKey)) {
            notifiedRemindersRef.current.add(reminderKey);
            console.log('Reminder scaduto:', note.title || 'Untitled', 'scaduto alle', new Date(reminderDate).toLocaleString());
            return true;
          }
        } catch (e) {
          console.error('Error parsing reminder date:', e);
        }
        
        return false;
      });

      // Mostra notifica per ogni reminder scaduto
      if (overdueReminders.length > 0) {
        console.log(`Trovati ${overdueReminders.length} reminder scaduti`);
      }
      
      overdueReminders.forEach(note => {
        const title = note.title || 'Reminder';
        const body = note.content || 'You have a reminder';
        
        try {
          const isAndroid = typeof window !== 'undefined' && 
                            typeof window.AndroidNotificationBridge !== 'undefined' &&
                            typeof window.AndroidNotificationBridge.hasPermission === 'function';
          
          if (isAndroid && window.AndroidNotificationBridge.hasPermission()) {
            // Su Android, mostra notifica immediata per reminder scaduti
            console.log('Mostrando notifica Android per:', title);
            window.AndroidNotificationBridge.showNotification(title, body.substring(0, 200), note.id || Date.now());
          } else if ('Notification' in window && Notification.permission === 'granted') {
            // Su web, usa Notification API normale
            console.log('Mostrando notifica web per:', title);
            new Notification(title, {
              body: body.substring(0, 200),
              icon: '/vite.svg',
              badge: '/vite.svg',
              tag: `reminder-${note.id}`,
              requireInteraction: false,
            });
          }
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      });
    };

    // Controlla immediatamente quando le note cambiano
    checkReminders();

    // Controlla ogni secondo per massima precisione
    checkIntervalRef.current = setInterval(checkReminders, 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [notes]);

  // Pulisci reminder notificati quando cambiano le note
  useEffect(() => {
    const currentReminderKeys = new Set(
      notes
        .filter(note => note.reminder_date)
        .map(note => `reminder-${note.id}`)
    );
    
    // Rimuovi chiavi che non esistono più o che non hanno più un reminder
    notifiedRemindersRef.current.forEach(key => {
      if (!currentReminderKeys.has(key)) {
        notifiedRemindersRef.current.delete(key);
      }
    });
    
    // Rimuovi anche i reminder che non sono più scaduti (se la data è stata modificata)
    notes.forEach(note => {
      if (note.reminder_date) {
        try {
          const reminderDate = new Date(note.reminder_date).getTime();
          const now = Date.now();
          const reminderKey = `reminder-${note.id}`;
          
          // Se il reminder non è più scaduto, rimuovilo dal set
          if (reminderDate > now && notifiedRemindersRef.current.has(reminderKey)) {
            notifiedRemindersRef.current.delete(reminderKey);
          }
        } catch (e) {
          console.error('Error parsing reminder date:', e);
        }
      }
    });
  }, [notes]);

  return {
    requestPermission: async () => {
      const isAndroid = typeof window !== 'undefined' && 
                        typeof window.AndroidNotificationBridge !== 'undefined' &&
                        typeof window.AndroidNotificationBridge.requestPermission === 'function';
      if (isAndroid) {
        try {
          const perm = window.AndroidNotificationBridge.requestPermission();
          notificationPermissionRef.current = perm;
          return perm;
        } catch (e) {
          console.error('Error requesting Android permission:', e);
          return 'denied';
        }
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        notificationPermissionRef.current = permission;
        return permission;
      }
      return 'denied';
    },
    permission: notificationPermissionRef.current || 
      (typeof window !== 'undefined' && 
       typeof window.AndroidNotificationBridge !== 'undefined' &&
       typeof window.AndroidNotificationBridge.hasPermission === 'function' ?
       (window.AndroidNotificationBridge.hasPermission() ? 'granted' : 'default') :
       (typeof Notification !== 'undefined' ? Notification.permission : 'denied'))
  };
};

