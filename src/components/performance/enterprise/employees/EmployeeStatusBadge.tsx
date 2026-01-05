import { Badge } from "@/components/ui/badge";

interface EmployeeStatusBadgeProps {
  status: 'critical' | 'normal' | 'excellent';
}

export const EmployeeStatusBadge = ({ status }: EmployeeStatusBadgeProps) => {
  const config = {
    critical: { label: 'Kritisch', className: 'bg-red-100 text-red-700 border-red-200' },
    normal: { label: 'Normal', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    excellent: { label: 'Sehr gut', className: 'bg-green-100 text-green-700 border-green-200' }
  };

  const { label, className } = config[status];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
