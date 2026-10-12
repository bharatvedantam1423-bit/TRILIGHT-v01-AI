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
  image: string;
  imageAlt: string;
};

export const site = {
  name: 'TRL8 · Trilight',
  title: 'TRL8 (Trilight) · Build Physical AI at NIAT',
  description:
    'TRL8 is NxtWave’s funded, gated journey that takes a NIAT student’s Physical AI or robotics idea from a sketch to a qualified product real customers pay for. No fee. Grants up to ₹5L per team.',
  cta: 'Register your interest',
};

export const hero = {
  // Display line is the brand campaign "[Build what's] NEXT" from the guidelines.
  bracket: 'Build what’s',
  display: 'NEXT',
  headline: 'TRL8, Tri-Light. Take your Physical AI idea from a sketch to a product customers pay for.',
  // SIGN-OFF: ₹5L per team (PRD §12.8)
  facts: ['Open to every NIAT student', 'No fee', 'Grants up to ₹5L per team'],
};

export const whatIs = {
  kicker: 'What is TRL8',
  headline: 'Physical AI is AI with a body.',
  body: 'AI that senses the physical world, decides what to do, and acts on it: robots, drones, smart sensors, machines. TRL8 is NxtWave’s journey for NIAT students to build one, from first idea to a product real customers pay for.',
  scaleTitle: 'Why “TRL8”?',
  scaleBody:
    'NASA rates technology on a Technology Readiness Level (TRL) scale from 1 to 9. TRL 8 means a complete, qualified system. The program stops at 8, because TRL 9 is earned in the market, not inside a program.',
};

export const lights = {
  kicker: 'Three green lights',
  headline: 'Three lights. One real product.',
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
  headline: 'What we hold every team to.',
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
  problemsHeadline: 'Start with a problem you can go and see.',
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
  headline: 'From idea to object.',
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
      image: '/img/evo-1.webp', imageAlt: 'A pencil sketch of a drone on a notebook page',
    },
    {
      id: 'trl12', phase: 'Foundation', level: 'TRL 1–2', title: 'Idea',
      build: 'Pick a real problem, form a team of 3–5 and submit a proposal.',
      duration: null, grant: null,
      image: '/img/evo-1.webp', imageAlt: 'A pencil sketch of a drone on a notebook page',
    },
    {
      id: 'trl3', phase: 'Foundation', level: 'TRL 3', title: 'Model',
      build: 'A working simulation that proves the idea can work.',
      duration: null, grant: null,
      image: '/img/evo-2.webp', imageAlt: 'A glowing wireframe simulation model of a drone',
    },
    {
      id: 'trl4', phase: 'Foundation', level: 'TRL 4', title: 'Prototype',
      build: 'A breadboard that senses, decides and acts.',
      duration: null, grant: '₹30K',
      image: '/img/evo-3.webp', imageAlt: 'A rough prototype drone with exposed wires and a bare circuit board',
    },
    {
      id: 'trl5', phase: 'Execution', level: 'TRL 5', title: 'Proof of concept',
      build: 'Your prototype working at a real host site.',
      duration: null, grant: '₹70K',
      image: '/img/evo-3.webp', imageAlt: 'A rough prototype drone with exposed wires and a bare circuit board',
    },
    {
      id: 'trl6', phase: 'Execution', level: 'TRL 6', title: 'Golden sample',
      build: 'A refined unit in the hands of real users.',
      duration: null, grant: '₹1.5L',
      image: '/img/evo-4.webp', imageAlt: 'A finished white production drone with teal lights',
    },
    {
      id: 'trl7', phase: 'Execution', level: 'TRL 7', title: 'First customer',
      build: 'Your first paying customer.',
      duration: null, grant: '₹2.5L',
      image: '/img/evo-4.webp', imageAlt: 'A finished white production drone with teal lights',
    },
    {
      id: 'trl8', phase: 'Execution', level: 'TRL 8', title: 'Qualified product',
      build: 'Qualified, repeatable, sold. All three lights green.',
      duration: null, grant: null,
      image: '/img/evo-4.webp', imageAlt: 'A finished white production drone with teal lights',
    },
  ] satisfies Stage[],
};

export const doors = {
  kicker: 'Two ways in',
  headline: 'Start at the beginning, or prove you’re further along.',
  note: 'Both doors start with the same registration.',
  items: [
    {
      name: 'Standard Door',
      badge: 'Most students start here',
      for: 'For anyone with curiosity, with or without a team or an idea.',
      steps: ['Register your interest', 'Explorer, solo (4–6 weeks)', 'Form a team of 3–5', 'Submit your TRL 1–2 proposal'],
    },
    {
      name: 'Fast-Track Door',
      badge: 'TRL 4+ prototype',
      for: 'For teams that already have a working prototype at TRL 4 or above.',
      steps: ['Register your interest', 'Share your prototype evidence', 'One-time Fast-Track review', 'Enter at the level you prove'],
    },
  ],
};

export const value = {
  kicker: 'What you get',
  headline: 'Real money, real mentors, real hardware.',
  // SIGN-OFF: ₹5L per team and ₹3 Cr annual pool (PRD §12.8).
  big: [
    { value: '₹5L', label: 'in grants per team, at most', sub: 'Unlocked stage by stage as you clear each review.' },
    { value: '₹3 Cr', label: 'annual grant pool', sub: 'Set aside for TRL8 teams.' },
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
  kicker: 'How to register',
  headline: 'Register in under a minute.',
  steps: [
    { n: '1', name: 'Click Register', text: 'Tap “Register your interest” anywhere on this page.' },
    { n: '2', name: 'Log in', text: 'Use your NxtWave learning portal credentials. No new account, no form.' },
    { n: '3', name: 'Continue on the platform', text: 'Your interest is recorded and you continue on the TRL8 platform.' },
  ],
};

export const faq = [
  {
    q: 'Who can join?',
    a: 'Every NIAT student, from any campus, year or branch. You register with your NxtWave learning portal login.',
  },
  {
    q: 'Do I need a team or an idea?',
    a: 'No. Explorer is solo and helps you find a problem worth solving. You form a team of 3–5 at TRL 1–2. If you already have a working TRL 4+ prototype, use the Fast-Track Door.',
  },
  {
    q: 'Is there a fee?',
    a: 'No. TRL8 is free, optional and voluntary. There’s no fee and no academic credit; you move up when your evidence is ready.',
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
    q: 'What happens after I register?',
    a: 'You log in with your learning portal credentials, your interest is recorded, and you continue on the TRL8 platform, where Explorer, team formation and proposals live. If the platform isn’t open yet, you’ll see a confirmation and we’ll notify you about next steps.',
  },
  {
    q: 'I can’t log in. What now?',
    a: 'Use the same credentials you use for the NxtWave learning portal. If you’ve forgotten them, reset your password on the portal first. Still stuck? Reach out to the TRL8 team using the help contact below.',
  },
];

export const closing = {
  headline: 'Ready to build what’s next?',
  body: 'Registering takes under a minute with your learning portal login.',
  help: 'Need help? Ask your campus TRL8 coordinator',
};
