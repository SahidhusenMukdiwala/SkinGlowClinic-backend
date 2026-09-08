import { SiteSetting } from '../app/models/index.js';
import { logger } from '../app/utils/logger.js';

const initialSettings = [
  {
    setting_key: 'clinic_name',
    setting_value: 'SkinGlow Clinic',
    setting_type: 1, // Text
    display_label: 'Clinic Name',
  },
  {
    setting_key: 'clinic_tagline',
    setting_value: 'Advanced Dermatological & Aesthetic Care',
    setting_type: 1,
    display_label: 'Clinic Tagline',
  },
  {
    setting_key: 'doctor_name',
    setting_value: 'Dr. Aisha Sharma',
    setting_type: 1,
    display_label: 'Lead Dermatologist Name',
  },
  {
    setting_key: 'doctor_qualifications',
    setting_value: 'MD Dermatology, Fellowship in Aesthetic Medicine',
    setting_type: 1,
    display_label: 'Doctor Qualifications',
  },
  {
    setting_key: 'phone',
    setting_value: '+91 98765 43210',
    setting_type: 5, // Phone
    display_label: 'Contact Phone',
  },
  {
    setting_key: 'email',
    setting_value: 'contact@skinglowclinic.com',
    setting_type: 4, // Email
    display_label: 'Contact Email',
  },
  {
    setting_key: 'address',
    setting_value: 'Suite 402, Royal Palms Avenue, Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    setting_type: 2, // Textarea
    display_label: 'Clinic Physical Address',
  },
  {
    setting_key: 'map_embed_url',
    setting_value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.2185568102434!2d72.82987157582536!3d19.05414278214643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9135a5a1f2b%3A0x6b63ef27c44e9ee9!2sBandra%20West%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000',
    setting_type: 3, // URL
    display_label: 'Google Maps Embed URL',
  },
  {
    setting_key: 'whatsapp_number',
    setting_value: '919876543210',
    setting_type: 5,
    display_label: 'WhatsApp Chat Number',
  },
  {
    setting_key: 'facebook_url',
    setting_value: 'https://facebook.com/skinglowclinic',
    setting_type: 3,
    display_label: 'Facebook Profile URL',
  },
  {
    setting_key: 'instagram_url',
    setting_value: 'https://instagram.com/skinglowclinic',
    setting_type: 3,
    display_label: 'Instagram Profile URL',
  },
  {
    setting_key: 'youtube_url',
    setting_value: 'https://youtube.com/@skinglowclinic',
    setting_type: 3,
    display_label: 'YouTube Channel URL',
  },
  {
    setting_key: 'working_hours',
    setting_value: 'Mon - Sat: 10:00 AM - 08:00 PM | Sunday: Closed',
    setting_type: 1,
    display_label: 'Working Hours',
  },
  {
    setting_key: 'about_text',
    setting_value: 'At SkinGlow Clinic, we blend cutting-edge medical dermatology with artistic aesthetic techniques. Our bespoke treatments are personalized to restore balance, enhance radiance, and celebrate your natural skin health with uncompromising clinical excellence.',
    setting_type: 2,
    display_label: 'About Clinic Overview',
  },
  {
    setting_key: 'about_image',
    setting_value: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    setting_type: 3,
    display_label: 'About Section Image URL',
  },
];

export const seedSettings = async () => {
  try {
    for (const setting of initialSettings) {
      await SiteSetting.findOrCreate({
        where: { setting_key: setting.setting_key },
        defaults: setting,
      });
    }
    logger.info(' Site settings seeded/verified.');
  } catch (error) {
    logger.error('Error seeding site settings:', error);
  }
};
