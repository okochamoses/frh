"use client";

import React from "react";

/**
 * Validation / submission error text.
 *
 * role="alert" so screen readers announce it the moment it appears — a plain
 * <p> is silent, which meant the only feedback for a failed submit was visual.
 */
export default function FormError({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-red-600 text-sm">
      {children}
    </p>
  );
}
