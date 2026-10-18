import type { Metadata } from "next";
import { Providers } from "./providers";
import "../styles.css";
export const metadata: Metadata = {
  title: "QR Pop — スキャンに、小さなお祝いを。",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className="bg-white font-app antialiased tabular-nums [font-synthesis:none] [-webkit-tap-highlight-color:transparent] [&_h1]:text-balance [&_h2]:text-balance [&_p]:text-pretty [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_button]:touch-manipulation [&_a]:touch-manipulation [&_:focus-visible]:outline-3 [&_:focus-visible]:outline-solid [&_:focus-visible]:outline-offset-4 motion-reduce:[&_*]:transition-none!"
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
