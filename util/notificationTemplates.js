const { Appointment, Device, TestResult } = require('../models');

/**
 * Fetch contextual data based on the notification type
 * @param {string} context_type - APPOINTMENT / DEVICE / TEST
 * @param {number} context_id - ID of the related entity
 * @returns {Object} The related data to help generate message content
 */
const getContextData = async (context_type, context_id) => {
  switch (context_type) {
    case 'APPOINTMENT':
      return await Appointment.findByPk(context_id);
    case 'DEVICE':
      return await Device.findByPk(context_id);
    case 'TEST':
      return await TestResult.findByPk(context_id);
    default:
      return {};
  }
};

/**
 * Generate dynamic title and message based on notification type and context
 * @param {string} type - Type of the notification (e.g., APPOINTMENT, ALERT, VITALS)
 * @param {Object} context - Data related to the context_type and context_id
 * @returns {Object} { title, message }
 */
const generateMessageByType = (type, context) => {
  switch (type) {
    case 'APPOINTMENT':
      return {
        title: 'New Appointment Booked',
        message: `Your appointment has been scheduled for ${context?.appointment_date?.toLocaleDateString('ar-EG')} at ${context?.appointment_date?.toLocaleTimeString('ar-EG')}. Please make sure to attend.`
      };

    case 'ALERT':
      return {
        title: 'Critical Health Alert',
        message: `A critical condition was detected by your connected device. Please consult your doctor immediately.`
      };

    case 'VITALS':
      return {
        title: 'Vitals Updated',
        message: `Latest readings: Oxygen ${context?.oxygen}%, Pulse ${context?.pulse} bpm, Blood Pressure ${context?.bp}.`
      };

    case 'GENERAL':
      return {
        title: 'Good Morning',
        message: 'We wish you a healthy and productive day!'
      };

    case 'SYSTEM':
      return {
        title: 'System Notification',
        message: context?.customMessage || 'A system update or change has been made.'
      };

    default:
      return {
        title: 'New Notification',
        message: 'You have a new notification.'
      };
  }
};

module.exports = {
  getContextData,
  generateMessageByType
};