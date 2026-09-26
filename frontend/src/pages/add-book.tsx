import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CirclePlus,
  Info,
  LibraryBig,
  Sparkles,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  getGetLibrarySummaryQueryKey,
  getListBooksQueryKey,
  useCreateBook,
  useTakeBook,
} from "@/api";

export default function AddBook() {
  const queryClient = useQueryClient();
  const createBook = useCreateBook();
  const takeBook = useTakeBook();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ title: "", author: "", genre: "" });
  const [nextReaderNote, setNextReaderNote] = useState("");
  const [addedTitle, setAddedTitle] = useState("");
  const [notice, setNotice] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;
    createBook.mutate(
      {
        data: {
          title: form.title.trim(),
          author: form.author.trim(),
          genre: form.genre.trim() || undefined,
          personName: window.localStorage.getItem("commonspine-name") || undefined,
          nextReaderNote: nextReaderNote.trim() || undefined,
        },
      },
      {
        onSuccess: (book) => {
          queryClient.invalidateQueries({
            queryKey: getListBooksQueryKey({ status: "all" }),
          });
          queryClient.invalidateQueries({
            queryKey: getGetLibrarySummaryQueryKey(),
          });
          setAddedTitle(book.title);
          setForm({ title: "", author: "", genre: "" });
          setNextReaderNote("");

          const pendingTakeValue = window.sessionStorage.getItem(
            "commonspine-pending-take",
          );
          if (!pendingTakeValue) return;
          window.sessionStorage.removeItem("commonspine-pending-take");
          try {
            const pendingTake = JSON.parse(pendingTakeValue) as {
              bookId: number;
              name: string;
            };
            takeBook.mutate(
              {
                bookId: pendingTake.bookId,
                data: { personName: pendingTake.name },
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: getListBooksQueryKey({ status: "all" }),
                  });
                  queryClient.invalidateQueries({
                    queryKey: getGetLibrarySummaryQueryKey(),
                  });
                  setLocation("/");
                },
                onError: () => {
                  setNotice(
                    "Your book was added, but the other book could not be taken. Please try again.",
                  );
                },
              },
            );
          } catch {
            setNotice("Your book was added, but the exchange could not be completed.");
          }
        },
        onError: () => setNotice("We could not add that book. Please try again."),
      },
    );
  };

  return (
    <div className="page-shell pb-14 pt-10 sm:pt-16">
      <Link
        href="/"
        data-testid="link-back-home"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to The Blue Library
      </Link>
      <section className="mt-9 grid gap-10 lg:grid-cols-[1fr_450px] lg:items-start lg:gap-20">
        <div>
          <p className="flex items-center gap-2 font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">
            <CirclePlus size={13} /> Leave a book
          </p>
          <h1
            data-testid="text-add-heading"
            className="mt-5 max-w-2xl font-display text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[.88] tracking-[-.06em]"
          >
            Give a book
            <br />
            <span className="text-primary">another life.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">
            Every book here arrives with a little invisible history. Add yours
            to the shared shelf and let the next reader write the next line.
          </p>
          <div className="mt-12 hidden border-l-2 border-accent pl-5 sm:block">
            <p className="font-display text-2xl leading-tight">
              “A book is a gift you can open again and again.”
            </p>
            <p className="mt-3 font-mono-ui text-[10px] uppercase tracking-[.14em] text-muted-foreground">
              — the shelf notes
            </p>
          </div>
        </div>

        <div className="rounded-[26px] border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <BookOpen size={21} />
            </div>
            <span className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-muted-foreground">
              takes 1 minute
            </span>
          </div>
          <h2 className="mt-7 font-display text-3xl font-semibold tracking-[-.03em]">
            What are you leaving?
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A few details help a neighbor spot the right story.
          </p>
          {addedTitle && (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm text-secondary-foreground">
              <Check size={16} /> {addedTitle} is on the shelf.
            </p>
          )}
          {notice && (
            <p role="status" className="mt-4 rounded-xl bg-secondary px-3 py-2 text-sm">
              {notice}
            </p>
          )}
          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="book-title" className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">
                Title
              </label>
              <input
                id="book-title"
                data-testid="input-book-title"
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="The name on the cover"
                className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label htmlFor="book-author" className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">
                Author
              </label>
              <input
                id="book-author"
                data-testid="input-book-author"
                required
                value={form.author}
                onChange={(event) => setForm({ ...form, author: event.target.value })}
                placeholder="Who wrote it?"
                className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label htmlFor="book-genre" className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">
                Genre <span className="font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="book-genre"
                data-testid="input-book-genre"
                value={form.genre}
                onChange={(event) => setForm({ ...form, genre: event.target.value })}
                placeholder="Fiction, essays, poetry…"
                className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label htmlFor="book-next-reader-note" className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">
                Message for the next reader <span className="font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                id="book-next-reader-note"
                data-testid="input-book-next-reader-note"
                maxLength={280}
                value={nextReaderNote}
                onChange={(event) => setNextReaderNote(event.target.value)}
                placeholder="Share a spoiler-free thought…"
                className="mt-2 min-h-[96px] w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <button
              type="submit"
              data-testid="button-submit-book"
              disabled={createBook.isPending || takeBook.isPending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground disabled:opacity-50"
            >
              {createBook.isPending || takeBook.isPending ? "Saving…" : "Leave this book"}
              <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </section>
      <section className="mt-14 grid gap-4 border-t border-border pt-8 sm:grid-cols-3">
        <div className="flex gap-3">
          <LibraryBig size={18} className="mt-1 shrink-0 text-primary" />
          <div><h3 className="text-sm font-bold">One shared shelf</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">No gatekeeping, no sign-up, just good books.</p></div>
        </div>
        <div className="flex gap-3">
          <Info size={18} className="mt-1 shrink-0 text-primary" />
          <div><h3 className="text-sm font-bold">Keep it honest</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Use the title and author printed on the cover.</p></div>
        </div>
        <div className="flex gap-3">
          <Sparkles size={18} className="mt-1 shrink-0 text-primary" />
          <div><h3 className="text-sm font-bold">Pass it forward</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">The next chapter starts with your small gesture.</p></div>
        </div>
      </section>
    </div>
  );
}