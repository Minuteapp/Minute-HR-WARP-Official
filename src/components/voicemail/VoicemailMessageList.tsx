
import { VoicemailMessage } from "@/types/voicemail.types";
import { VoicemailMessageCard } from "./VoicemailMessageCard";

interface VoicemailMessageListProps {
  messages: VoicemailMessage[];
  isPlaying: string | null;
  onPlay: (message: VoicemailMessage) => void;
  onDelete: (id: string) => void;
  onEdit: (message: VoicemailMessage) => void;
}

export const VoicemailMessageList = ({
  messages,
  isPlaying,
  onPlay,
  onDelete,
  onEdit
}: VoicemailMessageListProps) => {
  if (!messages?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Keine Ansagen vorhanden
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <VoicemailMessageCard
          key={message.id}
          message={message}
          isPlaying={isPlaying === message.id}
          onPlay={() => onPlay(message)}
          onDelete={() => onDelete(message.id)}
          onEdit={() => onEdit(message)}
        />
      ))}
    </div>
  );
};
