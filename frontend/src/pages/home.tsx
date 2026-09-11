declare module "react/jsx-runtime" {
  export const Fragment: any;
  export function jsx(...args: any[]): any;
  export function jsxs(...args: any[]): any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

import {
  CircleHelp,
  Clock3,
  LibraryBig,
  Plus,
  Quote,
  Radio,
  RotateCcw,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  getGetLibrarySummaryQueryKey,
  getListBooksQueryKey,
  type ActivityItem,
  type Book,
  useDeleteBook,
  useGetLibrarySummary,
  useHealthCheck,
  useListBooks,
  useReturnBook,
  useTakeBook,
} from "@/api";
import { ActionDialog, type ActionDetails } from "@/components/action-dialog";
import { RemoveBookDialog } from "@/components/remove-book-dialog";
import { BookCard, BookCardSkeleton } from "@/components/book-card";
import { LeaveBookDialog } from "@/components/leave-book-dialog";
import { EmptyState, ErrorState } from "@/components/states";

function relativeDate(value: string) {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 86400000),
  );
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function activityCopy(item: ActivityItem) {
  if (item.type === "taken")
    return (
      <>
        <strong>{item.personName}</strong> took{" "}
        <strong>{item.bookTitle}</strong> for a spin
      </>
    );
  if (item.type === "returned")
    return (
      <>
        <strong>{item.personName}</strong> returned{" "}
        <strong>{item.bookTitle}</strong> to the shelf
      </>
    );
  if (item.type === "added")
    return (
      <>
        <strong>{item.personName}</strong> left{" "}
        <strong>{item.bookTitle}</strong> here
      </>
    );
  return (
    <>
      <strong>{item.personName}</strong> is looking for{" "}
      <strong>{item.bookTitle}</strong>
    </>
  );
}

