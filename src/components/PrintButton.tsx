"use client";

import { Button } from "./Button";

export function PrintButton() {
  return (
    <Button variant="secondary" size="sm" onClick={() => window.print()}>
      Print / PDF
    </Button>
  );
}
