/**
 * Central config for hero, services, and gallery imagery.
 * Replace src with real member photos (e.g. /members/hero-1.jpg or Supabase Storage URLs).
 * Recommended: hero 1920×1080 or 1440×900; services 800×600; gallery 1200×800.
 */
export type HeroSlide = {
  src: string;
  alt: string;
  credit?: string;
};

export type ServiceImage = {
  key: "crossfit" | "combat" | "personalTraining" | "youth";
  src: string;
  alt: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export const HERO_SLIDES: HeroSlide[] = [
  { src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", alt: "CrossFit gym" },
  { src: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&q=80", alt: "Gym workout" },
  { src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80", alt: "Strength training" },
];

export const SERVICE_IMAGES: ServiceImage[] = [
  { key: "crossfit", src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80", alt: "CrossFit" },
  { key: "combat", src: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80", alt: "Combat" },
  { key: "personalTraining", src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80", alt: "Personal training" },
  { key: "youth", src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80", alt: "Youth" },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", alt: "CrossFit training", width: 800, height: 600 },
  { src: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80", alt: "Gym equipment", width: 800, height: 600 },
  { src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80", alt: "Strength training", width: 800, height: 600 },
  { src: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80", alt: "Boxing bag", width: 800, height: 600 },
  { src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", alt: "Fitness class", width: 800, height: 600 },
  { src: "https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=800&q=80", alt: "Woman training", width: 800, height: 600 },
];
