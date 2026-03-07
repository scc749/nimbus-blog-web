import type { IconSvgProps } from "@/types";

const LinkIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
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
    <path
      d="M9 15L15 9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      d="M11 6L13 4C15.2091 1.79086 18.7909 1.79086 21 4C23.2091 6.20914 23.2091 9.79086 21 12L19 14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      d="M13 18L11 20C8.79086 22.2091 5.20914 22.2091 3 20C0.790861 17.7909 0.790861 14.2091 3 12L5 10"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export default LinkIcon;
