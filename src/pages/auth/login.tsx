import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, loading } = useAuth();
  // Entfernt: Kein automatischer Redirect mehr via useEffect

  // Loading state während der Authentifizierung
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Nicht mehr nach Login redirecten - useEffect kümmert sich darum
  // Zeige Login-Seite auch wenn user existiert (für den kurzen Moment vor dem Redirect)

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('🔄 Login-Versuch gestartet für:', email);

    try {
      if (isRegistering) {
        // Bei der Registrierung Standardrolle 'employee' verwenden
        await signUp(email, password, 'employee');
        toast({
          title: "Registrierung erfolgreich",
          description: "Bitte überprüfen Sie Ihre E-Mails für weitere Anweisungen.",
        });
        setIsRegistering(false);
      } else {
        await signIn(email, password);
        console.log('✅ Login erfolgreich - Weiterleitung zum Dashboard');
        // Direkter Redirect nach erfolgreichem Login
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.",
      });
    } finally {
      console.log('🏁 Login-Versuch beendet');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-card shadow-card-elevated border border-border/50 backdrop-blur-sm">
        <div className="text-center">
          <img src="/lovable-uploads/30ec8215-e67e-43c7-a4d7-b6f30eca644a.png" alt="Logo" className="h-12 mx-auto mb-6 drop-shadow-sm" />
          <h2 className="text-2xl font-bold text-foreground">
            {isRegistering ? 'Account erstellen' : 'Willkommen zurück'}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {isRegistering 
              ? 'Erstellen Sie einen Account um fortzufahren' 
              : 'Bitte melden Sie sich mit Ihren Zugangsdaten an'}
          </p>
        </div>

        <form onSubmit={handleAuthentication} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              E-Mail-Adresse
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@firma.de"
                className="pl-10"
                required
              />
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Passwort
            </label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                required
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {!isRegistering && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground">
                  Angemeldet bleiben
                </label>
              </div>
              <button
                type="button"
                onClick={() => navigate('/auth/reset-password')}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Passwort vergessen?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading 
              ? (isRegistering ? "Account wird erstellt..." : "Wird angemeldet...") 
              : (isRegistering ? "Account erstellen" : "Anmelden")}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            {isRegistering ? 'Bereits einen Account?' : 'Noch kein Konto?'}{' '}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {isRegistering ? 'Anmelden' : 'Registrieren'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
