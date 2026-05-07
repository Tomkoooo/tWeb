"use client"

import Image from "next/image"
import { UploadSheet } from "@/features/site-settings/components/UploadSheet"

type Props = {
  src: string
  alt: string
  editMode: boolean
  onChange: (nextSrc: string) => void
  className?: string
  width?: number
  height?: number
  usageLabel?: string
}

export function EditableImage({
  src,
  alt,
  editMode,
  onChange,
  className,
  width = 1200,
  height = 800,
  usageLabel,
}: Props) {
  return (
    <div className="space-y-2">
      <Image src={src || "/generic-hero.svg"} alt={alt} width={width} height={height} className={className} />
      {editMode ? (
        <div className="space-y-2">
          <UploadSheet
            onUploaded={onChange}
            label="Upload image"
            usageLabel={usageLabel}
            recommendedSize={{ width, height }}
            aspect={width / height}
          />
          <input
            value={src}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/api/media/..."
            className="w-full bg-transparent border border-dashed border-white/20 px-2 py-1 text-xs text-white focus:outline-none focus:border-primary"
          />
        </div>
      ) : null}
    </div>
  )
}
