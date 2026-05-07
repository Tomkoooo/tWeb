"use client"

import { useCallback, useState } from "react"
import Cropper from "react-easy-crop"
import { Check, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react"
import getCroppedImg from "@/lib/crop-utils"

export function UploadSheet({
  onUploaded,
  label = "Upload image",
  usageLabel,
  recommendedSize,
  aspect,
}: {
  onUploaded: (url: string) => void
  label?: string
  usageLabel?: string
  recommendedSize?: { width: number; height: number }
  aspect?: number
}) {
  const [loading, setLoading] = useState(false)
  const [imageSource, setImageSource] = useState<string | null>(null)
  const [fileMeta, setFileMeta] = useState<{ width: number; height: number } | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const uploadBlob = useCallback(
    async (blob: Blob, filename: string) => {
      const formData = new FormData()
      formData.append("file", blob, filename)
      const response = await fetch("/api/admin/uploads", { method: "POST", body: formData })
      const data = await response.json()
      if (response.ok && data.url) onUploaded(data.url)
    },
    [onUploaded]
  )

  const resetEditor = () => {
    setImageSource(null)
    setFileMeta(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
  }

  return (
    <div className="space-y-2">
      {usageLabel ? (
        <p className="text-[10px] uppercase tracking-widest text-neutral-400">
          Cél: <span className="text-neutral-200">{usageLabel}</span>
        </p>
      ) : null}
      {recommendedSize ? (
        <p className="text-[10px] uppercase tracking-widest text-neutral-500">
          Javasolt méret: {recommendedSize.width} x {recommendedSize.height}px
        </p>
      ) : null}
      <label className="inline-flex items-center gap-2 text-xs uppercase text-white">
        <span>{label}</span>
        <input
          type="file"
          accept="image/*"
          disabled={loading}
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              const result = String(reader.result ?? "")
              const image = new Image()
              image.onload = () => {
                setFileMeta({ width: image.width, height: image.height })
                setImageSource(result)
              }
              image.src = result
            }
            reader.readAsDataURL(file)
            event.target.value = ""
          }}
        />
      </label>
      {fileMeta ? (
        <p className="text-[10px] text-neutral-500">
          Feltöltött kép: {fileMeta.width} x {fileMeta.height}px
        </p>
      ) : null}

      {imageSource ? (
        <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Kép szerkesztés</h3>
                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">
                  Körülvágás, nagyítás és forgatás
                </p>
              </div>
              <button onClick={resetEditor} className="p-2 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative flex-1 bg-black">
              <Cropper
                image={imageSource}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>
            <div className="p-6 bg-black/40 border-t border-white/5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    <span>Nagyítás</span>
                    <span className="text-primary">{Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <ZoomOut className="w-4 h-4 text-neutral-600" />
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 accent-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-neutral-600" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    <span>Forgatás</span>
                    <span className="text-primary">{rotation}°</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <RotateCcw className="w-4 h-4 text-neutral-600" />
                    <input
                      type="range"
                      value={rotation}
                      min={0}
                      max={360}
                      step={1}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-1 accent-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetEditor}
                  className="h-10 px-5 border border-white/20 text-white rounded-xl uppercase tracking-widest text-xs"
                >
                  Mégse
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!imageSource || !croppedAreaPixels) return
                    setLoading(true)
                    try {
                      const croppedBlob = await getCroppedImg(imageSource, croppedAreaPixels, rotation)
                      if (!croppedBlob) return
                      await uploadBlob(croppedBlob, "edited-image.jpg")
                      resetEditor()
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="h-10 px-6 bg-primary text-white rounded-xl uppercase tracking-widest text-xs font-bold inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Alkalmaz és feltölt
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
