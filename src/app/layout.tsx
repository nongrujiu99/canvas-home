"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import Script from "next/script";

import "antd/dist/reset.css";
import "@/styles/globals.css";

import { AppProviders } from "@/components/layout/app-providers";
import UserLayout from "@/layouts/user-layout";
import { AnalyticsTracker } from "@/components/layout/analytics-tracker";
import "@/i18n";
import { initAnalytics } from "@/lib/analytics";

initAnalytics();

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="zh-CN" className="font-sans" suppressHydrationWarning>
            <head>
                <meta name="description" content="一个无限画布创作工具" />
                <link rel="icon" href="/logo.svg" />
                <title>无限画布</title>
                <Script id="theme-init" strategy="beforeInteractive">
                    {`try{var s=JSON.parse(localStorage.getItem("infinite-canvas:theme_store")||"{}");var t=s.state&&s.state.theme==="light"?"light":"dark";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t;}catch(e){}`}
                </Script>
                <Script id="runtime-config" strategy="beforeInteractive">
                    {"window.__RUNTIME_CONFIG__=window.__RUNTIME_CONFIG__||{};"}
                </Script>
            </head>
            <body className="bg-background text-foreground antialiased">
                <AppProviders>
                    <UserLayout>
                        <Suspense fallback={null}>
                            <AnalyticsTracker />
                        </Suspense>
                        {children}
                    </UserLayout>
                </AppProviders>
            </body>
        </html>
    );
}
