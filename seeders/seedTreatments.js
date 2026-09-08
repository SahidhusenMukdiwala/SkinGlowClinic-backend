import { Treatment } from '../app/models/index.js';
import { logger } from '../app/utils/logger.js';

const initialTreatments = [
  {
    title: 'HydraFacial Elite MD',
    slug: 'hydrafacial-elite-md',
    category: 1, // Skin
    duration: '45-60 mins',
    display_order: 1,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
    short_description: 'Medical-grade hydradermabrasion that cleanses, exfoliates, extracts impurities, and hydrates with antioxidant serums.',
    full_description: `HydraFacial Elite MD is a multi-step clinical treatment that combines the benefits of next-level hydradermabrasion, automated painless extractions, and a patented Vortex-Fusion delivery of skin-nourishing antioxidants, peptides, and hyaluronic acid.

### Clinical Procedure Overview
1. **Deep Cleansing & Exfoliation**: Gentle peeling agents loosen dead epidermal cells and reveal fresh, radiant layers underneath.
2. **Painless Vacuum Extraction**: Automated vortex suction effortlessly unclogs congested pores without manual trauma or inflammation.
3. **Targeted Booster Infusion**: Tailored peptides and brightening complexes address your unique pigmentation, fine lines, or dehydration concerns.
4. **Antioxidant Saturation**: Rich botanical antioxidants seal the dermal barrier, providing an instantaneous, dewy radiance with zero downtime.

### Ideal Candidates
Recommended for patients battling dullness, congested pores, uneven texture, fine lines, and seasonal dryness seeking radiant skin before events or as monthly maintenance.`,
  },
  {
    title: 'Advanced Medical Chemical Peels',
    slug: 'medical-chemical-peels',
    category: 1, // Skin
    duration: '30-45 mins',
    display_order: 2,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1512290900672-1a0149021873?auto=format&fit=crop&w=1000&q=80',
    short_description: 'Tailored AHA/BHA and TCA clinical peels designed to resurface hyperpigmentation, active acne, and stubborn sun spots.',
    full_description: `Our dermatologist-supervised chemical peeling protocols utilize bespoke blends of glycolic acid, salicylic acid, lactic acid, and modified TCA to stimulate regulated cellular turnover and collagen renewal.

### Treatment Highlights
- **Acne Clarifying Peel**: Penetrates deep into the pilosebaceous units to dissolve comedones, regulate sebum, and diminish P. acnes bacteria.
- **Radiance Melasma Peel**: Gently breaks down melanin clusters, visibly fading post-inflammatory hyperpigmentation (PIH) and melasma patches.
- **Renewal Anti-Aging Peel**: Accelerates dermal regeneration, minimizing shallow fine lines and refining coarse skin texture.

Expect mild tingling during application followed by subtle flaking over 3 to 5 days, revealing smoother, clearer skin.`,
  },
  {
    title: 'PRP Hair Follicle Bio-Restoration',
    slug: 'prp-hair-restoration',
    category: 2, // Hair
    duration: '60 mins',
    display_order: 3,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
    short_description: 'Autologous platelet-rich plasma micro-injections to halt hair thinning, nourish dormant follicles, and stimulate dense regrowth.',
    full_description: `Platelet-Rich Plasma (PRP) therapy harnesses your body’s own concentrated bioactive growth factors to reverse follicular miniaturization and stimulate cellular proliferation in dormant hair follicles.

### Protocol Steps
1. **Precision Blood Draw**: A small blood sample is collected using sterile medical vacutainers.
2. **Dual-Spin Centrifugation**: Advanced centrifugal isolation separates pure, platelet-dense plasma rich in VEGF and PDGF growth factors.
3. **Micro-Infusion**: Using micro-fine German needles and topical numbing for maximum comfort, the concentrated PRP is placed directly at the follicular root level.

### Typical Treatment Plan
A series of 3 to 4 monthly sessions followed by quarterly maintenance ensures progressive hair density and strengthening.`,
  },
  {
    title: 'Low-Level Laser Hair Stimulation (LLLT)',
    slug: 'laser-hair-stimulation',
    category: 2, // Hair
    duration: '45 mins',
    display_order: 4,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1584297091622-af8e5bd80b13?auto=format&fit=crop&w=1000&q=80',
    short_description: 'FDA-cleared photobiomodulation therapy to oxygenate the scalp, improve micro-circulation, and boost hair thickness.',
    full_description: `Low-Level Laser Therapy (LLLT) is a pain-free, non-thermal light therapy that utilizes cold medical diodes at 655nm wavelength to invigorate mitochondrial activity in weakened hair cells.

- Increases ATP production and cellular respiration
- Enhances scalp vascularity, transporting essential nutrients directly to hair roots
- Ideal as a stand-alone therapy or synergistically combined with PRP for accelerated restoration.`,
  },
  {
    title: 'Triple-Wavelength Laser Hair Reduction',
    slug: 'laser-hair-reduction',
    category: 3, // Laser
    duration: '30-60 mins',
    display_order: 5,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=80',
    short_description: 'Gold-standard diode laser with ice-cooling technology for permanent, virtually pain-free hair reduction across all skin types.',
    full_description: `Experience the pinnacle of clinical laser hair removal. Our state-of-the-art triple-wavelength laser platform seamlessly merges 755nm Alexandrite, 808nm Diode, and 1064nm Nd:YAG energy to target hair follicles at varying structural depths.

### Why SkinGlow Laser Is Superior
- **Integrated Ice-Cooling Contact Tip**: Keeps the epidermal surface at a soothing 4°C, preventing thermal discomfort.
- **Safe for Fitzpatrick Types I to VI**: Optimized pulse parameters ensure safety on deeper Indian skin tones without risk of burns or hyperpigmentation.
- **Rapid Treatment Speed**: High-frequency in-motion delivery enables full legs or back coverage in under 40 minutes.`,
  },
  {
    title: 'Carbon Spectra Laser Toning (Hollywood Peel)',
    slug: 'carbon-spectra-toning',
    category: 3, // Laser
    duration: '45 mins',
    display_order: 6,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1000&q=80',
    short_description: 'Q-Switched Nd:YAG laser combined with liquid carbon lotion for intense pore tightening, oil control, and instant luminosity.',
    full_description: `Celebrated as the Hollywood Laser Peel, this procedure begins with an application of medical-grade nano-carbon lotion that binds deeply to oil and debris within pores.

When the Q-switched laser pulses over the skin, the carbon particles instantly vaporize, carrying away dead skin cells, shrinking enlarged pores, stimulating collagen remodeling, and evening out skin pigmentation. Zero downtime with instant red-carpet radiance.`,
  },
  {
    title: 'Botox & Dysport Dynamic Wrinkle Smoothing',
    slug: 'botox-wrinkle-smoothing',
    category: 4, // Anti-Aging
    duration: '30 mins',
    display_order: 7,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    short_description: 'Precision neuromodulator injections to soften forehead lines, crow’s feet, and frown lines while maintaining natural expression.',
    full_description: `Administered exclusively by certified dermatologists, our neuromodulator therapies subtly relax targeted hyperactive facial muscles that create stubborn expression lines.

### Key Treatment Areas
- **Horizontal Forehead Lines**: Smoothing worry creases for a serene, youthful upper face.
- **Glabellar Frown Lines (11s)**: Softening deep furrow lines between the brows.
- **Crow’s Feet**: Rejuvenating the delicate lateral eye contours.
- **Masseter Reduction**: Slimming the jawline and relieving nocturnal teeth grinding (bruxism).

Results emerge within 4 to 7 days, maintaining a refreshed, expressive appearance for 4 to 6 months.`,
  },
  {
    title: 'Hyaluronic Dermal Fillers & Facial Sculpting',
    slug: 'dermal-fillers-sculpting',
    category: 4, // Anti-Aging
    duration: '45-60 mins',
    display_order: 8,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=80',
    short_description: 'Premium cross-linked hyaluronic acid gels to restore lost mid-face volume, enhance cheekbones, and define lips.',
    full_description: `Using world-renowned FDA-approved hyaluronic acid matrices (Juvederm & Restylane), our aesthetic specialists restore youthfulness by replenishing lost facial structural support.

We adhere strictly to natural facial proportions — enhancing high cheek contours, softening nasolabial folds, sculpting crisp jawlines, or adding subtle hydration and contour to lips.`,
  },
  {
    title: 'CryoSculpt Non-Invasive Body Contouring',
    slug: 'cryosculpt-body-contouring',
    category: 5, // Body
    duration: '60 mins',
    display_order: 9,
    is_active: 1,
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    short_description: 'Targeted cryolipolysis fat cell freezing for stubborn subcutaneous deposits on the abdomen, flanks, and thighs.',
    full_description: `CryoSculpt harnesses controlled medical cooling (-9°C) to induce natural apoptosis (cell death) in stubborn subcutaneous fat cells without injuring surrounding skin, muscle, or nerve tissue.

Over the subsequent 6 to 12 weeks, your body’s lymphatic system naturally processes and permanently flushes away the crystalized fat cells, resulting in a visibly firmer, sculpted silhouette.`,
  },
];

export const seedTreatments = async () => {
  try {
    for (const treatment of initialTreatments) {
      await Treatment.findOrCreate({
        where: { slug: treatment.slug },
        defaults: treatment,
      });
    }
    logger.info(' Treatments seeded/verified successfully.');
  } catch (error) {
    logger.error('Error seeding treatments:', error);
  }
};
