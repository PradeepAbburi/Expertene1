// No default React import required with the automatic JSX runtime

interface LoadingSpinnerProps {
  size?: number; // Tailwind sizing in rem-ish units (1 -> w-1 h-1, etc.)
  className?: string;
}

export function LoadingSpinner({ size = 4, className = '' }: LoadingSpinnerProps) {
  const sizeClass = `w-${size} h-${size}`;

  // Use a simple border-based spinner that works with Tailwind
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-block align-middle ${className}`}
    >
      <svg
        className={`animate-spin text-current ${sizeClass}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="sr-only">Loading</span>
    </span>
  );
}

export default LoadingSpinner;
