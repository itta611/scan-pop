"use client";
import dynamic from "next/dynamic";
export const Display = dynamic(() => import("@/features/display"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-white" />,
});
