/**
 * Single source of truth for every word on the page.
 *
 * Sources, and nothing else:
 *  - Headlines: the "TRILIGHT | WEBSITE COPY" doc. Where it offers two
 *    headlines ("… or …"), the one marked green in the doc is used and the
 *    other is kept as `alt`. Headlines are used verbatim.
 *  - Section bodies, cards and stats: the Figma low-fidelity skeleton the copy
 *    doc's section images were taken from ("Website v3 (Physical AI)").
 *  - FAQ answers and grant figures: the TRL8 program document
 *    (docs/TRL8-program.md).
 * Edit here, rebuild, and every section updates.
 */

export const site = {
  name: 'Trilight',
  title: 'Trilight · Turn Your Ideas Into Real-world Products',
  description:
    'With Trilight, take your hardware, robotics, or Physical AI idea from concept to a real-world product, and work towards getting your first paying customer.',
  cta: 'Join the Program',
};

/** Top bar: one link beside the call to action. */
export const nav = [{ href: '#demo-day', label: 'Demo Day' }];

/** Footer links (labels from the Figma skeleton header). */
export const footerNav = [
  { href: '#ladder', label: 'The ladder' },
  { href: '#loop', label: 'The loop' },
  { href: '#demo-day', label: 'Demo Day' },
  { href: '#faq', label: 'FAQ' },
];

/* 1 · Hero ------------------------------------------------------------- */
export const hero = {
  headline: 'Turn Your Hardware Ideas Into Real-world Products',
  alt: 'Take Your Idea All the Way to the Real World',
  figureLabel:
    'An isometric blueprint of a dense circuit board, its components standing like a city round an empty socket. A hand with tweezers places the Trilight chip in the socket and the board powers up.',
  stats: [
    { value: 'Up to ₹5 Lakh', label: 'Grant Per Team' },
    { value: '₹3 Cr', label: 'Grant Pool' },
    { value: '8', label: 'Stages' },
    { value: 'April 2027', label: 'Demo Day' },
  ],
};

/* 2 · The ladder --------------------------------------------------------- */
export type Stage = {
  id: string;
  phase: 'Pre-entry' | 'Foundation' | 'Execution';
  level: string;
  title: string;
  /** What a team builds or proves to clear the stage (program doc, Table 1). */
  proof: string;
  /** Indicative time (program doc, "How long it takes"). */
  time: string;
  /** Grant unlocked on entry (program doc, Table 2). */
  grant: string | null;
  /** Drawing fallback (src/blueprint/journey.ts) and the photo's alt text; the photo itself is /public/img/ladder/<id>.webp. */
  figure: { kind: 'drawing' | 'photo'; src: string; label: string };
};

export const ladder = {
  kicker: 'The ladder',
  headline: 'Earn Your Way to a Real Product',
  alt: 'See How Far Your Ideas Can Go',
  stages: <Stage[]>[
    { id: 'explorer', phase: 'Pre-entry', level: 'Explorer', title: 'Learn the basics',
      proof: 'Learn Applied IoT, clear assessments, solo.',
      time: '4–6 weeks', grant: null,
      figure: { kind: 'drawing', src: 'learn', label: 'An open notebook with hand-drawn circuit sketches and a sense, decide, act flow, beside a starter kit of a microcontroller, an ultrasonic sensor, LEDs and resistors' } },
    { id: 'trl12', phase: 'Foundation', level: 'TRL 1–2', title: 'Idea',
      proof: 'Form a team of 3–5, pick a real problem and submit a proposal that passes the AI-scored evaluation and human critic.',
      time: '4–6 weeks', grant: null,
      figure: { kind: 'drawing', src: 'idea', label: 'A team sketching a soil-sensor concept on paper, with sticky notes and a photo of dry farmland' } },
    { id: 'trl3', phase: 'Foundation', level: 'TRL 3', title: 'Model',
      proof: 'Deep dive and learn hardware concepts, and build a working simulation, 3D model and software that prove the idea can work.',
      time: '6–10 weeks', grant: null,
      figure: { kind: 'photo', src: '', label: 'A laptop showing a 3D CAD model of the sensor enclosure, exploded, beside its thermal simulation' } },
    { id: 'trl4', phase: 'Foundation', level: 'TRL 4', title: 'Prototype',
      proof: 'A breadboard prototype that closes the sense–decide–act loop, tested in the lab.',
      time: '2–3 months', grant: '₹30K',
      figure: { kind: 'photo', src: '', label: 'A breadboard prototype with a soil probe, microcontroller and small display, being tested with a multimeter' } },
    { id: 'trl5', phase: 'Execution', level: 'TRL 5', title: 'Proof of concept',
      proof: 'Validated at a real host site: your circuit on Zero PCB, inside an enclosure.',
      time: '3–4 months', grant: '₹70K',
      figure: { kind: 'photo', src: '', label: 'The hand-soldered circuit in an open enclosure on farm soil at dusk, wired to its soil probe' } },
    { id: 'trl6', phase: 'Execution', level: 'TRL 6', title: 'Golden sample',
      proof: 'A custom PCB and enclosure, tested with real users: 5 for B2B, 20 for B2C.',
      time: '3–6 months', grant: '₹1.5L',
      figure: { kind: 'photo', src: '', label: 'Two golden-sample units: a custom green PCB in an open enclosure beside a closed one, with the soil probe' } },
    { id: 'trl7', phase: 'Execution', level: 'TRL 7', title: 'First customer',
      proof: 'A beta product built to certification standards, and a customer who pays for it.',
      time: '3–6 months', grant: '₹2.5L',
      figure: { kind: 'photo', src: '', label: 'The finished sensor exploded into its parts: cover, gasket, battery, PCB, probe and base' } },
    { id: 'trl8', phase: 'Execution', level: 'TRL 8', title: 'Qualified product',
      proof: 'Everything combined: a qualified system, multiple paying customers, and a build an outside team can repeat.',
      time: '6–9 months', grant: 'Tri-Light',
      figure: { kind: 'photo', src: '', label: 'A row of finished soil sensors on a bench, one being tested, with packed boxes ready to ship' } },
  ],
  footnote:
    'Grants unlock as you enter TRL 4 to 7, up to ₹5L per team. Paid to vendors or reimbursed against invoices, never as cash. Times are indicative.',
  more: 'Full Journey',
  /** The Full Journey button opens the student journey PDF once it's in public/docs/; until then, the full-details page. */
  journeyPdf: '/docs/trilight-student-journey.pdf',
  moreHref: '/program.html',
};

