"use client"

import { UploadSheet } from "@/features/site-settings/components/UploadSheet"
import { FallbackImage } from "@/components/common/FallbackImage"

type Props = {
  src: string
  alt: string
  editMode: boolean
  onChange: (nextSrc: string) => void
  className?: string
  width?: number
  height?: number
  usageLabel?: string
  /** Enables free rectangle crop and full-image upload in the editor (for banners and logos). */
  flexibleCrop?: boolean
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
  flexibleCrop = false,
}: Props) {
  return (
    <div className="space-y-2">
      <FallbackImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        showFallbackOnError={editMode ? false : true}
      />
      {editMode ? (
        <div className="cms-admin-control space-y-2">
          <UploadSheet
            onUploaded={onChange}
            label="Upload image"
            usageLabel={usageLabel}
            recommendedSize={{ width, height }}
            aspect={width / height}
            allowRectangleCrop={flexibleCrop}
            allowSkipCrop={flexibleCrop}
          />
          <input
            value={src}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/api/media/..."
            className="w-full bg-transparent border border-dashed border-white/20 px-2 py-1 text-xs text-white focus:outline-none focus:border-primary-foreground/50"
          />
        </div>
      ) : null}
    </div>
  )
}
