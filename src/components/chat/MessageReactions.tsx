import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageReaction } from '@/types/chat-extended';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onReact: (reaction: string) => void;
}

const MessageReactions = ({ reactions, onReact }: MessageReactionsProps) => {
  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = [];
    }
    acc[reaction.reaction].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const commonEmojis = ['👍', '👎', '❤️', '😂', '😢', '😮', '😡', '🎉'];

  if (Object.keys(groupedReactions).length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
        <Button
          key={emoji}
          variant="secondary"
          size="sm"
          className="h-6 text-xs px-2 py-1"
          onClick={() => onReact(emoji)}
        >
          <span className="mr-1">{emoji}</span>
          {reactionList.length}
        </Button>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="grid grid-cols-8 gap-1">
            {commonEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg"
                onClick={() => {
                  onReact(emoji);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;