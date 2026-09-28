import type { ReactNode } from "react";
import { Suspense } from "react";

import "antd/dist/reset.css";
import "@/styles/globals.css";

import { AppProviders } from "@/components/layout/app-providers";
import UserLayout from "@/layouts/user-layout";
import { AnalyticsTracker } from "@/components/layout/analytics-tracker";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="zh-CN" className="font-sans" suppressHydrationWarning>
            <head>
                <meta name="description" content="一个无限画布创作工具" />
                <link rel="icon" href="/logo.svg" />
                <title>无限画布</title>
                <script
                    id="theme-init"
                    dangerouslySetInnerHTML={{
                        __html: `try{var s=JSON.parse(localStorage.getItem("infinite-canvas:theme_store")||"{}");var t=s.state&&s.state.theme==="light"?"light":"dark";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t;}catch(e){}`,
                    }}
                />
                <script
                    id="runtime-config"
                    dangerouslySetInnerHTML={{
                        __html: "window.__RUNTIME_CONFIG__=window.__RUNTIME_CONFIG__||{};",
                    }}
                />
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
