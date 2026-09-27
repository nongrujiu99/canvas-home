"use client";

import { Button, Card, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { logout } from "@/app/actions/auth";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const { Title, Text } = Typography;

export default function DashboardPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "");
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
                <Text>{t("auth.dashboard.loading")}</Text>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Card>
                <div className="space-y-6">
                    <div>
                        <Title level={2}>{t("auth.dashboard.title")}</Title>
                        <Text type="secondary">
                            {t("auth.dashboard.welcome")} {email}
                        </Text>
                    </div>

                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                        <Title level={4} type="secondary">
                            {t("auth.dashboard.comingSoon")}
                        </Title>
                        <Text type="secondary">{t("auth.dashboard.comingSoonDesc")}</Text>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleLogout} size="large">
                            {t("auth.dashboard.logout")}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
