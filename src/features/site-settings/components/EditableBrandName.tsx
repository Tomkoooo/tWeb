"use client"

export function EditableBrandName({
  value,
  editMode,
  onChange,
}: {
  value: string
  editMode: boolean
  onChange: (value: string) => void
}) {
  if (!editMode) return <span>{value}</span>
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 px-2 bg-transparent border border-dashed border-white/20 text-white text-sm"
    />
  )
}
