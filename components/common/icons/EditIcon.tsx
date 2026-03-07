import type { IconSvgProps } from "@/types";

const EditIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
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
      d="M11.05 3.00002L4.20002 10.24C3.95002 10.5 3.70002 11.05 3.65002 11.41L3.20002 14.56C3.04002 15.69 3.84002 16.49 4.97002 16.33L8.12002 15.88C8.48002 15.83 9.03002 15.58 9.29002 15.33L16.14 8.09002C17.26 6.91002 17.77 5.56002 16.14 3.93002C14.51 2.30002 13.17 2.81002 11.05 3.00002Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      d="M9.90002 4.20001C10.21 6.35001 11.96 8.10001 14.11 8.41001"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      d="M2.5 21H21.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export default EditIcon;
