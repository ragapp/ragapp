"use client";

import { AdminDashboard } from "@/components/admin-dashboard";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen flex-col">
        <AdminDashboard />
      </main>
    </QueryClientProvider>
  );
}
