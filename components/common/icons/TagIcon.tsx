import type { IconSvgProps } from "@/types";

const TagIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
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
      d="M2 13V7C2 4.24 4.24 2 7 2H13C14.33 2 15.6 2.53 16.54 3.46L20.54 7.46C22.49 9.41 22.49 12.58 20.54 14.54L14.54 20.54C12.59 22.49 9.42 22.49 7.47 20.54L3.47 16.54C2.53 15.6 2 14.33 2 13Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      d="M7.5 7.5H7.51"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export default TagIcon;
