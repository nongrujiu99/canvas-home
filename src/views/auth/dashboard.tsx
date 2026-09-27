"use client";

import { Button, Card, Empty, Input, Modal, Spin, Typography, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { logout } from "@/app/actions/auth";
import { createProject, deleteProject, getProjects, renameProject } from "@/app/actions/projects";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const { Title, Text } = Typography;

type Project = {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    created_at: string;
    updated_at: string;
};

export default function DashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [renameProjectName, setRenameProjectName] = useState("");

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "");
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        setError(null);
        const result = await getProjects();
        if (result.error) {
            setError(result.error);
        } else {
            setProjects(result.data || []);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await logout();
    };

    const handleCreateProject = async () => {
        const formData = new FormData();
        formData.append("name", newProjectName);
        formData.append("description", newProjectDescription);

        const result = await createProject(formData);
        if (result.error) {
            message.error(result.error);
        } else {
            message.success(t("dashboard.project.createSuccess"));
            setCreateModalOpen(false);
            setNewProjectName("");
            setNewProjectDescription("");
            loadProjects();
        }
    };

    const handleOpenProject = (projectId: string) => {
        router.push(`/canvas/${projectId}`);
    };

    const handleRenameProject = async () => {
        if (!selectedProject) return;

        const result = await renameProject(selectedProject.id, renameProjectName);
        if (result.error) {
            message.error(result.error);
        } else {
            message.success(t("dashboard.project.renameSuccess"));
            setRenameModalOpen(false);
            setSelectedProject(null);
            setRenameProjectName("");
            loadProjects();
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;

        const result = await deleteProject(selectedProject.id);
        if (result.error) {
            message.error(result.error);
        } else {
            message.success(t("dashboard.project.deleteSuccess"));
            setDeleteModalOpen(false);
            setSelectedProject(null);
            loadProjects();
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Title level={2}>{t("dashboard.title")}</Title>
                    <Text type="secondary">
                        {t("dashboard.welcome")} {email}
                    </Text>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        {t("dashboard.project.create")}
                    </Button>
                    <Button onClick={handleLogout} size="large">
                        {t("auth.dashboard.logout")}
                    </Button>
                </div>
            </div>

            {error ? (
                <Card>
                    <div className="py-12 text-center">
                        <Text type="danger">{error}</Text>
                        <div className="mt-4">
                            <Button onClick={loadProjects}>{t("common.retry")}</Button>
                        </div>
                    </div>
                </Card>
            ) : projects.length === 0 ? (
                <Card>
                    <Empty
                        description={
                            <div className="py-8">
                                <Text type="secondary">{t("dashboard.project.empty")}</Text>
                                <div className="mt-4">
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setCreateModalOpen(true)}
                                    >
                                        {t("dashboard.project.createFirst")}
                                    </Button>
                                </div>
                            </div>
                        }
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card
                            key={project.id}
                            hoverable
                            actions={[
                                <EditOutlined
                                    key="edit"
                                    onClick={() => {
                                        setSelectedProject(project);
                                        setRenameProjectName(project.name);
                                        setRenameModalOpen(true);
                                    }}
                                />,
                                <DeleteOutlined
                                    key="delete"
                                    onClick={() => {
                                        setSelectedProject(project);
                                        setDeleteModalOpen(true);
                                    }}
                                />,
                            ]}
                        >
                            <Card.Meta
                                title={
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => handleOpenProject(project.id)}
                                    >
                                        {project.name}
                                    </div>
                                }
                                description={
                                    <div>
                                        {project.description && (
                                            <Text type="secondary" className="line-clamp-2">
                                                {project.description}
                                            </Text>
                                        )}
                                        <div className="mt-2">
                                            <Text type="secondary" className="text-xs">
                                                {t("common.updated", {
                                                    date: dayjs(project.updated_at).format(
                                                        "YYYY-MM-DD HH:mm",
                                                    ),
                                                })}
                                            </Text>
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                title={t("dashboard.project.createTitle")}
                open={createModalOpen}
                onOk={handleCreateProject}
                onCancel={() => {
                    setCreateModalOpen(false);
                    setNewProjectName("");
                    setNewProjectDescription("");
                }}
                okText={t("common.create")}
                cancelText={t("common.cancel")}
            >
                <div className="space-y-4">
                    <div>
                        <Text>{t("dashboard.project.name")}</Text>
                        <Input
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder={t("dashboard.project.namePlaceholder")}
                        />
                    </div>
                    <div>
                        <Text>{t("dashboard.project.description")}</Text>
                        <Input.TextArea
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            placeholder={t("dashboard.project.descriptionPlaceholder")}
                            rows={3}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                title={t("dashboard.project.renameTitle")}
                open={renameModalOpen}
                onOk={handleRenameProject}
                onCancel={() => {
                    setRenameModalOpen(false);
                    setSelectedProject(null);
                    setRenameProjectName("");
                }}
                okText={t("common.save")}
                cancelText={t("common.cancel")}
            >
                <div>
                    <Text>{t("dashboard.project.name")}</Text>
                    <Input
                        value={renameProjectName}
                        onChange={(e) => setRenameProjectName(e.target.value)}
                        placeholder={t("dashboard.project.namePlaceholder")}
                    />
                </div>
            </Modal>

            <Modal
                title={t("dashboard.project.deleteTitle")}
                open={deleteModalOpen}
                onOk={handleDeleteProject}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setSelectedProject(null);
                }}
                okText={t("common.delete")}
                cancelText={t("common.cancel")}
                okButtonProps={{ danger: true }}
            >
                <Text>
                    {t("dashboard.project.deleteConfirm", { name: selectedProject?.name })}
                </Text>
            </Modal>
        </div>
    );
}
