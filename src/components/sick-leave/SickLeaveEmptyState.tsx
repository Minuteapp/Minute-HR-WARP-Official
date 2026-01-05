
import { Card } from '@/components/ui/card';
import { ClipboardX } from 'lucide-react';

const SickLeaveEmptyState = () => {
  return (
    <Card className="p-10 flex flex-col items-center justify-center">
      <ClipboardX className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Keine Krankmeldungen</h3>
      <p className="text-gray-500 text-center mt-2 max-w-md">
        Es wurden noch keine Krankmeldungen erfasst. Wenn Sie krank sind, können Sie eine neue Krankmeldung erstellen.
      </p>
    </Card>
  );
};

export default SickLeaveEmptyState;
