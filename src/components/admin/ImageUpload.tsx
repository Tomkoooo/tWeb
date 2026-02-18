import { useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "./ImageCropper"

interface ImageUploadProps {
  onUpload: (filename: string) => void
  currentImage?: string
  aspect?: number
}

export function ImageUpload({ onUpload, currentImage, aspect = 1 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedFile(reader.result as string)
      setIsCropping(true)
    }
    reader.readAsDataURL(file)
    
    // Clear the input value so the same file can be selected again if needed
    e.target.value = ""
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropping(false)
    setUploading(true)

    // Preview cropped version locally
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(croppedBlob)

    // Upload to server
    const formData = new FormData()
    formData.append("file", croppedBlob, "image.jpg")

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.filename) {
        onUpload(data.filename)
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative group aspect-square w-full max-w-[240px] bg-black border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center transition-all hover:border-accent/40">
        {preview ? (
          <>
            <img 
              src={preview.startsWith('data:') ? preview : `/api/media/${preview}`} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={() => { setPreview(""); onUpload(""); }}
              className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-neutral-600" />
            </div>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest line-clamp-1">Kép feltöltése</p>
            <input type="file" className="hidden" onChange={onFileSelect} accept="image/*" />
          </label>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        )}
      </div>

      {isCropping && selectedFile && (
        <ImageCropper
          image={selectedFile}
          aspect={aspect}
          onCropComplete={handleCropComplete}
          onCancel={() => setIsCropping(false)}
        />
      )}
    </div>
  )
}
