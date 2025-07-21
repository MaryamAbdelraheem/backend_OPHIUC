const { Notification } = require('../models');
const { getContextData, generateMessageByType } = require('../utils/notificationTemplates');

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
  patientId = null,
  doctorId = null,
  appointmentId = null
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
    patientId,            
    doctorId,           
    appointmentId    
  });

  // Optional: handle push notification delivery (if needed)
  if (delivery_method === 'PUSH') {
    // TODO: integrate with FCM or any push notification service
  }

  return notification;
};
module.exports = { send };
