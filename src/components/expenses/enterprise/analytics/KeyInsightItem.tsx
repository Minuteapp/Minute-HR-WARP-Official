
interface KeyInsightItemProps {
  number: number;
  title: string;
  description: string;
}

const KeyInsightItem = ({ number, title, description }: KeyInsightItemProps) => {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p 
          className="text-sm text-muted-foreground mt-1"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </div>
  );
};

export default KeyInsightItem;
