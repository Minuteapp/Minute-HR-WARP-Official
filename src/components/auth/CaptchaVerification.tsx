import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CaptchaVerificationProps {
  onVerify: (isValid: boolean) => void;
  disabled?: boolean;
}

export const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({ 
  onVerify, 
  disabled = false 
}) => {
  const [captchaQuestion, setCaptchaQuestion] = useState<string>('');
  const [captchaAnswer, setCaptchaAnswer] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const generateCaptcha = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number, question: string;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2} = ?`;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
        question = '1 + 1 = ?';
    }
    
    setCaptchaQuestion(question);
    setCaptchaAnswer(answer);
    setUserAnswer('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const userNum = parseInt(userAnswer);
    const isCorrect = !isNaN(userNum) && userNum === captchaAnswer;
    setIsVerified(isCorrect);
    onVerify(isCorrect);
  }, [userAnswer, captchaAnswer, onVerify]);

  const handleRefresh = () => {
    generateCaptcha();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Sicherheitsabfrage
      </label>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-50 border border-gray-300 rounded-md p-3">
          <div className="text-center">
            <span className="text-lg font-mono font-semibold text-gray-800">
              {captchaQuestion}
            </span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={disabled}
          className="p-2"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Ihre Antwort"
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {userAnswer && (
          <div className="text-sm">
            {isVerified ? (
              <span className="text-green-600 font-medium">✓ Richtig</span>
            ) : (
              <span className="text-red-600 font-medium">✗ Falsch, versuchen Sie es erneut</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};