import type { IconSvgProps } from "@/types";

const ClockIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} />
    <path
      d="M12 7V12L15 14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export default ClockIcon;
