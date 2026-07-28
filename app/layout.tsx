import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;

  return {
    title: "제일풍경채 입주준비 계산기",
    description:
      "분양 잔금, 취득세, 등기비용, 이사비용과 대출을 한 번에 계산하는 아파트 입주 자금 계산기",
    openGraph: {
      title: "제일풍경채 입주준비 계산기",
      description: "입주 전에 필요한 현금을 한 번에 계산하세요.",
      images: [{ url: image, width: 1536, height: 909 }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
