import { EmploymentTabContent } from '../EmploymentTabContent';
import { EmployeeTabEditProps } from '@/types/employee-tab-props.types';

interface EmploymentTabProps extends EmployeeTabEditProps {}

export const EmploymentTab = (props: EmploymentTabProps) => {
  return <EmploymentTabContent {...props} />;
};
