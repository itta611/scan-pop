"use client";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
export default function ErrorPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 p-[25px] text-center [&>h1]:text-[23px] [&>p]:text-[13px]">
      <h1>表示ページを読み込めませんでした。</h1>
      <p>接続を確認して、もう一度お試しください。</p>
      <Link href="/" className={buttonClassName("primary")}>
        編集ページに戻る
      </Link>
    </div>
  );
}
