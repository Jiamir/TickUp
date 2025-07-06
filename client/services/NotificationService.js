// services/NotificationService.js
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.initializeNotifications();
  }

  async initializeNotifications() {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  // Schedule notification for a specific task
  async scheduleTaskReminder(task) {
    try {
      const preferences = await this.getNotificationPreferences();
      
      if (!preferences.enabled) {
        return;
      }

      const dueDate = new Date(task.dueDate);
      const reminderDate = new Date(dueDate.getTime() - (preferences.reminderTime * 60 * 1000));
      const currentDate = new Date();

      // Only schedule if reminder time is in the future
      if (reminderDate > currentDate) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '📋 Task Reminder',
            body: `"${task.title}" is due in ${preferences.reminderTime} minutes!`,
            sound: preferences.soundEnabled,
            data: { 
              taskId: task.id,
              type: 'task_reminder'
            },
          },
          trigger: {
            date: reminderDate,
          },
        });

        // Store notification ID with task for later cancellation
        await this.saveTaskNotificationId(task.id, notificationId);
        
        console.log(`Scheduled reminder for task: ${task.title} at ${reminderDate}`);
        return notificationId;
      }
    } catch (error) {
      console.error('Error scheduling task reminder:', error);
    }
  }

  // Cancel notification for a specific task
  async cancelTaskReminder(taskId) {
    try {
      const notificationId = await this.getTaskNotificationId(taskId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeTaskNotificationId(taskId);
        console.log(`Cancelled reminder for task: ${taskId}`);
      }
    } catch (error) {
      console.error('Error cancelling task reminder:', error);
    }
  }

  // Schedule daily reminder
  async scheduleDailyReminder() {
    try {
      const preferences = await this.getNotificationPreferences();
      
      if (!preferences.enabled || !preferences.dailyReminder) {
        return;
      }

      // Cancel existing daily reminder
      await this.cancelDailyReminder();

      const [hour, minute] = preferences.dailyReminderTime.split(':');
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Good Morning!',
          body: 'Start your day by checking your tasks in TickUp',
          sound: preferences.soundEnabled,
          data: { 
            type: 'daily_reminder'
          },
        },
        trigger: {
          hour: parseInt(hour),
          minute: parseInt(minute),
          repeats: true,
        },
      });

      await AsyncStorage.setItem('dailyReminderNotificationId', notificationId);
      console.log(`Scheduled daily reminder at ${preferences.dailyReminderTime}`);
      
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  }

  // Cancel daily reminder
  async cancelDailyReminder() {
    try {
      const notificationId = await AsyncStorage.getItem('dailyReminderNotificationId');
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await AsyncStorage.removeItem('dailyReminderNotificationId');
        console.log('Cancelled daily reminder');
      }
    } catch (error) {
      console.error('Error cancelling daily reminder:', error);
    }
  }

  // Schedule weekly summary
  async scheduleWeeklySummary() {
    try {
      const preferences = await this.getNotificationPreferences();
      
      if (!preferences.enabled || !preferences.weeklySummary) {
        return;
      }

      // Cancel existing weekly summary
      await this.cancelWeeklySummary();

      // Schedule for Sunday at 6 PM
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Weekly Summary',
          body: 'Check your productivity stats and plan for the week ahead!',
          sound: preferences.soundEnabled,
          data: { 
            type: 'weekly_summary'
          },
        },
        trigger: {
          weekday: 1, // Sunday
          hour: 18,
          minute: 0,
          repeats: true,
        },
      });

      await AsyncStorage.setItem('weeklySummaryNotificationId', notificationId);
      console.log('Scheduled weekly summary');
      
    } catch (error) {
      console.error('Error scheduling weekly summary:', error);
    }
  }

  // Cancel weekly summary
  async cancelWeeklySummary() {
    try {
      const notificationId = await AsyncStorage.getItem('weeklySummaryNotificationId');
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await AsyncStorage.removeItem('weeklySummaryNotificationId');
        console.log('Cancelled weekly summary');
      }
    } catch (error) {
      console.error('Error cancelling weekly summary:', error);
    }
  }

  // Schedule all notifications based on current tasks and preferences
  async scheduleAllNotifications() {
    try {
      const preferences = await this.getNotificationPreferences();
      
      if (!preferences.enabled) {
        await this.cancelAllNotifications();
        return;
      }

      // Schedule daily reminder
      if (preferences.dailyReminder) {
        await this.scheduleDailyReminder();
      }

      // Schedule weekly summary
      if (preferences.weeklySummary) {
        await this.scheduleWeeklySummary();
      }

      // Schedule task reminders
      const tasks = await this.getLocalTasks();
      for (const task of tasks) {
        if (!task.isCompleted) {
          await this.scheduleTaskReminder(task);
        }
      }

      console.log('All notifications scheduled successfully');
    } catch (error) {
      console.error('Error scheduling all notifications:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('taskNotificationIds');
      await AsyncStorage.removeItem('dailyReminderNotificationId');
      await AsyncStorage.removeItem('weeklySummaryNotificationId');
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Send immediate notification (for testing or immediate alerts)
  async sendImmediateNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  // Helper methods
  async getNotificationPreferences() {
    try {
      const preferences = await AsyncStorage.getItem('notificationPreferences');
      return preferences ? JSON.parse(preferences) : {
        enabled: true,
        reminderTime: 30,
        dailyReminder: true,
        dailyReminderTime: "09:00",
        weeklySummary: true,
        soundEnabled: true,
        vibrationEnabled: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {};
    }
  }

  async getLocalTasks() {
    try {
      const tasks = await AsyncStorage.getItem('localTasks');
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error getting local tasks:', error);
      return [];
    }
  }

  async saveTaskNotificationId(taskId, notificationId) {
    try {
      const existingIds = await AsyncStorage.getItem('taskNotificationIds');
      const ids = existingIds ? JSON.parse(existingIds) : {};
      ids[taskId] = notificationId;
      await AsyncStorage.setItem('taskNotificationIds', JSON.stringify(ids));
    } catch (error) {
      console.error('Error saving task notification ID:', error);
    }
  }

  async getTaskNotificationId(taskId) {
    try {
      const existingIds = await AsyncStorage.getItem('taskNotificationIds');
      const ids = existingIds ? JSON.parse(existingIds) : {};
      return ids[taskId];
    } catch (error) {
      console.error('Error getting task notification ID:', error);
      return null;
    }
  }

  async removeTaskNotificationId(taskId) {
    try {
      const existingIds = await AsyncStorage.getItem('taskNotificationIds');
      const ids = existingIds ? JSON.parse(existingIds) : {};
      delete ids[taskId];
      await AsyncStorage.setItem('taskNotificationIds', JSON.stringify(ids));
    } catch (error) {
      console.error('Error removing task notification ID:', error);
    }
  }

  // Update all notifications when preferences change
  async updateNotificationPreferences(newPreferences) {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
      
      // Re-schedule all notifications with new preferences
      await this.scheduleAllNotifications();
      
      console.log('Notification preferences updated and notifications rescheduled');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  // Handle task completion - cancel its reminder
  async handleTaskCompletion(taskId) {
    try {
      await this.cancelTaskReminder(taskId);
      console.log(`Task ${taskId} completed - reminder cancelled`);
    } catch (error) {
      console.error('Error handling task completion:', error);
    }
  }

  // Handle task deletion - cancel its reminder
  async handleTaskDeletion(taskId) {
    try {
      await this.cancelTaskReminder(taskId);
      console.log(`Task ${taskId} deleted - reminder cancelled`);
    } catch (error) {
      console.error('Error handling task deletion:', error);
    }
  }

  // Test notification function
  async testNotification() {
    try {
      await this.sendImmediateNotification(
        '🧪 Test Notification',
        'This is a test notification from TickUp!'
      );
      console.log('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

// Export singleton instance
export default new NotificationService();