import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 p-6 text-center">
      <h1>このページは見つかりませんでした。</h1>
      <Link href="/" className={buttonClassName("primary")}>
        編集ページに戻る
      </Link>
    </div>
  );
}
