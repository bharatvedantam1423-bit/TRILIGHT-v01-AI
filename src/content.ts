/**
 * Single source of truth for every public claim on the page.
 *
 * PRD §15: grant amounts, the ₹3 Cr pool, durations and GRIT Miles must be
 * signed off before launch. Anything marked SIGN-OFF below is a value taken
 * from the PRD or the Figma outline that still needs program approval.
 * Edit here, rebuild, and every section updates.
 */

export type Stage = {
  id: string;
  phase: 'Pre-program' | 'Foundation' | 'Execution';
  level: string;
  title: string;
  build: string;
  /** Indicative only. null = not published yet. */
  duration: string | null;
  /** null = no grant at this stage. */
  grant: string | null;
  /** Describes the stage's blueprint figure (src/blueprint/ladder.ts). */
  imageAlt: string;
};

export const site = {
  name: 'Trilight',
  title: 'Trilight · Turn your ideas into real-world products',
  description:
    'With Trilight, take your hardware, robotics, or Physical AI idea from concept to a real-world product, and work towards getting your first paying customer. Grants up to ₹5 Lakh per team.',
  cta: 'Join the Program',
};

// Copy: "TRILIGHT | WEBSITE COPY" doc. Where the doc offers two headlines
// ("… or …"), the first is used and the alternative is kept as `alt`.
export const hero = {
  headline: 'Turn Your Ideas Into Real-world Products',
  alt: 'Take Your Idea All the Way to the Real World',
  sub: 'With Trilight, take your hardware, robotics, or Physical AI idea from concept to a real-world product, and work towards getting your first paying customer.',
  // SIGN-OFF: ₹5L per team (PRD §12.8)
  stats: [
    { value: 'Up to ₹5 Lakh', label: 'Grant per team' },
    { value: '8', label: 'Stages' },
    { value: 'April 2027', label: 'Demo Day' },
  ],
};

export const whatIs = {
  kicker: 'What is Trilight',
  headline: 'Physical AI is AI with a body.',
  body: 'AI that senses the physical world, decides what to do, and acts on it: robots, drones, smart sensors, machines. Trilight is NxtWave’s journey for NIAT students to build one, from first idea to a product real customers pay for.',
  scaleTitle: 'Why TRL 8?',
  scaleBody:
    'NASA rates technology on a Technology Readiness Level (TRL) scale from 1 to 9. TRL 8 means a complete, qualified system. The program stops at 8, because TRL 9 is earned in the market, not inside a program.',
};

export const lights = {
  kicker: 'Why it’s called Trilight',
  headline: 'The Three Forces that Power TRILIGHT',
  body: 'You reach TRL 8 when all three lights are green. That is what “done” means here.',
  items: [
    { n: '01', name: 'Build', text: 'An outside team can build a second unit from your SOP, BOM and QA checks.' },
    { n: '02', name: 'Test', text: 'A complete, qualified system that holds up in the field, not just on your bench.' },
    { n: '03', name: 'Deploy', text: 'Multiple paying customers, or a signed contract to scale.' },
  ],
};

/**
 * Student projects (PRD §12.4). Add Makers Conclave media here: poster is an
 * image path in /public, video is optional (mp4/webm, keep under ~4 MB).
 * While the list is empty the section shows an honest "coming soon" panel.
 */
export const projects: { title: string; team: string; level: string; poster: string; video?: string }[] = [];

export const commitments = {
  kicker: 'Our three commitments',
  headline: 'Fundamentals That Matter While You Build',
  items: [
    {
      n: '01',
      name: 'Mandatory embodiment',
      text: 'Every project must close the sense–decide–act loop in the real world. If it doesn’t read the world and do something about it, it isn’t Physical AI yet.',
      tag: 'SENSE → DECIDE → ACT',
    },
    {
      n: '02',
      name: 'Evidence-gated funding',
      text: 'Money follows proof. Each stage unlocks only when you clear its Technology Readiness Review (TRR) with evidence. Fail, fix, resubmit.',
      tag: 'TRR · EVIDENCE',
    },
    {
      n: '03',
      name: 'Real problems, real customers',
      text: 'Start with a problem you can go and see, and finish with people who pay for the fix.',
      tag: 'FIELD · CUSTOMER',
    },
  ],
  problemsKicker: 'Problems around you',
  problemsHeadline: 'Fix the Problems Hiding in Plain Sight',
  problemsAlt: 'You are Surrounded by Problems, Spot One & Fix It!',
  problems: [
    {
      image: '/img/farm.webp',
      alt: 'A farmer watering dry, cracked soil with a pipe while a small soil sensor stands in the ground',
      label: 'IRRIGATION',
      reading: 'BY GUESSWORK',
      problem: 'Farmers water by guesswork and lose crop.',
      idea: 'A soil sensor that says when to irrigate.',
    },
    {
      image: '/img/clinic.webp',
      alt: 'A nurse checking a patient’s vitals by hand in a small clinic',
      label: 'VITALS',
      reading: 'BY HAND',
      problem: 'Vitals checked by hand, every hour.',
      idea: 'A monitor that flags who needs help.',
    },
    {
      image: '/img/factory.webp',
      alt: 'An industrial motor and pump on a factory floor with a small sensor clamped to it',
      label: 'BEARING',
      reading: 'VIBRATION ↑',
      problem: 'Machines fail with no warning.',
      idea: 'A sensor that predicts the breakdown.',
    },
  ],
};

