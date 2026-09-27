"use client";

import { Button, Form, Input, Typography } from "antd";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { login } from "@/app/actions/auth";
import { useState } from "react";

const { Title, Text } = Typography;

export default function LoginPage() {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        setLoading(true);
        try {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <Title level={2}>{t("auth.login.title")}</Title>
                    <Text type="secondary">{t("auth.login.subtitle")}</Text>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <Form.Item
                        label={t("auth.login.email")}
                        name="email"
                        rules={[
                            { required: true, message: t("auth.login.emailRequired") },
                            { type: "email", message: t("auth.login.emailInvalid") },
                        ]}
                    >
                        <Input size="large" name="email" placeholder={t("auth.login.emailPlaceholder")} />
                    </Form.Item>

                    <Form.Item
                        label={t("auth.login.password")}
                        name="password"
                        rules={[
                            { required: true, message: t("auth.login.passwordRequired") },
                        ]}
                    >
                        <Input.Password
                            size="large"
                            name="password"
                            placeholder={t("auth.login.passwordPlaceholder")}
                        />
                    </Form.Item>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                        >
                            {t("auth.login.submit")}
                        </Button>
                    </Form.Item>
                </form>

                <div className="text-center">
                    <Text type="secondary">{t("auth.login.noAccount")}</Text>{" "}
                    <Link href="/signup">{t("auth.login.signupLink")}</Link>
                </div>
            </div>
        </div>
    );
}
