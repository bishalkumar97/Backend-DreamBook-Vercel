// const admin = require('firebase-admin');

// async function sendToTopic(topic, notification, data) {
//   const messaging = admin.messaging();
//   var payload = {
//     notification,
//     data,
//     topic,
//     android: {
//       priority: 'high',
//       notification: {channel_id: 'high_importance_channel'},
//     },
//   };
//   try {
//     await messaging.send(payload);
//     return true;
//   } catch (err) {
//     console.log(err);
//     return false;
//   }
// }

// module.exports = {
//   sendToTopic,
// };

const admin = require('firebase-admin');

async function sendToTopic(topic, notification, data = {}) {
  const messaging = admin.messaging();
  const payload = {
    notification,
    data,
    topic,
    android: {
      priority: 'high',
      notification: { channel_id: 'high_importance_channel' },
    },
  };

  try {
    await messaging.send(payload);
    console.log(`✅ Notification sent to topic: ${topic}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send notification to topic ${topic}:`, err);
    return false;
  }
}

/**
 * Send notification based on role and action.
 * @param {string} role - Role of the recipient ('admin', 'author')
 * @param {object} notification - { title, body }
 * @param {object} data - Additional payload data (e.g. bookId, userId)
 */
async function sendRoleBasedNotification(role, notification, data = {}) {
  let topic = '';

  // Admin receives everything
  if (role === 'admin') {
    topic = 'admin';
  }

  // Author only gets notified about their books
  else if (role === 'author' && data.authorId) {
    topic = `author_${data.authorId}`;
  }

  if (topic) {
    return await sendToTopic(topic, notification, data);
  }

  console.warn('⚠️ No valid topic found for role:', role, 'with data:', data);
  return false;
}

module.exports = {
  sendToTopic,
  sendRoleBasedNotification,
};
