import { ArrowLeft, ArrowRight, BookOpen, Check, CirclePlus, Info, LibraryBig, Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { getGetLibrarySummaryQueryKey, getListBooksQueryKey, useCreateBook } from '@/api';

const genreSuggestions = ['Fiction', 'Memoir', 'Essays', 'Poetry', 'History', 'Children'];

export default function AddBook() {
  const queryClient = useQueryClient();
  const createBook = useCreateBook();
  const [form, setForm] = useState({ title: '', author: '', genre: '' });
  const [rating, setRating] = useState<number | null>(null);
  const [nextReaderNote, setNextReaderNote] = useState('');
  const [lovedThing, setLovedThing] = useState('');
  const [addedTitle, setAddedTitle] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.genre.trim()) return;
    createBook.mutate({ data: {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim(),
      personName: window.localStorage.getItem('commonspine-name') || undefined,
      rating: rating ?? undefined,
      nextReaderNote: nextReaderNote.trim() || undefined,
      lovedThing: lovedThing.trim() || undefined,
    } }, {
      onSuccess: (book) => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey({ status: 'all' }) });
        queryClient.invalidateQueries({ queryKey: getGetLibrarySummaryQueryKey() });
        setAddedTitle(book.title);
        setForm({ title: '', author: '', genre: '' });
        setRating(null);
        setNextReaderNote('');
        setLovedThing('');
      },
    });
  };
  return (
    <div className="page-shell pb-14 pt-10 sm:pt-16">
      <Link href="/" data-testid="link-back-home" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"><ArrowLeft size={16} /> Back to The Blue Library</Link>
      <section className="mt-9 grid gap-10 lg:grid-cols-[1fr_450px] lg:items-start lg:gap-20">
        <div><p className="flex items-center gap-2 font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary"><CirclePlus size={13} /> Leave a book</p><h1 data-testid="text-add-heading" className="mt-5 max-w-2xl font-display text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[.88] tracking-[-.06em]">Give a book<br /><span className="text-primary">another life.</span></h1><p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">Every book here arrives with a little invisible history. Add yours to the shared shelf and let the next reader write the next line.</p><div className="mt-12 hidden border-l-2 border-accent pl-5 sm:block"><p className="font-display text-2xl leading-tight">“A book is a gift you can open again and again.”</p><p className="mt-3 font-mono-ui text-[10px] uppercase tracking-[.14em] text-muted-foreground">— the shelf notes</p></div></div>
        <div className="rounded-[26px] border border-border bg-card p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><BookOpen size={21} /></div><span className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-muted-foreground">takes 1 minute</span></div><h2 className="mt-7 font-display text-3xl font-semibold tracking-[-.03em]">What are you leaving?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">A few details help a neighbor spot the right story.</p><form onSubmit={submit} className="mt-7 space-y-5"><div><label htmlFor="book-title" className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">Title</label><input id="book-title" data-testid="input-book-title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="The name on the cover" className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div><div><label htmlFor="book-author" className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">Author</label><input id="book-author" data-testid="input-book-author" required value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} placeholder="Who wrote it?" className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div><div><label htmlFor="book-genre" className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">Genre</label><input id="book-genre" data-testid="input-book-genre" required value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value })} placeholder="Fiction, essays, poetry…" className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" /><div className="mt-2 flex flex-wrap gap-1.5">{genreSuggestions.map((genre) => <button type="button" key={genre} data-testid={`button-genre-${genre.toLowerCase()}`} onClick={() => setForm({ ...form, genre })} className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${form.genre === genre ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/60'}`}>{genre}</button>)}</div></div><div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">Optional book note</p><div className="mt-3 grid gap-4 sm:grid-cols-2"><div><label htmlFor="book-rating" className="text-xs text-muted-foreground">Rating</label><select id="book-rating" data-testid="select-book-rating" value={rating ?? ''} onChange={(event) => setRating(event.target.value ? Number(event.target.value) : null)} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"><option value="">Skip</option><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></div><div className="sm:col-span-2"><label htmlFor="book-next-reader-note" className="text-xs text-muted-foreground">A note for the next reader</label><textarea id="book-next-reader-note" data-testid="input-book-next-reader-note" maxLength={280} value={nextReaderNote} onChange={(event) => setNextReaderNote(event.target.value)} placeholder="Optional — share a spoiler-free thought…" className="mt-1.5 min-h-[74px] w-full resize-y rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div><div className="sm:col-span-2"><label htmlFor="book-loved-thing" className="text-xs text-muted-foreground">One thing you loved</label><textarea id="book-loved-thing" data-testid="input-book-loved-thing" maxLength={280} value={lovedThing} onChange={(event) => setLovedThing(event.target.value)} placeholder="Optional — share a favorite detail…" className="mt-1.5 min-h-[74px] w-full resize-y rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div></div></div><button type="submit" data-testid="button-submit-book" disabled={createBook.isPending || !form.title.trim() || !form.author.trim() || !form.genre.trim()} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground disabled:opacity-55">{createBook.isPending ? 'Making room on the shelf…' : 'Leave this book' } <ArrowRight size={16} /></button></form>{createBook.isError && <p data-testid="status-add-error" className="mt-4 text-sm text-destructive">We could not add that book yet. Please try again.</p>}{addedTitle && <div data-testid="status-add-success" className="mt-5 flex gap-3 rounded-xl bg-secondary px-4 py-3 text-sm leading-5 text-secondary-foreground"><Check size={17} className="mt-0.5 shrink-0" /> <span><strong>{addedTitle}</strong> is now waiting for its next reader.</span></div>}</div>
      </section>
      <section className="mt-14 grid gap-4 border-t border-border pt-8 sm:grid-cols-3"><div className="flex gap-3"><LibraryBig size={18} className="mt-1 shrink-0 text-primary" /><div><h3 className="text-sm font-bold">One shared shelf</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">No gatekeeping, no sign-up, just good books.</p></div></div><div className="flex gap-3"><Info size={18} className="mt-1 shrink-0 text-primary" /><div><h3 className="text-sm font-bold">Keep it honest</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Use the title and author printed on the cover.</p></div></div><div className="flex gap-3"><Sparkles size={18} className="mt-1 shrink-0 text-primary" /><div><h3 className="text-sm font-bold">Pass it forward</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">The next chapter starts with your small gesture.</p></div></div></section>
    </div>
  );
}