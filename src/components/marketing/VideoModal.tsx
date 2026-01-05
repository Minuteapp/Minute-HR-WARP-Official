import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Minute HR Demo Video</DialogTitle>
        </DialogHeader>
        
        {/* Video Placeholder - Replace with actual video embed */}
        <div className="relative aspect-video bg-slate-900">
          {/* Placeholder content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium">Demo-Video kommt bald</p>
            <p className="text-sm text-white/60 mt-2">
              Hier wird das Produktvideo eingebettet
            </p>
          </div>

          {/* When you have a real video, replace above with:
          <iframe
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1"
            title="Minute HR Demo"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
