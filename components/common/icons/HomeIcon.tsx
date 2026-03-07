import type { IconSvgProps } from "@/types";

const HomeIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
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
      d="M2 9.12997L10.58 2.69997C11.39 2.08997 12.61 2.08997 13.43 2.69997L22 9.12997V19.49C22 20.87 20.88 21.99 19.5 21.99H4.5C3.12 21.99 2 20.87 2 19.49V9.12997Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export default HomeIcon;
