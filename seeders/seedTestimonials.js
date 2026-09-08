import { Testimonial } from '../app/models/index.js';
import { logger } from '../app/utils/logger.js';

const initialTestimonials = [
  {
    patient_name: 'Ananya Deshmukh',
    patient_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    review_text: 'My experience with HydraFacial Elite MD at SkinGlow Clinic was beyond exceptional. Dr. Aisha and her team analyzed my skin barrier first, and after just one session, my stubborn post-inflammatory redness was virtually gone. The clinic hygiene and ambiance are world-class.',
    rating: 5,
    is_active: 1,
  },
  {
    patient_name: 'Rohan Mehta',
    patient_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    review_text: 'I underwent 4 sessions of PRP Hair Bio-Restoration. The results have been remarkable — hair fall stopped entirely by the second month and my crown density has significantly thickened. Truly a physician-led clinical experience with no false promises.',
    rating: 5,
    is_active: 1,
  },
  {
    patient_name: 'Pooja Kapoor',
    patient_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    review_text: 'The Triple-Wavelength Laser Hair Reduction is painless! The cooling tip is amazing and there was zero irritation afterwards. After 3 sessions, I barely have any regrowth. Best skincare decision I have made.',
    rating: 5,
    is_active: 1,
  },
  {
    patient_name: 'Vikram Singhania',
    patient_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    review_text: 'Dr. Sharma has an artistic eye for natural anti-aging enhancements. The subtle wrinkle smoothing took years off my tired expression without making my forehead look frozen. Transparent consultation and meticulous care.',
    rating: 5,
    is_active: 1,
  },
  {
    patient_name: 'Sneha Patel',
    patient_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    review_text: 'The chemical peeling regimen for my stubborn melasma produced noticeable clarity within 4 weeks. I felt completely safe under their medical supervision. Highly recommend SkinGlow to anyone seeking clinical excellence.',
    rating: 5,
    is_active: 1,
  },
];

export const seedTestimonials = async () => {
  try {
    for (const item of initialTestimonials) {
      await Testimonial.findOrCreate({
        where: { patient_name: item.patient_name },
        defaults: item,
      });
    }
    logger.info(' Testimonials seeded/verified successfully.');
  } catch (error) {
    logger.error('Error seeding testimonials:', error);
  }
};
