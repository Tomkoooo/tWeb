"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";

import { PLACEHOLDER_IMAGE } from "@/lib/images";

type FallbackImageProps = ImageProps & {
  fallbackSrc?: string;
};

export function FallbackImage({ src, fallbackSrc = PLACEHOLDER_IMAGE, onError, ...props }: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = React.useState(src || fallbackSrc);

  React.useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        onError?.(event);
      }}
    />
  );
}
