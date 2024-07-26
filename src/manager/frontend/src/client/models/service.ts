export type Service = {
    id: string;
    name: string;
    app_name: string | null;
    started_at: string;
    created_at: string;
    updated_at: string | null;
    status: string;
    image: string;
    restart_count: number;
    url: string;
}