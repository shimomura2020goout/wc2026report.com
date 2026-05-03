// [locale] セグメントの最小レイアウト
// 役割は generateStaticParams を提供し、Next.js に ja/en/ko の各バリアントを
// ビルド時静的生成させること。実体のレイアウト（HTML, Header, Provider 等）は
// ルート src/app/layout.tsx に集約しているため、ここはパススルー。

import { LOCALES, type Locale } from "@/i18n/index";
import { notFound } from "next/navigation";

export async function generateStaticParams(): Promise<{ locale: Locale }[]> {
  return LOCALES.map((locale) => ({ locale }));
}

// ロケール検証も兼ねる（不正値で 404）
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) {
    notFound();
  }
  return <>{children}</>;
}
