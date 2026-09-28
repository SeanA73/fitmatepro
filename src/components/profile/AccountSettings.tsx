import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PauseCircle, PlayCircle, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAccountStatus } from '@/hooks/useAccountStatus';

const CONFIRM_WORD = 'DELETE';

export const AccountSettings = () => {
  const { user } = useAuth();
  const { isPaused, working, pauseAccount, reactivateAccount, deleteAccount } = useAccountStatus();

  const [pauseOpen, setPauseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const email = user?.email ?? '';

  // Either the literal word or the account's own email address. Both are things
  // the user has to type deliberately; neither can be produced by a stray click
  // or an over-eager Enter key.
  const confirmed =
    confirmText.trim() === CONFIRM_WORD ||
    (email.length > 0 && confirmText.trim().toLowerCase() === email.toLowerCase());

  const closeDelete = (open: boolean) => {
    setDeleteOpen(open);
    if (!open) setConfirmText('');
  };

  const handleDelete = async () => {
    const ok = await deleteAccount();
    // On success deleteAccount signs out and navigates away, so there is nothing
    // to clean up. On failure the dialog stays open with the toast explaining
    // why, and the account still exists.
    if (!ok) setConfirmText('');
  };

  return (
    <div className="space-y-6">
      {/* Pause — the non-destructive option, presented first and on equal
          footing so deletion is not the only visible way out. */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPaused ? <PlayCircle className="w-5 h-5" /> : <PauseCircle className="w-5 h-5" />}
            {isPaused ? 'Your account is paused' : 'Take a break'}
          </CardTitle>
          <CardDescription>
            {isPaused
              ? 'Nothing has been deleted. Reactivate whenever you are ready and everything will be exactly where you left it.'
              : 'Pausing hides the app and stops reminders. Your workouts, meals and check-ins are kept, and you can come back at any time.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPaused ? (
            <Button onClick={reactivateAccount} disabled={working}>
              <PlayCircle className="w-4 h-4 mr-2" />
              Reactivate my account
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setPauseOpen(true)} disabled={working}>
              <PauseCircle className="w-4 h-4 mr-2" />
              Pause my account
            </Button>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Danger zone. Its own card, destructive border and heading, placed last
          and below a separator so it cannot be mistaken for ordinary settings. */}
      <Card className="border-2 border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete account
          </CardTitle>
          <CardDescription>
            This deletes your account and all of your data straight away. It cannot be undone,
            and there is no recovery period — if you come back later, you will be starting from
            scratch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={working}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete my account
          </Button>
        </CardContent>
      </Card>

      {/* Pause confirmation — light, because pause is reversible. */}
      <AlertDialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause your account?</AlertDialogTitle>
            <AlertDialogDescription>
              The app will be hidden until you reactivate. Nothing is deleted, and you can
              undo this yourself at any time by signing in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Never mind</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await pauseAccount();
                setPauseOpen(false);
              }}
            >
              Pause my account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation — typed, and the action stays disabled until it
          matches, so there is no path to deletion that is one click wide. */}
      <AlertDialog open={deleteOpen} onOpenChange={closeDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete your account permanently?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  This happens immediately and it is permanent. We delete your profile, every
                  workout and session, your meals and nutrition history, your wellness
                  check-ins, your goals, your saved plans and your settings.
                </p>
                <p>
                  <strong>There is no undo and no grace period.</strong> We cannot restore any
                  of it afterwards, and support cannot either. If you sign up again with the
                  same email address, you will be starting fresh with nothing.
                </p>
                <p className="text-muted-foreground">
                  One exception: records of payments you have made are kept, with your identity
                  removed from them, because tax law requires us to retain them.
                </p>
                <p className="text-muted-foreground">
                  If you only want a break, close this and use <strong>Pause my account</strong>{' '}
                  instead — that keeps everything and is reversible.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono font-semibold">{CONFIRM_WORD}</span> to confirm
              {email ? <> (or your email address)</> : null}
            </Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              // Enter must not submit: the typed value is the only safeguard and
              // a keypress should not be able to bypass reading the warning.
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep my account</AlertDialogCancel>
            <AlertDialogAction
              disabled={!confirmed || working}
              onClick={(event) => {
                // AlertDialogAction closes the dialog on click by default. Keep
                // it open so the failure toast is not shown against an empty
                // screen, and so a failed delete does not look like a success.
                event.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {working ? 'Deleting…' : 'Delete my account forever'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountSettings;
