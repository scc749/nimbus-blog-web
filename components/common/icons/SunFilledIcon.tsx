import type { IconSvgProps } from "@/types";

const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M12 4V2M12 22V20M4 12H2M22 12H20M5.64 5.64L4.22 4.22M19.78 19.78L18.36 18.36M18.36 5.64L19.78 4.22M4.22 19.78L5.64 18.36"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <circle cx="12" cy="12" fill="currentColor" r="4" />
  </svg>
);

export default SunFilledIcon;
