"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type EventThumbnailProps = {
  alt: string;
  sizes: string;
  src?: string;
};

export default function EventThumbnail({
  alt,
  sizes,
  src,
}: EventThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        aria-label={alt}
        className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-300 dark:bg-slate-800 dark:text-emerald-800"
        role="img"
      >
        <ImageOff aria-hidden="true" className="h-10 w-10" />
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className="object-cover"
      fill
      onError={() => setHasError(true)}
      sizes={sizes}
      src={src}
      unoptimized
    />
  );
}
