import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SeoSettingsService } from "@/services/seo-settings";
import { BrandingSettingsService } from "@/services/branding-settings";
import { getEffectiveThemeBase, ThemeService } from "@/services/theme";
import { TemplateService } from "@/services/template";
import { readPreviewTemplateId } from "@/services/template-preview";
import { getTemplateById } from "@/templates/registry";
import { themeTokensToCssVars } from "@/lib/theme-css-vars";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

function toAbsoluteUrl(value: string, fallbackBase: string): string {
  if (!value) return fallbackBase;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${fallbackBase}${value.startsWith("/") ? value : `/${value}`}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const [seo, branding] = await Promise.all([SeoSettingsService.get(), BrandingSettingsService.get()]);
  const envBase = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const canonicalBase = seo.canonicalBaseUrl || envBase;
  let metadataBase: URL;
  try {
    metadataBase = new URL(canonicalBase);
  } catch {
    metadataBase = new URL(envBase);
  }
  const defaultRobots = { index: seo.robotsIndex, follow: seo.robotsFollow };
  const ogImage = toAbsoluteUrl(seo.ogImage, canonicalBase);
  const twitterImage = toAbsoluteUrl(seo.twitterImage, canonicalBase);

  return {
    title: seo.siteTitle,
    description: seo.siteDescription,
    metadataBase,
    icons: {
      icon: seo.favicon || "/generic-favicon.svg",
    },
    openGraph: {
      title: seo.siteTitle,
      description: seo.siteDescription,
      siteName: branding.brandName,
      locale: seo.defaultLocale || "en_US",
      images: [ogImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.siteTitle,
      description: seo.siteDescription,
      images: [twitterImage],
    },
    robots: defaultRobots,
    alternates: {
      canonical: canonicalBase,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [seo, activeInfo, previewTemplateId] = await Promise.all([
    SeoSettingsService.get(),
    TemplateService.getActiveInfo(),
    readPreviewTemplateId(),
  ]);
  const dbActiveTemplate = getTemplateById(activeInfo.templateId);
  // Only when previewing a *different* template than the DB active one: use that
  // template's packaged palette without shop overrides (overrides are keyed to
  // the DB-active baseline). Same-template preview + normal visits use merged.
  const isPreviewingDifferentTemplate =
    previewTemplateId != null && previewTemplateId !== activeInfo.templateId;
  const theme = isPreviewingDifferentTemplate
    ? getEffectiveThemeBase(getTemplateById(previewTemplateId))
    : await ThemeService.getMergedForTemplate(dbActiveTemplate);
  const themeVars = themeTokensToCssVars(theme);

  return (
    <html lang={seo.defaultLocale?.split("_")[0] || "en"} style={themeVars}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}

