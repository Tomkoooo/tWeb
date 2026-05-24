import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  getRequestSeoSettings,
  getRequestBrandingSettings,
  getRequestActiveTemplateInfo,
  getCachedThemeForTemplate,
} from "@/lib/cached-storefront";
import { readPreviewTemplateId } from "@/services/template-preview";
import { getTemplateByIdAsync, loadTemplateModule } from "@/templates/registry";
import { getEffectiveThemeBase } from "@/services/theme";
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
  const [seo, branding] = await Promise.all([getRequestSeoSettings(), getRequestBrandingSettings()]);
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
    getRequestSeoSettings(),
    getRequestActiveTemplateInfo(),
    readPreviewTemplateId(),
  ]);
  const dbActiveTemplate = await getTemplateByIdAsync(activeInfo.templateId);
  const isPreviewingDifferentTemplate =
    previewTemplateId != null && previewTemplateId !== activeInfo.templateId;
  const theme = isPreviewingDifferentTemplate
    ? getEffectiveThemeBase(await loadTemplateModule(previewTemplateId))
    : await getCachedThemeForTemplate(dbActiveTemplate);
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
