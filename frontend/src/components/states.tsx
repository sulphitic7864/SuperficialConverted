import { AlertTriangle, BookOpen, RefreshCw, SearchX } from 'lucide-react';

export function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return <div className="rounded-[22px] border border-destructive/25 bg-destructive/5 p-7 text-center" data-testid="state-error"><AlertTriangle className="mx-auto text-destructive" size={25} /><h3 className="mt-3 font-display text-2xl font-semibold">The shelf is taking a breather.</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{message ?? 'We could not reach the library just now. Your place is still held.'}</p><button type="button" data-testid="button-retry" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary"><RefreshCw size={14} /> Try again</button></div>;
}

export function EmptyState({ title, message, requests = false }: { title: string; message: string; requests?: boolean }) {
  return <div className="rounded-[22px] border border-dashed border-border bg-card/55 px-6 py-12 text-center" data-testid={`state-empty-${requests ? 'requests' : 'books'}`}><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">{requests ? <SearchX size={21} /> : <BookOpen size={21} />}</div><h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">{message}</p></div>;
}