function StatStrip({
  total,
  available,
  reading,
}: {
  total: number;
  available: number;
  reading: number;
}) {
  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-[20px] border border-border bg-card/70 shadow-sm">
      <div className="px-4 py-4 sm:px-6">
        <p className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-muted-foreground">
          on the shelves
        </p>
        <p
          data-testid="text-stat-total"
          className="mt-1 font-display text-3xl font-semibold"
        >
          {total}
        </p>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <p className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-muted-foreground">
          ready to go
        </p>
        <p
          data-testid="text-stat-available"
          className="mt-1 font-display text-3xl font-semibold text-primary"
        >
          {available}
        </p>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <p className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-muted-foreground">
          out exploring
        </p>
        <p
          data-testid="text-stat-reading"
          className="mt-1 font-display text-3xl font-semibold"
        >
          {reading}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const booksQuery = useListBooks({ status: "all" });
  const summaryQuery = useGetLibrarySummary();
  const healthQuery = useHealthCheck();
  const takeMutation = useTakeBook();
  const returnMutation = useReturnBook();
  const deleteMutation = useDeleteBook();
  const [name, setName] = useState(
    () => window.localStorage.getItem("commonspine-name") ?? "",
  );
  const [dialog, setDialog] = useState<{
    book: Book;
    mode: "take" | "return";
  } | null>(null);
  const [leaveStep, setLeaveStep] = useState<{ name: string } | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const books = booksQuery.data?.length ? booksQuery.data : [];
  const available = useMemo(
    () => books?.filter((book) => book.status === "available"),
    [books],
  );
  const reading = useMemo(
    () => books?.filter((book) => book.status === "reading"),
    [books],
  );
  const eligibleLeaveQuery = useListBooks({
    status: "reading",
    borrowedBy: name || "__no_name__",
  });
  const summary = summaryQuery.data;
  const busy = takeMutation.isPending || returnMutation.isPending;

  const finishReturn = (
    book: Book,
    details: ActionDetails,
    closeLeaveStep = false,
  ) => {
    returnMutation.mutate(
      {
        bookId: book.id,
        data: {
          personName: details.name,
          rating: details.rating,
          nextReaderNote: details.nextReaderNote,
          lovedThing: details.lovedThing,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListBooksQueryKey({ status: "all" }),
          });
          queryClient.invalidateQueries({
            queryKey: getGetLibrarySummaryQueryKey(),
          });
          window.localStorage.setItem("commonspine-name", details.name);
          setName(details.name);
          if (closeLeaveStep) setLeaveStep(null);
          setDialog(null);
          setNotice(`${book.title} is back on the shelf.`);
        },
        onError: () =>
          setNotice("That moment did not save. Please try once more."),
      },
    );
  };

  const completeAction = (details: ActionDetails) => {
    if (!dialog) return;
    const currentDialog = dialog;
    if (currentDialog.mode === "return") {
      finishReturn(currentDialog.book, details);
      return;
    }
    const mutation = takeMutation;
    mutation.mutate(
      { bookId: dialog.book.id, data: { personName: details.name } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListBooksQueryKey({ status: "all" }),
          });
          queryClient.invalidateQueries({
            queryKey: getListBooksQueryKey({
              status: "reading",
              borrowedBy: details.name,
            }),
          });
          queryClient.invalidateQueries({
            queryKey: getGetLibrarySummaryQueryKey(),
          });
          window.localStorage.setItem("commonspine-name", details.name);
          setName(details.name);
          setDialog(null);
          setLeaveStep({ name: details.name });
          setNotice(
            `${currentDialog.book.title} is going with ${details.name}.`,
          );
        },
        onError: () =>
          setNotice("That moment did not save. Please try once more."),
      },
    );
  };

  const removeBook = (book: Book) => {
    deleteMutation.mutate(
      { bookId: book.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListBooksQueryKey({ status: "all" }),
          });
          queryClient.invalidateQueries({
            queryKey: getGetLibrarySummaryQueryKey(),
          });
          setRemoveDialogOpen(false);
          setNotice(`${book.title} was removed from the library.`);
        },
        onError: () =>
          setNotice("We could not remove that book. Please try again."),
      },
    );
  };

  return (
    <div className="page-shell pb-8">
      <section className="relative overflow-hidden pb-7 pt-8 sm:pb-9 sm:pt-12">
        <div className="pointer-events-none absolute -right-12 top-4 hidden h-64 w-64 rounded-full border-[34px] border-accent/25 sm:block" />
        <div className="pointer-events-none absolute right-16 top-24 hidden h-3 w-3 rounded-full bg-primary sm:block" />
        <div className="relative max-w-3xl">
          <p className="appear flex items-center gap-2 font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">
            <Radio size={13} />{" "}
            {healthQuery.data?.status === "ok"
              ? "the neighborhood is open"
              : "the neighborhood library"}
          </p>
          <h1
            data-testid="text-home-heading"
            className="appear appear-delay-1 mt-4 font-display text-[clamp(3.2rem,7vw,5.8rem)] font-semibold leading-[.88] tracking-[-.06em]"
          >
            Take a book.
            <br />
            <span className="text-primary">Leave a book.</span>{" "}
            <span className="whitespace-nowrap text-[.38em] tracking-[-.03em] text-muted-foreground">
              (Kochi Base)
            </span>
          </h1>
          <div className="appear appear-delay-2 mt-5 max-w-xl space-y-4 text-base leading-7 text-muted-foreground sm:text-lg">
            <p>
              This library was started with a simple thought, good books are
              meant to be passed on.
            </p>
            <p>
              It’s a small way to bring together a community of readers at
              IndiGo, discover what others are reading, and share the books
              we’ve loved with someone who might love them too.
            </p>
            <p>
              So if you have a favourite read sitting on your shelf, pass it on,
              pick up something new, and keep the stories moving.
            </p>
          </div>
        </div>
        {notice && (
          <div
            data-testid="status-action-notice"
            className="mt-3 flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground"
          >
            <span>{notice}</span>
            <button
              type="button"
              data-testid="button-dismiss-notice"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      <section
        className="paper-grid rounded-[28px] bg-secondary/30 p-4 sm:p-6"
        aria-label="Library summary"
      >
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-muted-foreground">
              Right now
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-[-.035em]">
              The shelf at a glance
            </h2>
          </div>
          <LibraryBig
            className="hidden text-secondary-foreground/50 sm:block"
            size={30}
          />
        </div>
        {summaryQuery.isLoading ? (
          <div className="shimmer h-[92px] rounded-[20px]" />
        ) : summaryQuery.isError ? (
          <ErrorState
            message="The summary could not find its way here."
            onRetry={() => summaryQuery.refetch()}
          />
        ) : (
          <StatStrip
            total={summary?.totalBooks ?? books.length}
            available={summary?.availableBooks ?? available.length}
            reading={summary?.readingBooks ?? reading.length}
          />
        )}
      </section>

      <section className="pt-8 sm:pt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-primary">
              Available now
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-.045em]">
              Choose your next chapter.
            </h2>
          </div>
          <span className="hidden rounded-full border border-border px-3 py-1.5 font-mono-ui text-[10px] uppercase tracking-[.12em] text-muted-foreground sm:block">
            {available.length} waiting patiently
          </span>
        </div>
        {booksQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
          </div>
        ) : booksQuery.isError ? (
          <ErrorState onRetry={() => booksQuery.refetch()} />
        ) : available.length === 0 ? (
          <EmptyState
            title="The ready shelf is quiet."
            message="Leave a book of your own and give this room a little more to discover."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((book: any) => (
              <Fragment key={book.id}>
                <BookCard
                  book={book}
                  onTake={(item) => setDialog({ book: item, mode: "take" })}
                  onReturn={(item) => setDialog({ book: item, mode: "return" })}
                />
              </Fragment>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-10 border-t border-border pt-14 sm:mt-20 sm:grid-cols-[1fr_330px] sm:pt-16">
        <div>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-primary">
                Currently reading
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-.045em]">
                Out in the world.
              </h2>
            </div>
            <Clock3 className="text-muted-foreground" size={27} />
          </div>
          {reading.length === 0 ? (
            <EmptyState
              title="Nothing out right now."
              message="Every story is waiting for its next pair of hands."
            />
          ) : (
            <div className="space-y-3">
              {reading.map((book: any) => (
                <article
                  data-testid={`row-reading-book-${book.id}`}
                  key={book.id}
                  className="lift flex flex-col gap-4 rounded-[18px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent">
                      <BookOpenMark />
                    </div>
                    <div>
                      <h3
                        data-testid={`text-reading-title-${book.id}`}
                        className="font-display text-xl font-semibold"
                      >
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        with {book.holderName ?? "a neighbor"} · due{" "}
                        {book.dueAt
                          ? new Intl.DateTimeFormat("en", {
                              month: "short",
                              day: "numeric",
                            }).format(new Date(book.dueAt))
                          : "soon"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid={`button-return-reading-${book.id}`}
                    onClick={() => setDialog({ book, mode: "return" })}
                    className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold hover:border-primary hover:text-primary"
                  >
                    <RotateCcw size={14} /> Return it
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
        <aside className="rounded-[24px] bg-sidebar p-6 text-sidebar-foreground sm:p-7">
          <Quote size={27} className="text-accent" />
          <h2 className="mt-8 font-display text-3xl font-semibold leading-tight">
            “The right book at the right doorstep can change a Tuesday.”
          </h2>
          <p className="mt-5 text-sm leading-6 text-sidebar-foreground/65">
            This shelf runs on small acts of trust. Every title you pass along
            leaves the room a little richer.
          </p>
          <div className="mt-8 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.14em] text-accent">
            <CircleHelp size={14} /> Recent shelf notes
          </div>
          <div className="mt-4 space-y-3 border-t border-sidebar-foreground/15 pt-4">
            {summary?.recentActivity?.slice(0, 4).map((item) => (
              <div
                key={item.id}
                data-testid={`activity-item-${item.id}`}
                className="text-xs leading-5 text-sidebar-foreground/75"
              >
                <p>{activityCopy(item)}</p>
                <p className="font-mono-ui text-[9px] uppercase tracking-[.1em] text-sidebar-foreground/40">
                  {relativeDate(item.createdAt)}
                </p>
              </div>
            )) ?? (
              <p
                data-testid="text-activity-empty"
                className="text-xs text-sidebar-foreground/55"
              >
                The first shelf note is yours to make.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-14 flex flex-col justify-between gap-5 rounded-[24px] border border-border bg-card p-6 sm:mt-20 sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-primary">
            Have a title to pass on?
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Leave the next good thing.
          </h2>
        </div>
        <Link
          href="/add"
          data-testid="link-add-book-home"
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          Add a book <Plus size={16} />
        </Link>
      </section>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          data-testid="button-open-remove-book"
          onClick={() => setRemoveDialogOpen(true)}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          Admin: Remove a book
        </button>
      </div>
      <ActionDialog
        book={dialog?.book ?? null}
        mode={dialog?.mode ?? "take"}
        defaultName={name}
        pending={busy}
        onClose={() => setDialog(null)}
        onConfirm={completeAction}
      />
      <LeaveBookDialog
        open={!!leaveStep}
        name={leaveStep?.name ?? name}
        books={eligibleLeaveQuery.data ?? []}
        loading={eligibleLeaveQuery.isLoading}
        pending={returnMutation.isPending}
        onClose={() => setLeaveStep(null)}
        onChooseExisting={(book, review) =>
          finishReturn(book, { name: leaveStep?.name ?? name, ...review }, true)
        }
        onAddNew={() => {
          setLeaveStep(null);
          setLocation("/add");
        }}
      />
      <RemoveBookDialog
        open={removeDialogOpen}
        books={books}
        pending={deleteMutation.isPending}
        onClose={() => setRemoveDialogOpen(false)}
        onConfirm={removeBook}
      />
    </div>
  );
}

function BookOpenMark() {
  return (
    <span className="relative block h-5 w-5 rounded-sm border-2 border-secondary-foreground/70">
      <span className="absolute left-1/2 top-0 h-full border-l border-secondary-foreground/50" />
    </span>
  );
}
