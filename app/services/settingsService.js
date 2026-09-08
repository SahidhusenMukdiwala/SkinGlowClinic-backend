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
