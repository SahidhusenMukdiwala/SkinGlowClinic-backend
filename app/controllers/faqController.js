import * as faqService from '../services/faqService.js';
import { successResponse, createdResponse } from '../utils/responseHelper.js';

export const getPublicFaqs = async (req, res, next) => {
  try {
    const faqs = await faqService.getPublicFaqs();
    const message = faqs.length > 0 ? 'FAQs retrieved successfully' : 'No FAQs available at this time';
    return successResponse(res, faqs, message);
  } catch (error) {
    next(error);
  }
};

export const getAdminFaqs = async (req, res, next) => {
  try {
    const result = await faqService.getAdminFaqs(req.query);
    return successResponse(res, result, 'FAQs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getFaqById = async (req, res, next) => {
  try {
    const faq = await faqService.getFaqById(req.params.id);
    return successResponse(res, faq, 'FAQ retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createFaq = async (req, res, next) => {
  try {
    const faq = await faqService.createFaq(req.body);
    return createdResponse(res, faq, 'FAQ created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req, res, next) => {
  try {
    const faq = await faqService.updateFaq(req.params.id, req.body);
    return successResponse(res, faq, 'FAQ updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    const result = await faqService.deleteFaq(req.params.id);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
