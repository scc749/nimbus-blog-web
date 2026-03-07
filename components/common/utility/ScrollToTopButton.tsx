"use client";

import { Button } from "@heroui/button";

export function ScrollToTopButton() {
  return (
    <Button
      color="primary"
      variant="bordered"
      onPress={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      返回顶部
    </Button>
  );
}
