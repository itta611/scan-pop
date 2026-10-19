import type { Metadata } from "next";
import { BIZ_UDPGothic, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import "../styles.css";
const englishFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-english",
  display: "swap",
});

const japaneseFont = BIZ_UDPGothic({
  weight: ["400", "700"],
  variable: "--font-japanese",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Scan Pop — スキャンに、小さなお祝いを。",
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
      className={`${englishFont.variable} ${japaneseFont.variable} bg-white font-sans antialiased tabular-nums [font-synthesis:none] [-webkit-tap-highlight-color:transparent] [&_h1]:text-balance [&_h2]:text-balance [&_p]:text-pretty [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_button]:touch-manipulation [&_a]:touch-manipulation [&_:focus-visible]:outline-3 [&_:focus-visible]:outline-solid [&_:focus-visible]:outline-offset-4 motion-reduce:[&_*]:transition-none!`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
