/**
 * Patching:
 * Add a new chat page which only includes the chat section with responsive layout
 */

import ChatSection from "../components/chat-section";

export default function Home() {
  return (
    <main className="absolute w-full h-full flex flex-col items-center gap-10 bg-gray-50">
      <div className="w-full h-full">
        <ChatSection layout="fit" />
      </div>
    </main>
  );
}
