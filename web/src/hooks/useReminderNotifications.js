import { useEffect, useRef } from 'react';

export const useReminderNotifications = (notes) => {
  const notificationPermissionRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const notifiedRemindersRef = useRef(new Set());

  // Richiedi permesso notifiche al caricamento
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
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
      if (!('Notification' in window) || Notification.permission !== 'granted') {
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
        
        new Notification(`🔔 ${title}`, {
          body: body.substring(0, 100),
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: `reminder-${note.id}`,
          requireInteraction: false,
        });
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
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        notificationPermissionRef.current = permission;
        return permission;
      }
      return 'denied';
    },
    permission: notificationPermissionRef.current || (typeof Notification !== 'undefined' ? Notification.permission : 'denied')
  };
};

