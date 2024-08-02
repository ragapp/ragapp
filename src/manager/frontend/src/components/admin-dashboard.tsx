"use client";
import { ServicesList } from "./sections/services";
import { SideBar } from "./sections/sidebar";

export function AdminDashboard() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] space-x-4">
      <SideBar />
      <div className="flex flex-col pt-4">
        <ServicesList />
      </div>
    </div>
  );
}
