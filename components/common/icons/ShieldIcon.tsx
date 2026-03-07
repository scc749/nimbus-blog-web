import type { IconSvgProps } from "@/types";

const ShieldIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
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
      d="M10.49 2.23L5.50003 4.11C4.35003 4.54 3.41003 5.9 3.41003 7.12V14.55C3.41003 15.73 4.19003 17.28 5.14003 17.99L9.44003 21.2C10.85 22.26 13.17 22.26 14.58 21.2L18.88 17.99C19.83 17.28 20.61 15.73 20.61 14.55V7.12C20.61 5.89 19.67 4.53 18.52 4.1L13.53 2.23C12.68 1.92 11.32 1.92 10.49 2.23Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      d="M12 12.5C13.1046 12.5 14 11.6046 14 10.5C14 9.39543 13.1046 8.5 12 8.5C10.8954 8.5 10 9.39543 10 10.5C10 11.6046 10.8954 12.5 12 12.5Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      d="M12 12.5V15.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export default ShieldIcon;
