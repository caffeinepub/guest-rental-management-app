import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useValidateOwnerPin } from '../hooks/useQueries';

interface OwnerPinPromptProps {
  onSuccess: () => void;
}

export default function OwnerPinPrompt({ onSuccess }: OwnerPinPromptProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validatePin = useValidateOwnerPin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setErrorMsg('');
    try {
      const isValid = await validatePin.mutateAsync(pin);
      if (isValid) {
        onSuccess();
      } else {
        setErrorMsg('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch {
      setErrorMsg('Unable to verify PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-sm">
        {/* Icon badge */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center shadow-card">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-2xl text-foreground">Owner Access</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your owner PIN to access the dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="owner-pin" className="text-sm font-semibold">
                  Owner PIN
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="owner-pin"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Enter PIN"
                    className="pl-9 pr-10 font-mono tracking-widest"
                    autoFocus
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errorMsg}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full font-semibold gap-2"
                disabled={!pin.trim() || validatePin.isPending}
              >
                {validatePin.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Unlock Dashboard
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          This area is restricted to property owners only.
        </p>
      </div>
    </div>
  );
}
