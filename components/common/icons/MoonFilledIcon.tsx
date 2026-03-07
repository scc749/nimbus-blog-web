import type { IconSvgProps } from "@/types";

const MoonFilledIcon = ({
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
      d="M21 12.79C20.38 12.93 19.73 13 19.06 13C14.62 13 11 9.38 11 4.94C11 4.27 11.07 3.62 11.21 3C7.71 3.78 5 6.95 5 10.62C5 15.06 8.62 18.68 13.06 18.68C16.73 18.68 19.9 15.97 20.68 12.47C20.66 12.58 20.64 12.69 20.62 12.79H21Z"
      fill="currentColor"
    />
  </svg>
);

export default MoonFilledIcon;
