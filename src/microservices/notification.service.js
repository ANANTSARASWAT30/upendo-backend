const admin = require('firebase-admin');

async function sendToTopic(topic, notification, data) {
  const messaging = admin.messaging();// Get Firebase Messaging instance.
  var payload = {
    notification,// Notification object with title, body, etc.
    data,// Custom data to send.
    topic,// The topic to which the message is sent.
    android: {// Android-specific message options
      priority: 'high',// Sets high priority for the message on Android.
      notification: {channel_id: 'high_importance_channel'},// The notification channel for Android.
    },
  };
  try {
    await messaging.send(payload);// Sends the notification payload to FCM.
    return true;
  } catch (err) {
    console.log(err);// Logs any error that occurs.
    return false;// Returns false if the notification sending fails.
  }
}

module.exports = {
  sendToTopic,
};
