export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background-dark">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary"
        aria-label="Loading"
      />
    </div>
  )
}
