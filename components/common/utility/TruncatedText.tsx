"use client";

import React, { useEffect, useRef, useState } from "react";
import { Tooltip } from "@heroui/tooltip";

interface Props {
  text: string;
  className?: string;
  multiLine?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
}

export function TruncatedText({
  text,
  className,
  multiLine = false,
  placement = "top",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  const checkOverflow = () => {
    const el = ref.current;

    if (!el) return;

    const isOverflow = multiLine
      ? el.scrollHeight > el.clientHeight + 1
      : el.scrollWidth > el.clientWidth + 1;

    setOverflow(isOverflow);
  };

  useEffect(() => {
    checkOverflow();
    const onResize = () => checkOverflow();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [text, className, multiLine]);

  return (
    <Tooltip
      closeDelay={0}
      content={text}
      delay={300}
      isDisabled={!overflow}
      placement={placement}
    >
      <span ref={ref} className={className} title={overflow ? undefined : text}>
        {text}
      </span>
    </Tooltip>
  );
}
