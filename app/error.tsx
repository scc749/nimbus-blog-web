"use client";

import { Button } from "@heroui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold">出了点问题</h2>
      <p className="text-default-500">{error.message}</p>
      <Button color="primary" variant="flat" onPress={() => reset()}>
        重试
      </Button>
    </div>
  );
}
