import { ArrowDownRight, ArrowUpRight, BookOpen, Clock3 } from 'lucide-react';
import type { Book } from '@/api';

function shortDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function BookCard({ book, onTake, onReturn }: { book: Book; onTake: (book: Book) => void; onReturn: (book: Book) => void }) {
  const colorClass = book.status === 'available' ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground';
  return (
    <article data-testid={`card-book-${book.id}`} className="lift group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[22px] border border-card-border bg-card p-5 shadow-sm">
      <div className="absolute -right-5 -top-7 h-24 w-24 rounded-full border-[14px] border-primary/10 transition-transform duration-300 group-hover:scale-125" />
      <div>
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className={`rounded-full px-3 py-1.5 font-mono-ui text-[10px] font-bold uppercase tracking-[.12em] ${colorClass}`} data-testid={`status-book-${book.id}`}>
            {book.status === 'available' ? 'On the shelf' : 'In a good pair of hands'}
          </span>
          <BookOpen size={18} className="text-primary/70" />
        </div>
        <h3 data-testid={`text-book-title-${book.id}`} className="max-w-[230px] font-display text-[24px] font-semibold leading-[1.04] tracking-[-.025em]">{book.title}</h3>
        <p data-testid={`text-book-author-${book.id}`} className="mt-2 text-sm text-muted-foreground">{book.author}</p>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          <p className="font-mono-ui text-[10px] uppercase tracking-[.12em] text-foreground/55">{book.genre}</p>
          {book.status === 'reading' ? <p className="mt-1 flex items-center gap-1.5"><Clock3 size={12} /> back by {shortDate(book.dueAt)}</p> : <p className="mt-1">left {shortDate(book.addedAt)}</p>}
          <p className="mt-1">{book.readerCount ?? 0} {book.readerCount === 1 ? 'person has' : 'people have'} read this before</p>
          {book.nextReaderNote && <p className="mt-2 line-clamp-2 border-l-2 border-primary/30 pl-2 text-xs leading-4 text-foreground/75">“{book.nextReaderNote}”</p>}
        </div>
        {book.status === 'available' ? (
          <button type="button" data-testid={`button-take-book-${book.id}`} onClick={() => onTake(book)} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
            Take it <ArrowDownRight size={15} />
          </button>
        ) : (
          <button type="button" data-testid={`button-return-book-${book.id}`} onClick={() => onReturn(book)} className="flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-bold transition-colors hover:border-primary hover:text-primary">
            Return <ArrowUpRight size={15} />
          </button>
        )}
      </div>
    </article>
  );
}

export function BookCardSkeleton() {
  return <div className="shimmer h-[220px] rounded-[22px]" aria-label="Loading book" />;
}