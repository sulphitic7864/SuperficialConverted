import { ArrowRight, BookOpen, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Book } from '@/api';
import { useDialogBehavior } from './use-dialog-behavior';

export type BookReview = {
  rating?: number;
  nextReaderNote?: string;
  lovedThing?: string;
};

export type ActionDetails = BookReview & {
  name: string;
};

function isFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2 && parts.every((part) => part.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'-]/g, '').length >= 2);
}

export function ActionDialog({ book, mode, defaultName, pending, onClose, onConfirm }: { book: Book | null; mode: 'take' | 'return'; defaultName: string; pending: boolean; onClose: () => void; onConfirm: (details: ActionDetails) => void }) {
  const [name, setName] = useState(defaultName);
  const [rating, setRating] = useState<number | null>(null);
  const [nextReaderNote, setNextReaderNote] = useState('');
  const [lovedThing, setLovedThing] = useState('');
  const [nameError, setNameError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setName(defaultName); }, [defaultName, book]);
  useEffect(() => {
    setRating(null);
    setNextReaderNote('');
    setLovedThing('');
    setNameError('');
  }, [book, mode]);
  useDialogBehavior(!!book, dialogRef, onClose);
  if (!book) return null;
  const take = mode === 'take';
  const returnName = book.holderName ?? defaultName ?? 'A community member';
  const submit = () => {
    if (take && !isFullName(name)) {
      setNameError('Please enter your full name, including your first and last name.');
      return;
    }
    onConfirm({
      name: take ? name.trim() : returnName,
      rating: rating ?? undefined,
      nextReaderNote: nextReaderNote.trim() || undefined,
      lovedThing: lovedThing.trim() || undefined,
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-sidebar/45 p-3 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="max-h-[calc(100dvh-1.5rem)] w-full max-w-[450px] overflow-y-auto overscroll-contain rounded-[26px] border border-card-border bg-card p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><BookOpen size={20} /></div>
          <button type="button" data-testid="button-close-action-dialog" onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close dialog"><X size={19} /></button>
        </div>
        <p className="mt-6 font-mono-ui text-[10px] uppercase tracking-[.14em] text-primary">{take ? 'Take a book' : 'Return a book'}</p>
        <h2 id="dialog-title" className="mt-2 font-display text-3xl font-semibold tracking-[-.035em]">{take ? 'A story, now with you.' : 'Make room for its next reader.'}</h2>
         <p className="mt-2 text-sm leading-6 text-muted-foreground">{take ? <>You’re taking <strong className="font-semibold text-foreground">{book.title}</strong>. Enter your full name so neighbors know who is reading it.</> : <>Thank you for bringing <strong className="font-semibold text-foreground">{book.title}</strong> back to the shelf.</>}</p>
         <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="mt-6 space-y-4">
           {take && <div><label htmlFor="action-name" className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Your full name</label><input id="action-name" data-testid="input-action-name" value={name} onChange={(event) => { setName(event.target.value); setNameError(''); }} autoFocus maxLength={80} placeholder="e.g. Mina Thomas" className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30" />{nameError && <p data-testid="status-name-error" className="mt-2 text-xs text-destructive">{nameError}</p>}</div>}
           {!take && <><div><label htmlFor="action-rating" className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Rate this book <span className="font-normal normal-case tracking-normal">(optional)</span></label><select id="action-rating" data-testid="select-action-rating" value={rating ?? ''} onChange={(event) => setRating(event.target.value ? Number(event.target.value) : null)} className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"><option value="">Skip rating</option><option value="5">★★★★★ — Loved it</option><option value="4">★★★★☆ — Really liked it</option><option value="3">★★★☆☆ — It was good</option><option value="2">★★☆☆☆ — Not for me</option><option value="1">★☆☆☆☆ — Tough read</option></select></div><div><label htmlFor="action-next-reader-note" className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">A note for the next reader <span className="font-normal normal-case tracking-normal">(optional)</span></label><textarea id="action-next-reader-note" data-testid="input-action-next-reader-note" maxLength={280} value={nextReaderNote} onChange={(event) => setNextReaderNote(event.target.value)} placeholder="A spoiler-free thought to pass along…" className="mt-2 min-h-[72px] w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div><div><label htmlFor="action-loved-thing" className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">What did you love? <span className="font-normal normal-case tracking-normal">(optional)</span></label><textarea id="action-loved-thing" data-testid="input-action-loved-thing" maxLength={280} value={lovedThing} onChange={(event) => setLovedThing(event.target.value)} placeholder="One thing that stayed with you…" className="mt-2 min-h-[72px] w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div></>}
           <button type="submit" data-testid="button-confirm-action" disabled={pending || (take && !name.trim())} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? 'Saving this moment…' : take ? 'Take this book' : 'Return this book'} <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}