export const ladder = {
  kicker: 'How it works · The ladder',
  headline: 'See How Far Your Ideas Can Go',
  alt: 'Earn Your Way to a Real Product',
  body: 'Every step up is a Technology Readiness Review. Clear it with evidence and the next level, and its grant, unlocks.',
  // SIGN-OFF: per-stage grants (Figma outline; they sum to the PRD's ₹5L cap),
  // Explorer duration (PRD §6) and total length (PRD §12.6).
  total: 'About 1–2 years from first idea to TRL 8, at your own pace.',
  footnote:
    'Durations are indicative, not promises. Grants unlock as you enter TRL 4 to 7, up to ₹5L per team, paid to vendors or reimbursed against invoices, never as cash.',
  gritMiles: 'GRIT Miles at every stage · updated values coming soon',
  stages: [
    {
      id: 'explorer', phase: 'Pre-program', level: 'Explorer', title: 'Learn the basics',
      build: 'Solo modules on sensing, AI and hardware. Find a problem worth solving.',
      duration: '4–6 weeks', grant: null,
      imageAlt: 'Blueprint of a parts tray: a chip, LEDs, capacitors, buttons and a small dev board',
    },
    {
      id: 'trl12', phase: 'Foundation', level: 'TRL 1–2', title: 'Idea',
      build: 'Pick a real problem, form a team of 3–5 and submit a proposal.',
      duration: null, grant: null,
      imageAlt: 'Pencil sketch of a sensor node on graph paper, with a pencil beside it',
    },
    {
      id: 'trl3', phase: 'Foundation', level: 'TRL 3', title: 'Model',
      build: 'A working simulation that proves the idea can work.',
      duration: null, grant: null,
      imageAlt: 'Wireframe simulation model of the sensor node, with dimensions',
    },
    {
      id: 'trl4', phase: 'Foundation', level: 'TRL 4', title: 'Prototype',
      build: 'A breadboard that senses, decides and acts.',
      duration: null, grant: '₹30K',
      imageAlt: 'Blueprint of a breadboard prototype: a dev board, a sensor and jumper wires',
    },
    {
      id: 'trl5', phase: 'Execution', level: 'TRL 5', title: 'Proof of concept',
      build: 'Your prototype working at a real host site.',
      duration: null, grant: '₹70K',
      imageAlt: 'Blueprint of a custom circuit board in an open enclosure, wired to a soil probe',
    },
    {
      id: 'trl6', phase: 'Execution', level: 'TRL 6', title: 'Golden sample',
      build: 'A refined unit in the hands of real users.',
      duration: null, grant: '₹1.5L',
      imageAlt: 'Blueprint of the finished sensor node: closed enclosure, antenna and status light',
    },
    {
      id: 'trl7', phase: 'Execution', level: 'TRL 7', title: 'First customer',
      build: 'Your first paying customer.',
      duration: null, grant: '₹2.5L',
      imageAlt: 'Blueprint of the sensor node beside its shipping carton and a paid invoice',
    },
    {
      id: 'trl8', phase: 'Execution', level: 'TRL 8', title: 'Qualified product',
      build: 'Qualified, repeatable, sold. All three lights green.',
      duration: null, grant: null,
      imageAlt: 'Blueprint of three qualified sensor nodes on a test rack, all status lights on',
    },
  ] satisfies Stage[],
};

export const doors = {
  kicker: 'Two ways in',
  headline: 'NIATians, Find Your Way Into TRILIGHT',
  note: 'Both doors start when you join the program.',
  items: [
    {
      name: 'Standard Door',
      badge: 'Most students start here',
      points: ['Learn the basics of hardware and AIoT', 'Clear checkpoints'],
      note: 'Your score in the evaluation decides your entry.',
    },
    {
      name: 'Fast-Track Door',
      badge: 'Working prototype',
      points: ['Showcase your working prototype and get a direct entry to the program'],
      note: null,
    },
  ],
};

export const value = {
  kicker: 'What it really takes',
  headline: 'Know What It Takes to Build Beyond Prototype',
  body: 'Your first prototype will probably fail. So will the third. Trilight doesn’t reward the best pitch; it rewards the team that keeps fixing, testing and showing evidence until the thing works in the real world.',
  // SIGN-OFF: ₹5L per team and ₹3 Cr annual pool (PRD §12.8).
  big: [
    { value: '₹5L', label: 'in grants per team, at most', sub: 'Unlocked stage by stage as you clear each review.' },
    { value: '₹3 Cr', label: 'annual grant pool', sub: 'Set aside for Trilight teams.' },
  ],
  items: [
    { name: 'GRIT Miles', text: 'Earned at every stage you clear. Updated values coming soon.' },
    { name: 'Mentors', text: 'Mentors who review your work as you build.' },
    { name: 'Lab access', text: 'Labs to build, break and test your hardware.' },
    // SIGN-OFF: competition names need permission before use (PRD §15).
    { name: 'Competition support', text: 'Support for iDEX, SIH, NIDAR, IRoC-U and Mehar Baba.' },
    { name: 'Internships & placements', text: 'Real shipped work that strengthens your profile.' },
    { name: 'No fee, ever', text: 'Optional, voluntary and self-paced. ₹0 to join.' },
  ],
};