/* 3 · Fundamentals (the loop) ------------------------------------------- */
export const loop = {
  kicker: 'The loop every project must close',
  headline: 'Fundamentals That Matters While You Build',
  items: [
    { id: 'sense', n: '01', name: 'Sense', text: 'Your own hardware reads the world. Sensing can’t be borrowed.',
      figureLabel: 'A smoke detector on a ceiling, its cover open, drawing smoke into its sensing chamber as its status light glows' },
    { id: 'decide', n: '02', name: 'Decide', text: 'AI decides, on the device or in the cloud. Your call.',
      figureLabel: 'The smoke detector’s circuit board, signals glowing from the smoke sensor into its microcontroller' },
    { id: 'act', n: '03', name: 'Act', text: 'Move something, or tell someone exactly what to do.',
      figureLabel: 'A ceiling sprinkler spraying water onto a fire while the detector’s alarm light glows and a phone lights up with an emergency call' },
  ],
};

/* 4 · The three forces --------------------------------------------------- */
export const lights = {
  kicker: 'Why it’s called Trilight',
  headline: 'The Three Forces that Power TRILIGHT',
  items: [
    { id: 'build', n: '01', name: 'Build', text: 'An outside team can build a second unit from your SOP, BOM and QA checks.',
      figureLabel: 'A flight-controller board beside its identical second unit, with the BOM, SOP and QA sheet' },
    { id: 'test', n: '02', name: 'Test', text: 'A complete, qualified system that holds up in the field, not just on your bench.',
      figureLabel: 'A robotic rover running on a roller test rig, cabled to a test box showing its trace' },
    { id: 'deploy', n: '03', name: 'Deploy', text: 'Multiple paying customers, or a signed contract to scale.',
      figureLabel: 'A delivery drone lowering a parcel onto a landing pad, beside parcels already delivered' },
  ],
};

/* 5 · What it takes ------------------------------------------------------ */
export const value = {
  kicker: 'What it really takes',
  headline: 'Know What It Takes to Build Beyond Prototype',
  lines: ['Hardware is hard.', 'That’s the point.'],
  body: 'Your first prototype will probably fail. So will the third. Trilight doesn’t reward the best pitch; it rewards the team that keeps fixing, testing and showing evidence until the thing works in the real world.',
  figureLabel: 'Blueprint of a custom circuit board in an open enclosure at a field site, wired to a soil probe',
  stats: [
    { value: '1–2 Year', label: 'from first idea to TRL 8, at your own pace' },
    { value: '8', label: 'stages, cleared by a TRR Committee' },
    { value: 'Unlimited', label: 'retries. Fail, fix, resubmit.' },
    { value: '15 days', label: 'between team self-reviews' },
    { value: '2×', label: 'mentor meetings a month (virtual)' },
    { value: '₹5,00,000', label: 'max grant per team' },
  ],
};

/* 6 · Doors --------------------------------------------------------------- */
export const doors = {
  headline: 'NIATians, Find Your Way Into TRILIGHT',
  items: [
    {
      name: 'Standard Door',
      points: ['Learn Applied IoT', 'Clear assessments'],
      note: 'The score against your evaluation will decide your entry',
      // Photos in /public/img/doors/; the drawing shows if one is missing.
      image: 'doors/standard', figure: 'idea',
      imageAlt: 'A student soldering a small sensor board at a lab bench, with a breadboard, sensor modules and a multimeter around her',
    },
    {
      name: 'Fastrack Door',
      points: ['Showcase your working prototype and get a direct entry to the program'],
      note: null,
      image: 'doors/fasttrack', figure: 'prototype',
      imageAlt: 'Three students presenting their working drone prototype and its live telemetry to a reviewer',
    },
  ],
};

