"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { X, Check, RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import getCroppedImg from "@/lib/crop-utils"

interface ImageCropperProps {
  image: string
  aspect?: number
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
}

export function ImageCropper({ image, aspect = 1, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onRotationChange = (rotation: number) => {
    setRotation(rotation)
  }

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
      if (croppedImage) {
        onCropComplete(croppedImage)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div>
            <h3 className="text-lg font-bold text-white uppercase italic tracking-wider">Kép vágása</h3>
            <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Igazítsa be a termékfotót</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteInternal}
          />
        </div>

        {/* Controls */}
        <div className="p-6 bg-black/40 border-t border-white/5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Zoom Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                <span>Nagyítás</span>
                <span className="text-accent">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-4">
                <ZoomOut className="w-4 h-4 text-neutral-600" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => onZoomChange(Number(e.target.value))}
                  className="flex-1 accent-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
                <ZoomIn className="w-4 h-4 text-neutral-600" />
              </div>
            </div>

            {/* Rotation Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                <span>Forgatás</span>
                <span className="text-accent">{rotation}°</span>
              </div>
              <div className="flex items-center gap-4">
                <RotateCcw className="w-4 h-4 text-neutral-600" />
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(e) => onRotationChange(Number(e.target.value))}
                  className="flex-1 accent-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="h-12 px-6 border-white/10 text-white hover:bg-white/5 rounded-xl uppercase tracking-widest text-xs font-bold"
            >
              Mégse
            </Button>
            <Button 
              onClick={handleCrop}
              className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-5 h-5" />
              Alkalmaz
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
