import React from 'react';
import DocumentTabContent from '../details/DocumentTabContent';

interface DocumentsTabProps {
  employeeId: string;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ employeeId }) => {
  return <DocumentTabContent employeeId={employeeId} />;
};

export default DocumentsTab;