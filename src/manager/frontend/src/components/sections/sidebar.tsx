import { Bot } from "lucide-react";

export function SideBar() {
  return (
    <div className="hidden bg-muted/40 md:block pt-4">
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
          >
            <Bot size={40} />
            Apps
          </a>
        </nav>
      </div>
    </div>
  );
}
