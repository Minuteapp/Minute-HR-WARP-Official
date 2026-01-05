
interface SavingsPotentialItemProps {
  category: string;
  tip: string;
  amount: number;
}

const SavingsPotentialItem = ({ category, tip, amount }: SavingsPotentialItemProps) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div>
        <p className="font-medium text-foreground">{category}</p>
        <p className="text-sm text-muted-foreground">{tip}</p>
      </div>
      <span className="font-semibold text-primary">
        €{amount.toLocaleString('de-DE')}
      </span>
    </div>
  );
};

export default SavingsPotentialItem;
