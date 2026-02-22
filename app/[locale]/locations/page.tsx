import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** Lat/lng for map embed and link. Update to exact gym coordinates. */
const BRANCHES = [
  { nameKey: "sarbet" as const, addressKey: "sarbetAddress" as const, phone: "+251 11 XXX XXXX", mapsQuery: "Sarbet Old Airport Addis Ababa", lat: 8.9976, lng: 38.789 },
  { nameKey: "bole" as const, addressKey: "boleAddress" as const, phone: "+251 11 XXX XXXX", mapsQuery: "Bole Atlas Addis Ababa", lat: 8.9962, lng: 38.7895 },
  { nameKey: "summit" as const, addressKey: "summitAddress" as const, phone: "+251 11 XXX XXXX", mapsQuery: "Summit Addis Ababa", lat: 9.0223, lng: 38.7469 },
] as const;

const HOURS = "5 AM - 10 PM";

function getMapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** OpenStreetMap embed URL with marker; bbox is a small area around the point. */
function getMapEmbedUrl(lat: number, lng: number) {
  const pad = 0.004;
  const bbox = [lng - pad, lat - pad, lng + pad, lat + pad].join("%2C");
  const marker = `${lat}%2C${lng}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

export default async function LocationsPage() {
  const t = await getTranslations("footer");

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-8 text-center text-2xl font-bold tracking-tight md:text-3xl">
        Our Locations
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BRANCHES.map((branch) => (
          <Card key={branch.nameKey} className="flex flex-col overflow-hidden">
            <div className="relative aspect-video w-full shrink-0 bg-muted">
              <iframe
                title={`Map: ${t(branch.nameKey)}`}
                src={getMapEmbedUrl(branch.lat, branch.lng)}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts"
              />
            </div>
            <CardHeader>
              <CardTitle>{t(branch.nameKey)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <p className="text-sm text-muted-foreground">{t(branch.addressKey)}</p>
              <p className="text-sm">
                <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="text-foreground hover:underline">
                  {branch.phone}
                </a>
              </p>
              <p className="text-sm text-muted-foreground">Hours: {HOURS}</p>
              <Button asChild variant="outline" className="mt-auto w-full sm:w-auto">
                <a href={getMapsUrl(branch.mapsQuery)} target="_blank" rel="noopener noreferrer">
                  Get Directions
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
