import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  User, 
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

interface UserOnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Willkommen bei MINUTE!',
    description: 'Wir freuen uns, Sie an Bord zu haben. In wenigen Schritten zeigen wir Ihnen die wichtigsten Funktionen unserer HR-Plattform.',
    tip: 'Diese Tour dauert nur 2-3 Minuten.',
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Ihr Dashboard',
    description: 'Das Dashboard ist Ihre Zentrale. Hier sehen Sie auf einen Blick Ihre wichtigsten Informationen: anstehende Termine, Zeiterfassung und Team-Updates.',
    tip: 'Sie können die Widgets nach Ihren Wünschen anpassen.',
  },
  {
    id: 'time',
    icon: Clock,
    title: 'Zeiterfassung',
    description: 'Erfassen Sie Ihre Arbeitszeiten mit nur einem Klick. Starten und stoppen Sie den Timer oder tragen Sie Zeiten manuell nach.',
    tip: 'Der Timer läuft auch im Hintergrund weiter.',
  },
  {
    id: 'absence',
    icon: Calendar,
    title: 'Abwesenheiten',
    description: 'Beantragen Sie Urlaub, melden Sie sich krank oder planen Sie Homeoffice-Tage. Alles an einem Ort, transparent und nachvollziehbar.',
    tip: 'Ihr Resturlaub wird automatisch berechnet.',
  },
  {
    id: 'profile',
    icon: User,
    title: 'Ihr Profil',
    description: 'Halten Sie Ihre persönlichen Daten aktuell. Fügen Sie ein Foto hinzu und passen Sie Ihre Benachrichtigungseinstellungen an.',
    tip: 'Ein vollständiges Profil hilft Ihrem Team.',
  },
  {
    id: 'help',
    icon: HelpCircle,
    title: 'Hilfe & Support',
    description: 'Sie haben Fragen? Nutzen Sie den Helpdesk für Support-Anfragen oder durchsuchen Sie unsere Wissensdatenbank.',
    tip: 'Der KI-Assistent ist 24/7 für Sie da.',
  },
];

export function UserOnboardingWizard({ isOpen, onComplete, onSkip }: UserOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'w-6 bg-white' 
                      : index < currentStep 
                        ? 'w-2 bg-white/80' 
                        : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Überspringen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-muted-foreground text-center mb-4 leading-relaxed">
                {step.description}
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">💡 Tipp:</span> {step.tip}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirstStep}
            className={isFirstStep ? 'invisible' : ''}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentStep + 1} von {steps.length}
          </span>

          <Button onClick={handleNext}>
            {isLastStep ? (
              <>
                Los geht's
                <Sparkles className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Weiter
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Skip link */}
        {!isLastStep && (
          <div className="pb-4 text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Tour überspringen
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
