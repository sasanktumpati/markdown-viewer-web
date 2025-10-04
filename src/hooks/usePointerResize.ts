"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef } from "react";

const MIN_SPLIT = 0.25;
const MAX_SPLIT = 0.75;
const MIN_PREVIEW_WIDTH = 0.4;
const MAX_PREVIEW_WIDTH = 1;

type DragType = "split" | "preview";

type UsePointerResizeParams = {
  isMobile: boolean;
  splitRatio: number;
  previewWidthRatio: number;
  onSplitRatioChange: (ratio: number) => void;
  onPreviewWidthRatioChange: (ratio: number) => void;
};

export function usePointerResize({
  isMobile,
  splitRatio,
  previewWidthRatio,
  onSplitRatioChange,
  onPreviewWidthRatioChange,
}: UsePointerResizeParams) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragTypeRef = useRef<DragType | null>(null);
  const splitRatioRef = useRef(splitRatio);
  const previewWidthRatioRef = useRef(previewWidthRatio);
  const pointerFrameRef = useRef<number | null>(null);

  useEffect(() => {
    splitRatioRef.current = splitRatio;
  }, [splitRatio]);

  useEffect(() => {
    previewWidthRatioRef.current = previewWidthRatio;
  }, [previewWidthRatio]);

  const cancelPendingFrame = useCallback(() => {
    if (pointerFrameRef.current !== null) {
      cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = null;
    }
  }, []);

  const cancelActiveResize = useCallback(() => {
    dragTypeRef.current = null;
    cancelPendingFrame();
  }, [cancelPendingFrame]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragTypeRef.current) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;

      cancelPendingFrame();

      pointerFrameRef.current = requestAnimationFrame(() => {
        const dragType = dragTypeRef.current;
        if (!dragType) {
          return;
        }

        if (dragType === "split") {
          const ratio = isMobile ? relativeY : relativeX;
          const clamped = Math.min(Math.max(ratio, MIN_SPLIT), MAX_SPLIT);
          if (Math.abs(clamped - splitRatioRef.current) > 0.001) {
            splitRatioRef.current = clamped;
            onSplitRatioChange(clamped);
          }
        } else {
          const clamped = Math.min(
            Math.max(relativeX, MIN_PREVIEW_WIDTH),
            MAX_PREVIEW_WIDTH,
          );
          if (Math.abs(clamped - previewWidthRatioRef.current) > 0.001) {
            previewWidthRatioRef.current = clamped;
            onPreviewWidthRatioChange(clamped);
          }
        }
      });
    };

    const clearDrag = () => cancelActiveResize();

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", clearDrag);
    window.addEventListener("pointercancel", clearDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", clearDrag);
      window.removeEventListener("pointercancel", clearDrag);
      cancelPendingFrame();
    };
  }, [
    cancelActiveResize,
    cancelPendingFrame,
    isMobile,
    onPreviewWidthRatioChange,
    onSplitRatioChange,
  ]);

  const startSplitResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragTypeRef.current = "split";
    },
    [],
  );

  const startPreviewResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragTypeRef.current = "preview";
    },
    [],
  );

  return {
    containerRef,
    startSplitResize,
    startPreviewResize,
    cancelActiveResize,
  } as const;
}
