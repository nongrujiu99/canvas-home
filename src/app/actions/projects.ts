"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getProjects() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        return { error: "加载项目失败" };
    }

    return { data };
}

export async function createProject(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "未登录" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name || name.trim().length === 0) {
        return { error: "项目名称不能为空" };
    }

    const { data: projectId, error } = await (supabase as any).rpc("create_project", {
        project_name: name.trim(),
        project_description: description?.trim() || null,
    });

    if (error) {
        return { error: "创建项目失败" };
    }

    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

    revalidatePath("/dashboard");
    return { data: project };
}

export async function renameProject(projectId: string, newName: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "未登录" };
    }

    if (!newName || newName.trim().length === 0) {
        return { error: "项目名称不能为空" };
    }

    const { error } = await (supabase
        .from("projects") as any)
        .update({ name: newName.trim() })
        .eq("id", projectId)
        .eq("owner_id", user.id);

    if (error) {
        return { error: "重命名失败" };
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function getCanvas(projectId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "未登录" };
    }

    const { data, error } = await (supabase
        .from("canvases") as any)
        .select("canvas_data, updated_at")
        .eq("project_id", projectId)
        .single();

    if (error || !data) {
        return { error: "画布不存在" };
    }

    return { data: { canvas_data: data.canvas_data, updated_at: data.updated_at } };
}

export async function saveCanvas(projectId: string, canvasData: unknown) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "未登录" };
    }

    const { error: canvasError } = await (supabase
        .from("canvases") as any)
        .update({ canvas_data: canvasData })
        .eq("project_id", projectId);

    if (canvasError) {
        return { error: "保存画布失败" };
    }

    await (supabase
        .from("projects") as any)
        .update({ updated_at: new Date().toISOString() })
        .eq("id", projectId)
        .eq("owner_id", user.id);

    return { success: true };
}

export async function deleteProject(projectId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "未登录" };
    }

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("owner_id", user.id);

    if (error) {
        return { error: "删除失败" };
    }

    revalidatePath("/dashboard");
    return { success: true };
}
