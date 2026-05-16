interface Props {
  message: string
  onDismiss: () => void
}

export function ErrorToast({ message, onDismiss }: Props) {
  return (
    <div className="rounded-md bg-red-950 border border-red-800 px-4 py-2 text-sm text-red-300 flex justify-between items-center gap-4">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="shrink-0 text-red-500 hover:text-red-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
      >
        ✕
      </button>
    </div>
  )
}
