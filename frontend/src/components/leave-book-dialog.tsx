import { ArrowRight, BookOpen, Check, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Book } from '@/api';
import type { BookReview } from './action-dialog';
import { useDialogBehavior } from './use-dialog-behavior';

type LeaveBookDialogProps = {
  open: boolean;
  name: string;
  books: Book[];
  loading: boolean;
  pending: boolean;
  onClose: () => void;
  onChooseExisting: (book: Book, review: BookReview) => void;
  onAddNew: () => void;
};

export function LeaveBookDialog({
  open,
  name,
  books,
  loading,
  pending,
  onClose,
  onChooseExisting,
  onAddNew,
}: LeaveBookDialogProps) {
  const [selectedId, setSelectedId] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [nextReaderNote, setNextReaderNote] = useState('');
  const [lovedThing, setLovedThing] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSelectedId('');
      setRating(null);
      setNextReaderNote('');
      setLovedThing('');
    }
  }, [open]);

  useDialogBehavior(open, dialogRef, onClose);
  if (!open) return null;

  const selectedBook = books.find((book) => String(book.id) === selectedId);
  const review = { rating: rating ?? undefined, nextReaderNote: nextReaderNote.trim() || undefined, lovedThing: lovedThing.trim() || undefined };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-sidebar/45 p-3 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title" className="max-h-[calc(100dvh-1rem)] w-full max-w-[470px] overflow-y-auto overscroll-contain rounded-[26px] border border-card-border bg-card p-4 shadow-2xl sm:max-h-[calc(100dvh-1.5rem)] sm:p-8">
        <div className="flex items-start justify-between">
           <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
             <Check size={18} />
          </div>
          <button type="button" data-testid="button-close-leave-dialog" onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close leave a book dialog">
            <X size={19} />
          </button>
        </div>
         <p className="mt-4 font-mono-ui text-[10px] uppercase tracking-[.14em] text-primary">One more thoughtful step</p>
         <h2 id="leave-dialog-title" className="mt-1.5 font-display text-2xl font-semibold tracking-[-.035em] sm:text-3xl">Leave a book before you go.</h2>
         <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
           Thanks, {name || 'neighbor'}. You can return a book you have borrowed before, or add a new one.
        </p>

         <div className="mt-4 rounded-2xl border border-border bg-background p-3">
          <label htmlFor="leave-existing-book" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">
             <BookOpen size={14} className="text-primary" /> Choose a book you borrowed before
          </label>
          <select
            id="leave-existing-book"
            data-testid="select-leave-existing-book"
             autoFocus
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
             className="mt-2 h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          >
             <option value="">Select a book to leave</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} — {book.author}
              </option>
            ))}
          </select>
          <button
            type="button"
            data-testid="button-confirm-leave-existing"
             disabled={!selectedBook || loading || pending}
             onClick={() => selectedBook && onChooseExisting(selectedBook, review)}
             className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-45"
          >
            {pending ? 'Saving this exchange…' : 'Leave this book'} <ArrowRight size={16} />
          </button>
           {loading && <p className="mt-3 text-xs leading-5 text-muted-foreground">Checking your previous borrowing history…</p>}
           {!loading && books.length === 0 && <p className="mt-3 text-xs leading-5 text-muted-foreground">You have not borrowed another book here before, so add a new title to leave one.</p>}
        </div>

         <div className="my-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
         <button type="button" data-testid="button-add-new-after-take" onClick={onAddNew} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold transition-colors hover:border-primary hover:text-primary">
          <Plus size={17} /> Add a new book to the library
        </button>

         <div className="mt-3 rounded-2xl border border-border bg-background p-3">
           <p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">Optional book note</p>
           <div className="mt-2 grid gap-2.5">
             <div><label htmlFor="leave-rating" className="text-xs text-muted-foreground">Rating</label><select id="leave-rating" data-testid="select-leave-rating" value={rating ?? ''} onChange={(event) => setRating(event.target.value ? Number(event.target.value) : null)} className="mt-1 h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"><option value="">Skip rating</option><option value="5">★★★★★ — Loved it</option><option value="4">★★★★☆ — Really liked it</option><option value="3">★★★☆☆ — It was good</option><option value="2">★★☆☆☆ — Not for me</option><option value="1">★☆☆☆☆ — Tough read</option></select></div>
             <div><label htmlFor="leave-next-reader-note" className="text-xs text-muted-foreground">A note for the next reader</label><textarea id="leave-next-reader-note" data-testid="input-leave-next-reader-note" maxLength={280} value={nextReaderNote} onChange={(event) => setNextReaderNote(event.target.value)} placeholder="Optional — share a spoiler-free thought…" className="mt-1 min-h-[52px] w-full resize-y rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
             <div><label htmlFor="leave-loved-thing" className="text-xs text-muted-foreground">One thing you loved</label><textarea id="leave-loved-thing" data-testid="input-leave-loved-thing" maxLength={280} value={lovedThing} onChange={(event) => setLovedThing(event.target.value)} placeholder="Optional — share a favorite detail…" className="mt-1 min-h-[52px] w-full resize-y rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
           </div>
         </div>
      </div>
    </div>
  );
}