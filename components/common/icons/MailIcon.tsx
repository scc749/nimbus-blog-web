import type { IconSvgProps } from "@/types";

const MailIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M17 3.5H7C4 3.5 2 5.5 2 8.5V15.5C2 18.5 4 20.5 7 20.5H17C20 20.5 22 18.5 22 15.5V8.5C22 5.5 20 3.5 17 3.5ZM18.47 9.59L14.34 12.09C13.68 12.52 12.84 12.73 12 12.73C11.16 12.73 10.31 12.52 9.66 12.09L5.53 9.59C5.21 9.33 5.16 8.85 5.41 8.53C5.67 8.21 6.14 8.15 6.47 8.41L10.6 10.91C11.35 11.4 12.65 11.4 13.4 10.91L17.53 8.41C17.85 8.15 18.33 8.2 18.59 8.53C18.84 8.85 18.79 9.33 18.47 9.59Z"
      fill="currentColor"
    />
  </svg>
);

export default MailIcon;
