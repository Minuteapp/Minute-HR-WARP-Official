import React from 'react';
import AIVoiceAssistant from '@/components/ai/AIVoiceAssistant';

const VoiceAssistantPage: React.FC = () => {
  const handleFunctionCall = (functionName: string, args: any, result: any) => {
    console.log('Voice Assistant Function Call:', { functionName, args, result });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <AIVoiceAssistant onFunctionCall={handleFunctionCall} />
      </div>
    </div>
  );
};

export default VoiceAssistantPage;