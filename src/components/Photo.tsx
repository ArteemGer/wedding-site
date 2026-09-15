export function Photo({
  src,
  label,
  className = '',
}: {
  src: string
  label: string
  className?: string
}) {
  return (
    <div className={`photo ${className}`}>
      {src ? (
        <img src={src} alt={label} />
      ) : (
        <div className="photo-placeholder">
          <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <path
              d="M24 96c0-24 16-39 36-39s36 15 36 39M60 57a20 20 0 1 0 0-40 20 20 0 0 0 0 40Z"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M13 105h94M15 16h13M21.5 9.5v13M98 43h10M103 38v10"
              stroke="currentColor"
            />
          </svg>
          <span>{label}</span>
        </div>
      )}
    </div>
  )
}
