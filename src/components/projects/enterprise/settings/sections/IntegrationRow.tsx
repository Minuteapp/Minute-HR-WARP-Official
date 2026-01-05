interface IntegrationRowProps {
  name: string;
  description: string;
  isActive: boolean;
  onConfigure: () => void;
}

const IntegrationRow = ({
  name,
  description,
  isActive,
  onConfigure
}: IntegrationRowProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          {isActive ? (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              Aktiv
            </span>
          ) : (
            <span className="bg-background text-muted-foreground text-xs px-2 py-0.5 rounded-full border border-border">
              Inaktiv
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <button
        onClick={onConfigure}
        className="text-sm text-primary hover:underline ml-4"
      >
        Konfigurieren
      </button>
    </div>
  );
};

export default IntegrationRow;
