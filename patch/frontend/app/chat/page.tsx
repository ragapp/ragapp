/**
 * Patching:
 * Add a new chat page which only includes the chat section with responsive layout
 */

import ChatSection from "../components/chat-section";

export default function Home() {
	return (
		<div className="h-full w-full">
			<ChatSection />
		</div>
	);
}
