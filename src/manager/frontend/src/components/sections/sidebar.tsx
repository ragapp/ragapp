import Link from "next/link"
import { TbRobot, TbMessageChatbot } from "react-icons/tb"


export function SideBar() {
    return (
        <div className="hidden bg-muted/40 md:block pt-4">
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <a
                        href="#"
                        className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                    >
                        <TbRobot size={40} />
                        Agents
                    </a>
                    <a
                        href="#"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:disable"
                    >
                        <TbMessageChatbot size={40} />
                        Chat
                    </a>
                </nav>
            </div>
        </div>
    )
}


