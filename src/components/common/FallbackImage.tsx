"use client"

import * as React from "react"
import Image, { type ImageProps } from "next/image"

import { PLACEHOLDER_IMAGE } from "@/lib/images"
import { cn } from "@/lib/utils"

type FallbackImageProps = ImageProps & {
  fallbackSrc?: string
  /**
   * When false, missing/failed URLs render a light empty shell (good for CMS editors).
   * When true (default), failed loads swap to `fallbackSrc` (storefront UX).
   */
  showFallbackOnError?: boolean
}

function EmptyImageSurface({
  className,
  fill,
}: Pick<ImageProps, "className" | "fill">) {
  if (fill) {
    return (
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-muted/25 ring-1 ring-inset ring-white/15 ring-dashed",
          className
        )}
      />
    )
  }
  return (
    <div
      aria-hidden
      className={cn(
        "min-h-[4rem] w-full max-w-[20rem] bg-muted/25 ring-1 ring-inset ring-white/15 ring-dashed",
        className
      )}
    />
  )
}

export function FallbackImage({
  src,
  fallbackSrc = PLACEHOLDER_IMAGE,
  showFallbackOnError = true,
  onError,
  className,
  fill,
  alt = "",
  ...props
}: FallbackImageProps) {
  const raw = typeof src === "string" ? src.trim() : ""
  const [broken, setBroken] = React.useState(false)
  const [currentSrc, setCurrentSrc] = React.useState(() =>
    showFallbackOnError ? raw || fallbackSrc : raw
  )

  React.useEffect(() => {
    setBroken(false)
  }, [src])

  React.useEffect(() => {
    if (showFallbackOnError) {
      setCurrentSrc(raw || fallbackSrc)
    }
  }, [showFallbackOnError, raw, fallbackSrc])

  if (!showFallbackOnError) {
    if (!raw || broken) {
      return <EmptyImageSurface className={className} fill={fill} />
    }
    return (
      <Image
        {...props}
        alt={alt}
        fill={fill}
        className={className}
        src={raw}
        onError={(event) => {
          setBroken(true)
          onError?.(event)
        }}
      />
    )
  }

  return (
    <Image
      {...props}
      alt={alt}
      fill={fill}
      className={className}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
        onError?.(event)
      }}
    />
  )
}
