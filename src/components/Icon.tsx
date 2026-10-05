const paths = {
  archive: 'M5 6H17V21H5ZM9 6V2H21V17H17',
  arrow: 'M5 12H19M13 6L19 12L13 18',
  close: 'M6 6L18 18M18 6L6 18',
  copy: 'M9 9H20V21H9ZM15 9V3H3V15H9',
  check: 'M5 12L10 17L19 7',
} as const

interface IconProps {
  name: keyof typeof paths
  className?: string
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}
