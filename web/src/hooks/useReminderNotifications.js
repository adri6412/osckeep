import { useEffect, useRef } from 'react';

export const useReminderNotifications = (notes) => {
  const notificationPermissionRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const notifiedRemindersRef = useRef(new Set());

  // Richiedi permesso notifiche al caricamento
  useEffect(() => {
    // Controlla se siamo su Android (tramite bridge)
    const isAndroid = typeof window.AndroidNotificationBridge !== 'undefined';
    
    if (isAndroid) {
      // Su Android, il permesso è gestito dal bridge
      notificationPermissionRef.current = 'granted';
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission;
      });
    } else if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission;
    }
  }, []);

  // Controlla reminder scaduti ogni minuto
  useEffect(() => {
    const checkReminders = () => {
      const isAndroid = typeof window.AndroidNotificationBridge !== 'undefined';
      const hasPermission = isAndroid || ('Notification' in window && Notification.permission === 'granted');
      
      if (!hasPermission) {
        return;
      }

      const now = new Date();
      const overdueReminders = notes.filter(note => {
        if (!note.reminder_date) return false;
        
        const reminderDate = new Date(note.reminder_date);
        const reminderKey = `${note.id}-${note.reminder_date}`;
        
        // Se il reminder è scaduto e non è stato ancora notificato
        if (reminderDate <= now && !notifiedRemindersRef.current.has(reminderKey)) {
          notifiedRemindersRef.current.add(reminderKey);
          return true;
        }
        
        return false;
      });

      // Mostra notifica per ogni reminder scaduto
      overdueReminders.forEach(note => {
        const title = note.title || 'Reminder';
        const body = note.content || 'You have a reminder';
        
        try {
          new Notification(title, {
            body: body.substring(0, 200),
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: `reminder-${note.id}`,
            requireInteraction: false,
          });
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      });
    };

    // Controlla immediatamente
    checkReminders();

    // Controlla ogni minuto
    checkIntervalRef.current = setInterval(checkReminders, 60000);

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
        .map(note => `${note.id}-${note.reminder_date}`)
    );
    
    // Rimuovi chiavi che non esistono più
    notifiedRemindersRef.current.forEach(key => {
      if (!currentReminderKeys.has(key)) {
        notifiedRemindersRef.current.delete(key);
      }
    });
  }, [notes]);

  return {
    requestPermission: async () => {
      const isAndroid = typeof window.AndroidNotificationBridge !== 'undefined';
      if (isAndroid) {
        notificationPermissionRef.current = 'granted';
        return 'granted';
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        notificationPermissionRef.current = permission;
        return permission;
      }
      return 'denied';
    },
    permission: notificationPermissionRef.current || 
      (typeof window.AndroidNotificationBridge !== 'undefined' ? 'granted' : 
       (typeof Notification !== 'undefined' ? Notification.permission : 'denied'))
  };
};

