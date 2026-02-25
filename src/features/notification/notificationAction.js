import * as types from "./notificationType";

export const fetchNotifications = () => ({
  type: types.NOTIFICATION_FETCH_REQUEST,
});

export const fetchUnreadCount = () => ({
  type: types.NOTIFICATION_UNREAD_REQUEST,
});

export const markNotificationsRead = () => ({
  type: types.NOTIFICATION_MARK_READ_REQUEST,
});

export const removeNotification = (notificationId) => ({
  type: types.NOTIFICATION_REMOVE,
  payload: notificationId,
});