import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

/**
 * Themed confirm dialog — drop-in replacement for window.confirm.
 *
 * Usage:
 *   const { confirmDialog, ConfirmDialogUI } = useConfirm();
 *   // In JSX: <ConfirmDialogUI />
 *   // To trigger: const ok = await confirmDialog({ title, message, confirmLabel, variant })
 */
export function useConfirm() {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    variant: 'destructive', // 'destructive' | 'default'
    resolve: null,
  });

  const confirmDialog = useCallback(
    ({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', variant = 'destructive' } = {}) => {
      return new Promise((resolve) => {
        setState({ open: true, title, message, confirmLabel, variant, resolve });
      });
    },
    []
  );

  const handleClose = (result) => {
    state.resolve?.(result);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  };

  const ConfirmDialogUI = () => (
    <Dialog open={state.open} onOpenChange={(open) => { if (!open) handleClose(false); }}>
      <DialogContent className="sm:max-w-[420px] bg-white dark:bg-card border dark:border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            {state.variant === 'destructive' ? (
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            )}
            <DialogTitle className="text-gray-900 dark:text-foreground text-base font-semibold leading-snug">
              {state.title}
            </DialogTitle>
          </div>
          {state.message && (
            <DialogDescription className="text-gray-600 dark:text-muted-foreground text-sm pl-[52px]">
              {state.message}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            className="dark:border-border dark:text-foreground"
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            variant={state.variant}
            className={
              state.variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
            }
            onClick={() => handleClose(true)}
          >
            {state.confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return { confirmDialog, ConfirmDialogUI };
}
