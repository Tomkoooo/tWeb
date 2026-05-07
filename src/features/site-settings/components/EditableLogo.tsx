"use client"

import Image from "next/image"
import { UploadSheet } from "@/features/site-settings/components/UploadSheet"

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
      <Image src={src || "/generic-logo.svg"} alt={alt} width={180} height={60} className="object-contain h-10 w-auto" />
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
