import type { IconSvgProps } from "@/types";

const CalendarIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
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
    <rect
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth={1.5}
      width="18"
      x="3"
      y="5"
    />
    <path
      d="M16 3V7M8 3V7M3 9H21"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export default CalendarIcon;
