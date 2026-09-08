import { Inquiry } from '../models/index.js';
import { sendInquiryNotification } from '../utils/email.js';

export const createInquiry = async (data) => {
  const inquiry = await Inquiry.create({
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    subject: data.subject.trim(),
    message: data.message.trim(),
    is_read: 0,
  });

  // Trigger asynchronous email alert to clinic (non-blocking)
  sendInquiryNotification(inquiry).catch(() => {});

  return inquiry;
};
