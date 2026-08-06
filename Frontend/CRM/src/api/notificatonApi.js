import api from "./axios";

export const getMyNotifications = () => {
  return api.get("api/notifications");
};

export const getUnreadNotificationCount = () => {
  return api.get("api/notifications/unread-count");
};

export const markNotificationAsRead = (notificationId) => {
  return api.put(`api/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = () => {
  return api.put("api/notifications/mark-all-read");
};