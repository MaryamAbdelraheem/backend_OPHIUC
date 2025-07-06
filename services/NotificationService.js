// const { Notification } = require('../models');
// const { getContextData, generateMessageByType } = require('../util/notificationTemplates');

// /**
//  * Send a notification to a user
//  * 
//  * @param {Object} options - Notification details
//  * @param {string} options.type - Notification type (e.g., APPOINTMENT, ALERT, GREETING, etc.)
//  * @param {number} options.recipient_id - The user who receives the notification
//  * @param {number} [options.sender_id] - The user who triggered the notification
//  * @param {string} options.context_type - Context type (e.g., DEVICE, APPOINTMENT, TEST, NONE)
//  * @param {number} options.context_id - ID of the related context object
//  * @param {string} [options.title] - Optional custom title
//  * @param {string} [options.message] - Optional custom message
//  * @param {string} options.target_app - The target app (either "patient" or "doctor")
//  * @param {string} [options.delivery_method='in-app'] - Delivery method ("in-app" or "push")
//  * 
//  * @returns {Object} The created notification
//  */
// const send = async ({
//   type,
//   recipient_id,
//   sender_id,
//   context_type,
//   context_id,
//   title,
//   message,
//   target_app,
//   delivery_method = 'IN_APP'
// }) => {
//   // Get contextual data for dynamic content generation
//   const context = await getContextData(context_type, context_id);

//   // Auto-generate title and message if not provided
//   if (!title || !message) {
//     const generated = generateMessageByType(type, context);
//     title = title || generated.title;
//     message = message || generated.message;
//   }

//   // Create the notification in the database
//   const notification = await Notification.create({
//     type,
//     title,
//     message,
//     recipient_id,
//     sender_id,
//     context_type,
//     context_id,
//     target_app,
//     delivery_method
//   });

//   // Optional: handle push notification delivery (if needed)
//   if (delivery_method === 'PUSH') {
//     // TODO: integrate with FCM or any push notification service
//   }

//   return notification;
// };

// module.exports = { send };



// After Update
const { Notification } = require('../models');
const { getContextData, generateMessageByType } = require('../util/notificationTemplates');

const send = async ({
  type,
  recipient_id,
  sender_id,
  context_type,
  context_id,
  title,
  message,
  target_app,
  delivery_method = 'IN_APP',
  PatientPatientId = null,
  DoctorDoctorId = null,
  AppointmentAppointmentId = null
}) => {
  // Get contextual data for dynamic content generation
  const context = await getContextData(context_type, context_id);

  // Auto-generate title and message if not provided
  if (!title || !message) {
    const generated = generateMessageByType(type, context);
    title = title || generated.title;
    message = message || generated.message;
  }

  // Create the notification in the database
  const notification = await Notification.create({
    type,
    title,
    message,
    recipient_id,
    sender_id,
    context_type,
    context_id,
    target_app,
    delivery_method,
    PatientPatientId,            // ✅ جديد
    DoctorDoctorId,              // ✅ جديد
    AppointmentAppointmentId     // ✅ جديد
  });

  // Optional: handle push notification delivery (if needed)
  if (delivery_method === 'PUSH') {
    // TODO: integrate with FCM or any push notification service
  }

  return notification;
};
module.exports = { send };
