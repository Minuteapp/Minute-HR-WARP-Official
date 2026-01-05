import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import FloatingChatButton from './FloatingChatButton';
import MinuteCompanionPopup from './MinuteCompanionPopup';

// Pfade, auf denen der Chat-Button nicht angezeigt werden soll
const HIDDEN_PATHS = [
  '/auth/login',
  '/auth/register',
  '/login',
  '/register',
  '/landing',
];

const MinuteCompanion: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Verstecke auf bestimmten Seiten
  const shouldHide = HIDDEN_PATHS.some(path => 
    location.pathname.startsWith(path)
  );

  if (shouldHide) {
    return null;
  }

  const toggleChat = () => setIsOpen(!isOpen);
  const closeChat = () => setIsOpen(false);

  return (
    <>
      <MinuteCompanionPopup isOpen={isOpen} onClose={closeChat} />
      <FloatingChatButton isOpen={isOpen} onClick={toggleChat} />
    </>
  );
};

export default MinuteCompanion;
