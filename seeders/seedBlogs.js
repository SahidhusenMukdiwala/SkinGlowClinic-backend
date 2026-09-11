import { Blog } from '../app/models/index.js';
import { logger } from '../app/utils/logger.js';

const INITIAL_BLOGS = [
  {
    title: 'The Clinical Science Behind HydraFacial: Why Vortex Infusion Works',
    slug: 'clinical-science-behind-hydrafacial',
    cover_image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    content: `<h2>Understanding Hydradermabrasion Mechanisms</h2>
<p>Modern clinical dermatology has moved away from harsh manual extractions that disrupt the stratum corneum barrier. Instead, patented vortex-fusion technology combines simultaneous vacuum extraction with pressurized micro-droplet dermal saturation.</p>

<h3>Key Benefits for Fitzpatrick Types III–VI</h3>
<ul>
  <li><strong>Zero Barrier Damage:</strong> Unlike mechanical microdermabrasion crystals, gentle fluid vortex minimizes post-inflammatory hyperpigmentation (PIH).</li>
  <li><strong>Targeted Booster Penetration:</strong> Customized peptides and cross-linked hyaluronic acid penetrate up to 30% deeper into stratum corneum micro-channels.</li>
  <li><strong>Immediate Dewy Clarification:</strong> Dead keratinized corneocytes are painlessly aspirated without downtime.</li>
</ul>

<blockquote>"A healthy skin barrier requires regular cellular exfoliation without triggering the dermal inflammatory cascade." — Dr. Aisha Sharma, MD</blockquote>

<h3>Recommended Clinical Frequency</h3>
<p>For optimal barrier support and pore clarity, dermatologists recommend monthly sessions, particularly during seasonal climate transitions.</p>`,
    is_published: 1,
  },
  {
    title: 'PRP vs. Low-Level Laser Therapy: Choosing the Right Hair Regrowth Protocol',
    slug: 'prp-vs-low-level-laser-hair-regrowth',
    cover_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    content: `<h2>Combating Androgenetic Alopecia with Evidence-Based Science</h2>
<p>Follicular miniaturization is driven by DHT binding to androgen receptors on dermal papilla cells. Both Autologous Platelet-Rich Plasma (PRP) and Low-Level Laser Therapy (LLLT) present clinically proven non-surgical solutions.</p>

<h3>Platelet-Rich Plasma (PRP) Therapy</h3>
<p>PRP concentrates bioactive growth factors—specifically VEGF, PDGF, and FGF—derived from the patient's own autologous plasma. When micro-infused around weakened follicles, these growth factors stimulate neo-vascularization and transition telogen (resting) follicles into active anagen growth.</p>

<h3>Low-Level Laser Light Stimulation (655nm)</h3>
<p>Cold medical laser diodes stimulate mitochondrial cytochrome c oxidase, boosting ATP energy production directly within follicular stem cells. LLLT is 100% painless and serves as an exceptional synergistic maintenance protocol alongside PRP.</p>

<h3>The Dual Combination Protocol</h3>
<p>In clinical trials, patients undergoing 4 sessions of PRP paired with bi-weekly LLLT demonstrated a <strong>38% greater terminal hair count</strong> at 6 months compared to monotherapy.</p>`,
    is_published: 1,
  },
  {
    title: 'Debunking Anti-Aging Myths: Natural Neuromodulator Micro-Dosing Explained',
    slug: 'debunking-anti-aging-myths-neuromodulators',
    cover_image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1200&q=80',
    content: `<h2>The Philosophy of Natural Facial Architecture</h2>
<p>The biggest misconception surrounding aesthetic neurotoxin treatments is the fear of looking "frozen" or "emotionless." Modern clinical aesthetics focuses strictly on micro-dosing and precise anatomical muscular targeting.</p>

<h3>How Micro-Dosing Preserves Dynamic Emotion</h3>
<p>By administering calibrated micro-droplets directly into the hyperactive fibers of the frontalis, procerus, and orbicularis oculi muscles, we soften dynamic wrinkles while leaving baseline facial animation completely intact.</p>

<ul>
  <li><strong>Subtle Softening:</strong> Frown lines and forehead furrows are smoothed without dropping brow height.</li>
  <li><strong>Preventative Aging:</strong> Prevents shallow expression lines from etching into permanent dermal static scars.</li>
  <li><strong>Zero Downtime:</strong> The 15-minute lunchtime procedure leaves no visible traces.</li>
</ul>

<blockquote>"Great aesthetic medicine is invisible. People should notice that you look radiant, well-rested, and glowing—never that you have had a procedure done."</blockquote>`,
    is_published: 1,
  },
];

export const seedBlogs = async () => {
  try {
    const count = await Blog.count();
    if (count === 0) {
      logger.info(' Seeding default clinical blog articles...');
      await Blog.bulkCreate(INITIAL_BLOGS);
      logger.info(` Successfully seeded ${INITIAL_BLOGS.length} blog articles.`);
    }
  } catch (error) {
    logger.warn('Blog seeding error:', error.message);
  }
};
