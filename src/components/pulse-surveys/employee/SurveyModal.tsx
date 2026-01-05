import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SurveyModalProps {
  survey: {
    id: string;
    title: string;
    questions: {
      id: string;
      text: string;
      options: string[];
    }[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyModal = ({ survey, isOpen, onClose }: SurveyModalProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const { toast } = useToast();

  const currentQuestion = survey.questions[currentQuestionIndex];
  const totalQuestions = survey.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentAnswer = answers[currentQuestion?.id];

  const handleNext = () => {
    if (!currentAnswer) {
      toast({
        title: "Bitte wählen Sie eine Antwort",
        description: "Sie müssen eine Option auswählen, um fortzufahren.",
        variant: "destructive",
      });
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleSubmit = () => {
    // Here you would submit the answers to the backend
    toast({
      title: "Umfrage abgeschlossen",
      description: "Vielen Dank für Ihre Teilnahme!",
    });
    resetAndClose();
  };

  const handleCloseAttempt = () => {
    if (Object.keys(answers).length > 0) {
      setShowExitConfirm(true);
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowExitConfirm(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{survey.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Frage {currentQuestionIndex + 1} von {totalQuestions}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium leading-relaxed">
                {currentQuestion?.text}
              </h3>

              <RadioGroup
                value={currentAnswer}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestion?.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstQuestion}
            >
              Zurück
            </Button>
            <Button onClick={handleNext}>
              {isLastQuestion ? "Absenden" : "Weiter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Umfrage wirklich beenden?</AlertDialogTitle>
            <AlertDialogDescription>
              Ihre bisherigen Antworten gehen verloren, wenn Sie jetzt abbrechen.
              Möchten Sie die Umfrage wirklich beenden?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Weiter ausfüllen</AlertDialogCancel>
            <AlertDialogAction onClick={resetAndClose}>
              Ja, beenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
