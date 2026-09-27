"use client";

import { Button, Form, Input, Typography } from "antd";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { signup } from "@/app/actions/auth";
import { useState } from "react";

const { Title, Text } = Typography;

export default function SignupPage() {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        setLoading(true);
        try {
            const result = await signup(formData);
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
                    <Title level={2}>{t("auth.signup.title")}</Title>
                    <Text type="secondary">{t("auth.signup.subtitle")}</Text>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <Form.Item
                        label={t("auth.signup.email")}
                        name="email"
                        rules={[
                            { required: true, message: t("auth.signup.emailRequired") },
                            { type: "email", message: t("auth.signup.emailInvalid") },
                        ]}
                    >
                        <Input size="large" placeholder={t("auth.signup.emailPlaceholder")} />
                    </Form.Item>

                    <Form.Item
                        label={t("auth.signup.password")}
                        name="password"
                        rules={[
                            { required: true, message: t("auth.signup.passwordRequired") },
                            { min: 8, message: t("auth.signup.passwordMin") },
                        ]}
                    >
                        <Input.Password
                            size="large"
                            placeholder={t("auth.signup.passwordPlaceholder")}
                        />
                    </Form.Item>

                    <Form.Item
                        label={t("auth.signup.confirmPassword")}
                        name="confirmPassword"
                        rules={[
                            { required: true, message: t("auth.signup.confirmPasswordRequired") },
                        ]}
                    >
                        <Input.Password
                            size="large"
                            placeholder={t("auth.signup.confirmPasswordPlaceholder")}
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
                            {t("auth.signup.submit")}
                        </Button>
                    </Form.Item>
                </form>

                <div className="text-center">
                    <Text type="secondary">{t("auth.signup.hasAccount")}</Text>{" "}
                    <Link href="/login">{t("auth.signup.loginLink")}</Link>
                </div>
            </div>
        </div>
    );
}