export const register = {
  kicker: 'Who can join',
  headline: 'Start Building on Your Terms at Your Pace',
  steps: [
    { n: '1', name: 'Any batch, any branch', text: 'Every NIAT student can join. Log in with your NIAT learning portal account.' },
    { n: '2', name: 'Solo first, then a team', text: 'Explore alone, then form a team of 3–5 at TRL 1–2.' },
    { n: '3', name: 'No fee, no deadlines', text: 'Optional and self-paced. Move up when your evidence is ready.' },
  ],
};

export const faq = [
  {
    q: 'Who can join?',
    a: 'Every NIAT student, from any campus, year or branch. You join with your NxtWave learning portal login.',
  },
  {
    q: 'Do I need a team or an idea?',
    a: 'No. Explorer is solo and helps you find a problem worth solving. You form a team of 3–5 at TRL 1–2. If you already have a working TRL 4+ prototype, use the Fast-Track Door.',
  },
  {
    q: 'Is there a fee?',
    a: 'No. Trilight is free, optional and voluntary. There’s no fee and no academic credit; you move up when your evidence is ready.',
  },
  {
    q: 'Do I need prior electronics experience?',
    a: 'No. Explorer covers the basics of sensing, AI and hardware before you commit to a project.',
  },
  {
    q: 'How are grants paid?',
    a: 'Grants unlock as you enter TRL 4 to 7, up to ₹5L per team. They are paid to vendors or reimbursed against invoices, never as cash.',
  },
  {
    q: 'What happens at a Technology Readiness Review (TRR)?',
    a: 'A review panel checks your evidence for the level. Clear it and the next level, and its grant, unlocks. If not, you fix, test and resubmit.',
  },
  {
    q: 'Who owns my project’s IP?',
    a: 'The IP, equity and revenue-share policy is still being finalised. It will be shared in full before any team is asked to agree to anything.',
  },
  {
    q: 'What happens after I join?',
    a: 'You log in with your learning portal credentials, your interest is recorded, and you continue on the Trilight platform, where Explorer, team formation and proposals live. If the platform isn’t open yet, you’ll see a confirmation and we’ll notify you about next steps.',
  },
  {
    q: 'I can’t log in. What now?',
    a: 'Use the same credentials you use for the NxtWave learning portal. If you’ve forgotten them, reset your password on the portal first. Still stuck? Reach out to the Trilight team using the help contact below.',
  },
];

export const faqHead = {
  headline: 'Have Questions Before You Build?',
};

export const closing = {
  headline: 'Come, Make Your Ideas Real with TRILIGHT',
  body: 'Joining takes under a minute with your learning portal login.',
  help: 'Need help? Ask your campus Trilight coordinator',
};

/**
 * Hero blueprint: the exploded hardware core and its callouts (top layer
 * first). `side` is where the callout sits in the exploded view.
 */
export const anatomy = {
  kicker: 'Anatomy of a build',
  headline: 'Every real product is built layer by layer.',
  figureLabel:
    'An isometric blueprint of a hardware core, exploded into six layers: a protective shield, the processing die, a signal routing grid, a neural logic array, a power distribution layer and the hardware interface base.',
  layers: [
    { id: 'shield', side: 'l', name: 'Protective Core Shield', text: 'A durable casing that protects what’s inside, built to survive the field, not just the bench.' },
    { id: 'die', side: 'r', name: 'Processing Matrix', text: 'The compute layer that turns sensor readings into decisions in milliseconds.' },
    { id: 'routing', side: 'r', name: 'Signal Routing Grid', text: 'High-density copper carrying signals between sensors, compute and memory.' },
    { id: 'logic', side: 'l', name: 'Neural Logic Array', text: 'AI that runs on the device itself: parallel inference at the edge.' },
    { id: 'power', side: 'r', name: 'Power Distribution Layer', text: 'Steady, efficient power so it works the same on day 300 as on day one.' },
    { id: 'base', side: 'l', name: 'Hardware Interface Base', text: 'Where your build meets the real world: sensors, motors and the rest of the system.' },
  ],
};

/** Fig. 2 · the sense → decide → act board in "What is Trilight". */
export const loop = {
  figureLabel:
    'An isometric blueprint of a circuit board: an optical sensor on a header reads the world, a microcontroller decides, and a driver chip turns a geared motor. Signals run along the copper from sense to decide to act.',
  tags: [
    { id: 'sense', name: 'Sense', text: 'Reads the world' },
    { id: 'decide', name: 'Decide', text: 'Runs the logic' },
    { id: 'act', name: 'Act', text: 'Moves something real' },
  ],
};
