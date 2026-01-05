import { CountrySelect } from "./country-select";

interface NationalitySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function NationalitySelect({ value, onValueChange, disabled, placeholder = "Nationalität auswählen" }: NationalitySelectProps) {
  return (
    <CountrySelect 
      value={value} 
      onValueChange={onValueChange} 
      disabled={disabled} 
      placeholder={placeholder} 
    />
  );
}