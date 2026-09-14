import { Op } from 'sequelize';
import { SiteSetting, UserMaster } from '../models/index.js';

export const getPublicSettings = async () => {
  const settingsRecords = await SiteSetting.findAll({
    attributes: ['setting_key', 'setting_value', 'setting_type', 'display_label'],
  });

  const settingsMap = {};
  for (const record of settingsRecords) {
    settingsMap[record.setting_key] = record.setting_value;
  }

  // Dynamically attach primary doctor / administrator profile_image
  try {
    const leadAdmin = await UserMaster.findOne({
      where: {
        role: { [Op.in]: [0, 1] },
        is_active: 1,
        profile_image: { [Op.ne]: null },
      },
      order: [['role', 'ASC'], ['id', 'ASC']],
      attributes: ['id', 'full_name', 'profile_image'],
    });

    if (leadAdmin?.profile_image) {
      settingsMap.doctor_image = leadAdmin.profile_image;
      settingsMap.doctor_profile_image = leadAdmin.profile_image;
    }
  } catch {
    // Non-critical: gracefully fallback if user_master query fails
  }

  return {
    raw: settingsRecords,
    map: settingsMap,
  };
};

/**
 * Admin: Get all settings with full metadata
 */
export const getAllAdminSettings = async () => {
  const settingsRecords = await SiteSetting.findAll({
    order: [['id', 'ASC']],
  });

  const settingsMap = {};
  for (const record of settingsRecords) {
    settingsMap[record.setting_key] = record.setting_value;
  }

  // Dynamically attach primary doctor / administrator profile_image
  try {
    const leadAdmin = await UserMaster.findOne({
      where: {
        role: { [Op.in]: [0, 1] },
        is_active: 1,
        profile_image: { [Op.ne]: null },
      },
      order: [['role', 'ASC'], ['id', 'ASC']],
      attributes: ['id', 'full_name', 'profile_image'],
    });

    if (leadAdmin?.profile_image) {
      settingsMap.doctor_image = leadAdmin.profile_image;
      settingsMap.doctor_profile_image = leadAdmin.profile_image;
    }
  } catch {
    // Non-critical fallback
  }

  return {
    settings: settingsRecords,
    map: settingsMap,
  };
};

export const ALLOWED_SETTING_KEYS = new Set([
  'clinic_name',
  'clinic_tagline',
  'doctor_name',
  'doctor_qualifications',
  'doctor_image',
  'doctor_profile_image',
  'phone',
  'clinic_phone',
  'email',
  'clinic_email',
  'address',
  'clinic_address',
  'working_hours',
  'whatsapp_number',
  'map_embed_url',
  'facebook_url',
  'instagram_url',
  'youtube_url',
  'about_text',
  'about_image',
  'hero_title',
  'hero_subtitle',
  'contact_email',
  'contact_phone',
]);

/**
 * Admin: Bulk update settings
 * @param {Record<string, string> | Array<{ setting_key: string, setting_value: string }>} updates
 */
export const updateSettings = async (updates) => {
  if (Array.isArray(updates)) {
    for (const item of updates) {
      if (item.setting_key && ALLOWED_SETTING_KEYS.has(item.setting_key)) {
        await SiteSetting.update(
          { setting_value: String(item.setting_value ?? '') },
          { where: { setting_key: item.setting_key } }
        );
      }
    }
  } else if (typeof updates === 'object' && updates !== null) {
    const keys = Object.keys(updates);
    for (const key of keys) {
      if (ALLOWED_SETTING_KEYS.has(key)) {
        await SiteSetting.update(
          { setting_value: String(updates[key] ?? '') },
          { where: { setting_key: key } }
        );
      }
    }
  }

  return getAllAdminSettings();
};
