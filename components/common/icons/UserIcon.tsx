import type { IconSvgProps } from "@/types";

const UserIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
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
      d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9.5 4-10 9a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1c-.5-5-5-9-10-9Z"
      fill="currentColor"
    />
  </svg>
);

export default UserIcon;
