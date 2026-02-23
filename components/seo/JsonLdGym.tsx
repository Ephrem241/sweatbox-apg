const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://sweatboxapg.com";

const gymSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Sweatbox APG",
  alternateName: "Sweatbox Gym Addis Ababa",
  description:
    "Ethiopia's first accredited CrossFit performance center. Train at Sarbet, Bole, or Summit. CrossFit, combat, personal training, and youth programs in Addis Ababa.",
  url: BASE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Addis Ababa",
    addressCountry: "ET",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "05:00",
      closes: "22:00",
    },
  ],
  sameAs: [
    "https://instagram.com/sweatboxapg",
    "https://facebook.com/sweatboxapg",
    "https://twitter.com/sweatboxapg",
    "https://youtube.com/@sweatboxapg",
    "https://tiktok.com/@sweatboxapg",
  ],
};

export function JsonLdGym() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(gymSchema) }}
    />
  );
}
