export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background-dark">
      <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" aria-label="Loading" />
    </div>
  )
}
