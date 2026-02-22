"use client";

import { useState, useMemo } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { GalleryImage } from "@/lib/gallery-images";

type PhotoAlbumPhoto = { src: string; width: number; height: number; alt?: string };

function toSlides(images: GalleryImage[]) {
  return images.map((img) => ({
    src: img.src,
    alt: img.alt,
    width: img.width ?? 800,
    height: img.height ?? 600,
  }));
}

function toPhotos(images: GalleryImage[]): PhotoAlbumPhoto[] {
  return images.map((img) => ({
    src: img.src,
    width: img.width ?? 800,
    height: img.height ?? 600,
    alt: img.alt,
  }));
}

type Props = { images: GalleryImage[] };

export function PhotoGallery({ images }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = useMemo(() => toSlides(images), [images]);
  const photos = useMemo(() => toPhotos(images), [images]);

  return (
    <>
      <PhotoAlbum
        photos={photos}
        layout="masonry"
        columns={(containerWidth) => {
          if (containerWidth < 480) return 2;
          if (containerWidth < 768) return 3;
          return 4;
        }}
        onClick={({ index: i }) => {
          setIndex(i);
          setOpen(true);
        }}
      />
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
      />
    </>
  );
}
