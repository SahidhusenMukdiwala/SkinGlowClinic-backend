import { SiteSetting } from '../models/index.js';

export const getPublicSettings = async () => {
  const settingsRecords = await SiteSetting.findAll({
    attributes: ['setting_key', 'setting_value', 'setting_type', 'display_label'],
  });

  const settingsMap = {};
  for (const record of settingsRecords) {
    settingsMap[record.setting_key] = record.setting_value;
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

  return {
    settings: settingsRecords,
    map: settingsMap,
  };
};

/**
 * Admin: Bulk update settings
 * @param {Record<string, string> | Array<{ setting_key: string, setting_value: string }>} updates
 */
export const updateSettings = async (updates) => {
  if (Array.isArray(updates)) {
    for (const item of updates) {
      if (item.setting_key) {
        await SiteSetting.update(
          { setting_value: String(item.setting_value ?? '') },
          { where: { setting_key: item.setting_key } }
        );
      }
    }
  } else if (typeof updates === 'object' && updates !== null) {
    const keys = Object.keys(updates);
    for (const key of keys) {
      await SiteSetting.update(
        { setting_value: String(updates[key] ?? '') },
        { where: { setting_key: key } }
      );
    }
  }

  return getAllAdminSettings();
};
