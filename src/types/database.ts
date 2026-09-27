export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    username: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    username?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey";
                        columns: ["id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            projects: {
                Row: {
                    id: string;
                    owner_id: string;
                    name: string;
                    description: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    owner_id: string;
                    name: string;
                    description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    owner_id?: string;
                    name?: string;
                    description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "projects_owner_id_fkey";
                        columns: ["owner_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                ];
            };
            canvases: {
                Row: {
                    id: string;
                    project_id: string;
                    canvas_data: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    canvas_data?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    canvas_data?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "canvases_project_id_fkey";
                        columns: ["project_id"];
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                ];
            };
            assets: {
                Row: {
                    id: string;
                    project_id: string;
                    owner_id: string;
                    storage_path: string;
                    mime_type: string;
                    size: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    owner_id: string;
                    storage_path: string;
                    mime_type: string;
                    size: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    owner_id?: string;
                    storage_path?: string;
                    mime_type?: string;
                    size?: number;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "assets_project_id_fkey";
                        columns: ["project_id"];
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "assets_owner_id_fkey";
                        columns: ["owner_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                ];
            };
            ai_generations: {
                Row: {
                    id: string;
                    project_id: string;
                    owner_id: string;
                    node_id: string;
                    prompt: string | null;
                    result_url: string | null;
                    status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    owner_id: string;
                    node_id: string;
                    prompt?: string | null;
                    result_url?: string | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    owner_id?: string;
                    node_id?: string;
                    prompt?: string | null;
                    result_url?: string | null;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "ai_generations_project_id_fkey";
                        columns: ["project_id"];
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "ai_generations_owner_id_fkey";
                        columns: ["owner_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