/* 7 · Who can join -------------------------------------------------------- */
export const register = {
  kicker: 'Who can join',
  headline: 'Start Building on Your Terms at Your Pace',
  steps: [
    { name: 'Any batch, any branch', text: 'Log in with your NIAT learning portal account.' },
    { name: 'Solo first, then a team', text: 'Explore alone, then form a team of 3–5 at TRL 1–2.' },
    { name: 'No fee, no deadlines', text: 'Optional and self-paced. Move up when your evidence is ready.' },
  ],
};

/* 8 · Problems ------------------------------------------------------------ */
export const problems = {
  kicker: 'Problems around you',
  headline: 'You are Surrounded by Problems, Spot One & Fix It!',
  alt: 'Fix the Problems Hiding in Plain Sight',
  items: [
    {
      image: '/img/problems/farm.webp',
      alt: 'A farmer watering dry, cracked soil with a pipe while a small soil sensor stands in the ground',
      label: 'IRRIGATION',
      reading: 'BY GUESSWORK',
      problem: 'Farmers water by guesswork and lose crop.',
      idea: 'A soil sensor that says when to irrigate.',
    },
    {
      image: '/img/problems/clinic.webp',
      alt: 'A nurse checking a patient’s vitals by hand in a small clinic',
      label: 'VITALS',
      reading: 'BY HAND',
      problem: 'Vitals checked by hand, every hour.',
      idea: 'A monitor that flags who needs help.',
    },
    {
      image: '/img/problems/factory.webp',
      alt: 'An industrial motor and pump on a factory floor with a small sensor clamped to it',
      label: 'BEARING',
      reading: 'VIBRATION ↑',
      problem: 'Machines fail with no warning.',
      idea: 'A sensor that predicts the breakdown.',
    },
  ],
};

/* 9 · FAQ ----------------------------------------------------------------- */
/** Questions from the Figma skeleton; answers from docs/TRL8-program.md §10. */
export const faq = {
  headline: 'Have Questions Before You Build?',
  note: 'Still unsure? Ask the program team from your dashboard after you join.',
  items: [
    {
      q: 'Do I need a hardware idea to join?',
      a: 'No. Take a problem from the TRILIGHT problem bank or bring your own. It must solve a real problem and include real physical sensing.',
    },
    {
      q: 'Do I need prior electronics experience?',
      a: 'No. The Standard Door starts with Applied IoT.',
    },
    {
      q: 'Is there a fee?',
      a: 'Participation is optional and there is no fee.',
    },
    {
      q: 'How are grants paid?',
      a: 'A grant unlocks each time your team enters a funded stage: ₹30,000 at TRL 4, ₹70,000 at TRL 5, ₹1,50,000 at TRL 6 and ₹2,50,000 at TRL 7. It is spent through the program against invoices, not paid into your account.',
    },
    {
      q: 'What happens at a Technology Readiness Review?',
      a: 'A panel examines your team’s evidence and decides whether the stage is cleared. If not, you get written feedback, fix what is missing and present again at the next monthly review.',
    },
    {
      q: 'Who presents at Demo Day?',
      a: 'Every stage has something worth showing, from a breadboard prototype at TRL 4 to a product a customer already pays for at TRL 7, so a team does not have to be finished to take part. Each team decides what it shows, because it owns the work.',
    },
    {
      q: 'Can I keep working on my project afterwards?',
      a: 'Yes. TRL 9 is earned in the market, over years, after a team leaves the program. TRILIGHT takes a team to the point where that test can begin.',
    },
  ],
};

/* 10 · CTA and the program finale ---------------------------------------- */
export const closing = {
  headline: 'Come, Make Your Ideas Real with TRILIGHT',
  // Video slot: drop /public/video/closing.mp4 (and closing-poster.webp) in and
  // it replaces the drawn robot-arm scene.
  video: 'closing',
  sceneLabel: 'Two robot arms on a workbench either side of a glass block carrying the Trilight logo; the left arm lights it with a teal beam.',
};

export const finale = {
  title: ['Program', 'Finale'],
  kicker: 'Demo Day',
  month: 'April',
  year: '2027',
  note: 'Date, venue and format to be announced.',
  body: 'Show what you built to mentors, industry and investors. Live demos of working hardware, not slides.',
  cards: [
    { name: 'Live demos', text: 'Your prototype, running in front of the room.' },
    { name: 'Meet the people', text: 'Industry partners, investors and the incubation team.' },
  ],
  cta: 'Join now to be ready',
};

export const footer = {
  line: 'An NIAT Initiative · © 2026',
};
