"use client";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/features/editor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-svh items-center justify-center gap-5 p-[25px] text-center text-[36px] font-bold">
      Scan Pop<span>✳</span>
    </div>
  ),
});
export default function Page() {
  return <Editor />;
}
