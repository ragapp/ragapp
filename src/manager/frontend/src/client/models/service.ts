export type Service = {
    id: string;
    name: string;
    started_at: string;
    created_at: string;
    updated_at: string | null;
    status: string;
    image: string;
    restart_count: number;
    port: string;
    url: string;
}