"use client";
// biome-ignore assist/source/organizeImports: react-scan must load before react imports
import { scan } from "react-scan";
import { useEffect } from "react";
import type { JSX } from "react";

export function ReactScan(): JSX.Element | null {
  useEffect(() => {
    scan({
      enabled: process.env.NODE_ENV === "development",
    });
  }, []);

  return null;
}
