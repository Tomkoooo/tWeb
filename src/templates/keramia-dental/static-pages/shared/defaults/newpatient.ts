import type { CampaignPageContent } from "../schema"
import {
  KERAMIA_ADDRESS_EN,
  KERAMIA_PHONE,
  KERAMIA_PROMO_PERIOD_EN,
} from "../../../lib/constants"

export const newpatientDefault: CampaignPageContent = {
  locale: "en",
  hero: {
    badge: KERAMIA_PROMO_PERIOD_EN,
    title: "Your complete first visit, for half the price",
    subtitle:
      "New to Kerámia Dental? Get to know our English-speaking team and modern clinic in Székesfehérvár — risk-free. Your package includes a full examination, professional tartar removal, digital panoramic X-ray and personalised oral-hygiene advice.",
    promoHighlight: "30,000 Ft",
    promoSubtext: "instead of 55,000 Ft",
    ctaLabel: "Book my visit",
    phone: KERAMIA_PHONE,
    location: KERAMIA_ADDRESS_EN,
    image: "",
  },
  benefits: [
    {
      title: "English-speaking care",
      description: "Our highly trained doctors speak fluent English — nothing gets lost in translation.",
    },
    {
      title: "A complete first visit",
      description: "Exam, professional cleaning, panoramic X-ray and hygiene advice in one appointment.",
    },
    {
      title: "Advanced digital imaging",
      description: "Low-radiation digital panoramic X-ray with tenth-of-a-millimetre precision.",
    },
    {
      title: "Western-standard care",
      description: "Latest digital technology and premium materials in a calm, family-friendly clinic.",
    },
  ],
  offer: {
    eyebrow: "THE OFFER",
    title: "The New Patient Special",
    body: "Designed for the international community in Székesfehérvár, this is the simplest way to start. In one relaxed, English-speaking appointment you get a complete picture of your oral health — with no obligation to book further treatment.",
    bullets: [
      "Full oral examination & personal consultation",
      "Professional tartar removal (ultrasonic scaling)",
      "Digital panoramic X-ray",
      "Personalised oral-hygiene advice",
      "All in a single, relaxed appointment — with an English-speaking dentist",
    ],
    discounts: [
      { value: "55,000 Ft", label: "Regular price" },
      { value: "30,000 Ft", label: "New-patient price" },
    ],
    footnotes: [
      "Available June 1 – August 31, 2026.",
      "The special price is valid for online bookings only.",
      "Cannot be combined with other offers.",
    ],
  },
  process: {
    eyebrow: "WHAT'S INCLUDED",
    title: "Four steps, one appointment",
    subtitle: "Everything in your New Patient Special — all for 30,000 Ft.",
    steps: [
      {
        number: "STEP 1",
        title: "Examination & consultation",
        description: "A thorough oral examination and relaxed, English-speaking consultation.",
        duration: "INCLUDED",
      },
      {
        number: "STEP 2",
        title: "Professional tartar removal",
        description: "Gentle ultrasonic scaling removes plaque and tartar.",
        duration: "INCLUDED",
      },
      {
        number: "STEP 3",
        title: "Digital panoramic X-ray",
        description: "A single low-radiation scan of teeth, roots and jawbone.",
        duration: "INCLUDED",
      },
      {
        number: "STEP 4",
        title: "Oral-hygiene advice",
        description: "Personalised tips to keep your smile healthy between visits.",
        duration: "INCLUDED",
      },
    ],
  },
  services: {
    eyebrow: "HOW IT WORKS",
    title: "From booking to a clear plan",
    items: [
      {
        badge: "01",
        title: "Book online",
        description: "Request your appointment using the form or by phone. Special price applies to online bookings.",
        ctaLabel: "Book my visit →",
      },
      {
        badge: "02",
        title: "Your complete check-up",
        description: "Full examination, tartar removal, panoramic X-ray and hygiene advice — about 45–60 min.",
        ctaLabel: "Book my visit →",
      },
      {
        badge: "03",
        title: "Your results, explained",
        description: "We go through findings together with transparent pricing — no pressure to commit.",
        ctaLabel: "Book my visit →",
      },
    ],
  },
  beforeAfter: {
    eyebrow: "",
    title: "",
    beforeLabel: "",
    afterLabel: "",
    caption: "",
  },
  results: {
    eyebrow: "WHY KERÁMIA DENTAL",
    title: "Care you can understand, and trust",
    stats: [],
    items: [
      {
        category: "COMMUNICATION",
        title: "Fluent English",
        description: "Our doctors speak several languages — you always understand your care.",
      },
      {
        category: "STANDARDS",
        title: "Western-standard dentistry",
        description: "Latest digital technology and premium materials.",
      },
      {
        category: "INTRODUCTION",
        title: "Risk-free first visit",
        description: "A low-cost way to get to know our clinic before larger treatment.",
      },
      {
        category: "DIAGNOSTICS",
        title: "State-of-the-art imaging",
        description: "CBCT-capable, low-radiation digital panoramic X-ray.",
      },
    ],
  },
  why: {
    eyebrow: "WHY KERÁMIA DENTAL",
    title: "A warm, family-friendly atmosphere",
    tip: "",
    body: "“A smile is the sparkle of the soul.” We combine a warm atmosphere with modern procedures — and make sure every patient feels informed and at ease.",
    bullets: [
      "Central location in Székesfehérvár, easy to reach.",
      "Warm, family-friendly atmosphere built on trust.",
      "State-of-the-art diagnostics including digital panoramic X-ray.",
      "Highly trained, multilingual dental team.",
    ],
  },
  faq: {
    eyebrow: "FREQUENTLY ASKED QUESTIONS",
    title: "Good to know before you book",
    items: [
      {
        question: "What is included in the New Patient Special?",
        answer:
          "Full oral examination, professional tartar removal, digital panoramic X-ray and personalised hygiene advice — all for 30,000 Ft instead of 55,000 Ft.",
      },
      {
        question: "Do your dentists speak English?",
        answer: "Yes. Our doctors are highly trained and speak fluent English.",
      },
      {
        question: "Why is it so affordable?",
        answer:
          "It is a genuine introduction offer for new patients, available June–August 2026 for online bookings.",
      },
      {
        question: "How long does the visit take?",
        answer: "About 45–60 minutes for the complete package.",
      },
      {
        question: "Is the panoramic X-ray safe?",
        answer: "Yes. Our digital system uses low radiation with high precision.",
      },
      {
        question: "Am I obliged to continue treatment afterwards?",
        answer: "No. This is a risk-free introduction with no obligation.",
      },
      {
        question: "How do I get the special price?",
        answer: "Book online via the form on this page during the promotion period.",
      },
      {
        question: "Where are you located?",
        answer: "Szekfű Gy. u. 12, Székesfehérvár, Hungary — central and easy to reach.",
      },
    ],
  },
  ctaBand: {
    title: "Get to know us — risk-free",
    subtitle: "Book your New Patient Special for 30,000 Ft instead of 55,000 Ft.",
    bullets: ["Available June 1 – August 31, 2026 · Online bookings only"],
    ctaLabel: "Book my visit",
  },
  contact: {
    eyebrow: "CONTACT",
    title: "Book your New Patient Special",
    subtitle: "Leave your details and our team will get back to you shortly.",
    nameLabel: "Full name",
    phoneLabel: "Phone number",
    emailLabel: "Email address",
    interestLabel: "I'm interested in",
    messageLabel: "Phone and message (optional)",
    privacyText:
      "I have read and accept the privacy policy and consent to my data being used to contact me.",
    submitLabel: "Send my request",
    interestOptions: [],
  },
  meta: {
    seoTitle: "New Patient Special | Kerámia Dental Székesfehérvár",
    seoDescription:
      "New Patient Special at Kerámia Dental: complete first visit for 30,000 Ft. English-speaking dentists, digital X-ray, professional cleaning.",
  },
}
