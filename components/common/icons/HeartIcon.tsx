import type { IconSvgProps } from "@/types";

const HeartIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
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
      d="M12 20.5C11.3 20.5 10.62 20.29 10.06 19.89C6.67 17.45 3.9 15.09 2.68 12.63C1.43 10.11 1.82 7.33 3.67 5.53C4.92 4.31 6.61 3.65 8.36 3.74C9.74 3.81 11.04 4.36 12 5.29C12.96 4.36 14.26 3.81 15.64 3.74C17.39 3.65 19.08 4.31 20.33 5.53C22.18 7.33 22.57 10.11 21.32 12.63C20.1 15.09 17.33 17.45 13.94 19.89C13.38 20.29 12.7 20.5 12 20.5Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export default HeartIcon;
