import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface EditableFieldProps {
  label?: string;
  value: string | number | undefined | null;
  isEditing?: boolean;
  onChange?: (value: any) => void;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'currency';
  options?: { value: string; label: string }[];
  suffix?: string;
  prefix?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  showLabel?: boolean;
}

export const EditableField = ({
  label,
  value,
  isEditing = false,
  onChange,
  type = 'text',
  options = [],
  suffix = '',
  prefix = '',
  placeholder = '',
  className = '',
  labelClassName = 'text-xs text-muted-foreground mb-1',
  valueClassName = 'text-xl font-bold',
  showLabel = true,
}: EditableFieldProps) => {
  const displayValue = value !== null && value !== undefined ? value : '-';
  
  // Format display value
  const formattedDisplayValue = () => {
    if (type === 'currency' && typeof value === 'number') {
      return `${prefix}${value.toLocaleString('de-DE')}${suffix}`;
    }
    return `${prefix}${displayValue}${suffix}`;
  };

  if (!isEditing) {
    return (
      <div className={className}>
        {showLabel && label && <p className={labelClassName}>{label}</p>}
        <p className={valueClassName}>{formattedDisplayValue()}</p>
      </div>
    );
  }

  // Render editable input based on type
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Select 
            value={String(value || '')} 
            onValueChange={(val) => onChange?.(val)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={placeholder || 'Auswählen...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={String(value || '')}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px]"
          />
        );
      
      case 'number':
      case 'currency':
        return (
          <div className="relative">
            {prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {prefix}
              </span>
            )}
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
              placeholder={placeholder}
              className={`h-9 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
            />
            {suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {suffix}
              </span>
            )}
          </div>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={String(value || '')}
            onChange={(e) => onChange?.(e.target.value)}
            className="h-9"
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={String(value || '')}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="h-9"
          />
        );
    }
  };

  return (
    <div className={className}>
      {showLabel && label && <p className={labelClassName}>{label}</p>}
      {renderInput()}
    </div>
  );
};

// Compact version for inline editing
export const EditableFieldInline = ({
  value,
  isEditing,
  onChange,
  type = 'text',
  suffix = '',
  className = 'text-sm font-medium',
}: Pick<EditableFieldProps, 'value' | 'isEditing' | 'onChange' | 'type' | 'suffix' | 'className'>) => {
  if (!isEditing) {
    return <span className={className}>{value}{suffix}</span>;
  }

  return (
    <Input
      type={type === 'currency' ? 'number' : type}
      value={value || ''}
      onChange={(e) => onChange?.(type === 'number' || type === 'currency' ? parseFloat(e.target.value) : e.target.value)}
      className="h-7 w-24 text-sm"
    />
  );
};
