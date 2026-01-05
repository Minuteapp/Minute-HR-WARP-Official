
import { useEffect, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useTheme } from 'next-themes';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ onSelect }: EmojiPickerProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Um hydration errors zu vermeiden, warten wir auf den ersten render
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Picker
      data={data}
      onEmojiSelect={(emoji: any) => onSelect(emoji.native)}
      theme={theme === 'dark' ? 'dark' : 'light'}
      previewPosition="none"
      skinTonePosition="none"
      maxFrequentRows={1}
    />
  );
};
