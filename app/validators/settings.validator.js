import Joi from 'joi';

const settingValueSchema = Joi.alternatives().try(
  Joi.string().allow('', null),
  Joi.number()
);

export const updateSettingsSchema = Joi.alternatives().try(
  Joi.object().pattern(Joi.string(), settingValueSchema).custom((value, helpers) => {
    if (value.map_embed_url) {
      const url = String(value.map_embed_url).trim();
      const isGoogleMaps = /^https:\/\/(www\.)?(google\.com\/maps\/embed|maps\.google\.com)/i.test(url);
      if (!isGoogleMaps) {
        return helpers.message('Google Maps embed URL must begin with https://www.google.com/maps/embed');
      }
    }
    return value;
  }),
  Joi.array().items(
    Joi.object({
      setting_key: Joi.string().required(),
      setting_value: settingValueSchema.default(''),
    }).custom((item, helpers) => {
      if (item.setting_key === 'map_embed_url' && item.setting_value) {
        const url = String(item.setting_value).trim();
        const isGoogleMaps = /^https:\/\/(www\.)?(google\.com\/maps\/embed|maps\.google\.com)/i.test(url);
        if (!isGoogleMaps) {
          return helpers.message('Google Maps embed URL must begin with https://www.google.com/maps/embed');
        }
      }
      return item;
    })
  )
);
