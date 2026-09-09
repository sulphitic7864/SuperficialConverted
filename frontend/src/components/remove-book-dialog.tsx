import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Book } from '@/api';
import { useDialogBehavior } from './use-dialog-behavior';

type RemoveBookDialogProps = {
  open: boolean;
  books: Book[];
  pending: boolean;
  onClose: () => void;
  onConfirm: (book: Book) => void;
};

export function RemoveBookDialog({ open, books, pending, onClose, onConfirm }: RemoveBookDialogProps) {
  const [selectedId, setSelectedId] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const selectedBook = books.find((book) => String(book.id) === selectedId);

  useEffect(() => {
    if (open) setSelectedId('');
  }, [open]);

  useDialogBehavior(open, dialogRef, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-sidebar/45 p-3 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="remove-dialog-title" className="max-h-[calc(100dvh-1.5rem)] w-full max-w-[450px] overflow-y-auto overscroll-contain rounded-[26px] border border-card-border bg-card p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle size={20} /></div>
          <button type="button" data-testid="button-close-remove-dialog" onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close remove book dialog"><X size={19} /></button>
        </div>
        <p className="mt-6 font-mono-ui text-[10px] uppercase tracking-[.14em] text-destructive">Admin shelf care</p>
        <h2 id="remove-dialog-title" className="mt-2 font-display text-3xl font-semibold tracking-[-.035em]">Remove a book.</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Use this only when a book is no longer on the shelf or should be deleted. This cannot be undone.</p>
        <label htmlFor="remove-book-select" className="mt-6 block text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">Book to remove</label>
        <select id="remove-book-select" data-testid="select-remove-book" autoFocus value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30">
          <option value="">Select a book</option>
          {books.map((book) => <option key={book.id} value={book.id}>{book.title} — {book.author}</option>)}
        </select>
        <button type="button" data-testid="button-confirm-remove-book" disabled={!selectedBook || pending} onClick={() => selectedBook && onConfirm(selectedBook)} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-destructive font-bold text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? 'Removing…' : 'Remove this book'} <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}