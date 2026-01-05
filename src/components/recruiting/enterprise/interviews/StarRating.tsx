import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md';
}

const StarRating = ({ rating, maxRating = 5, size = 'sm' }: StarRatingProps) => {
  const sizeClasses = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClasses} ${
            i < rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
};

export default StarRating;
