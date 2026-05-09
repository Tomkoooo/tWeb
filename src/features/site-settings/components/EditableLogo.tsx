"use client"

import { UploadSheet } from "@/features/site-settings/components/UploadSheet"
import { FallbackImage } from "@/components/common/FallbackImage"

export function EditableLogo({
  src,
  alt,
  editMode,
  onChange,
  usageLabel,
  recommendedSize,
}: {
  src: string
  alt: string
  editMode: boolean
  onChange: (value: string) => void
  usageLabel?: string
  recommendedSize?: { width: number; height: number }
}) {
  return (
    <div className="space-y-2">
      <FallbackImage src={src} alt={alt} width={180} height={60} className="object-contain h-10 w-auto" />
      {editMode ? (
        <UploadSheet
          onUploaded={onChange}
          label="Change logo"
          usageLabel={usageLabel}
          recommendedSize={recommendedSize}
          aspect={recommendedSize ? recommendedSize.width / recommendedSize.height : undefined}
        />
      ) : null}
    </div>
  )
}
