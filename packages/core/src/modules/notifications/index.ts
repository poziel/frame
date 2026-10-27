import './styles/index.css';

export {
  createNotificationHistory,
  NotificationHistoryController,
} from './controllers/notificationHistory';
export type {NotificationHistory} from './controllers/notificationHistory';
export type {
  NotificationHistoryState,
  HistoryNotification,
  NotificationIndicatorPosition,
  NotificationHistoryOptions,
} from './types/notificationHistoryTypes';
export {default as NotificationPanel} from './components/NotificationPanel.vue';
export {default as NotificationIndicator} from './components/NotificationIndicator.vue';
