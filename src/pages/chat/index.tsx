import { Chat } from "@/components/Chat";
import MobileChatView from "@/components/chat/mobile/MobileChatView";
import { useIsMobile } from "@/hooks/use-device-type";

const ChatPage = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50">
        <MobileChatView />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Chat />
    </div>
  );
};

export default ChatPage;
