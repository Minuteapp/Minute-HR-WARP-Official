interface KeyResult {
  id: string;
  title: string;
  current_value?: number;
  target_value?: number;
  unit?: string;
}

interface GoalKeyResultRowProps {
  keyResult: KeyResult;
}

export const GoalKeyResultRow = ({ keyResult }: GoalKeyResultRowProps) => {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{keyResult.title}</span>
      <span className="font-medium">
        {keyResult.current_value ?? 0}/{keyResult.target_value ?? 100} {keyResult.unit || ''}
      </span>
    </div>
  );
};
