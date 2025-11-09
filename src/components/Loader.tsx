"use client";
import React from "react";

interface LoaderProps {
  size?: number;
  className?: string;
  delayMs?: number; // optional: just for future expansion
}

export function Loader({ size = 28, className = "" }: LoaderProps) {
  return (
    <div
      className={`loader ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-label="Carregando"
      role="status"
    />
  );
}

export default Loader;
