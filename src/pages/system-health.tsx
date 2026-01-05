import React from 'react';
import { SystemHealthStatus } from '@/components/SystemHealthStatus';

const SystemHealthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            System-Gesundheitsstatus
          </h1>
          <p className="text-muted-foreground mt-2">
            Überwachung aller Systemmodule und deren Abhängigkeiten
          </p>
        </div>

        <SystemHealthStatus />
      </div>
    </div>
  );
};

export default SystemHealthPage;