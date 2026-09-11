import {
  ArrowRight,
  BookHeart,
  Check,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetLibrarySummaryQueryKey,
  getListRequestsQueryKey,
  useCreateRequest,
  useListRequests,
} from "@/api";
import { EmptyState, ErrorState } from "@/components/states";

function dateLabel(value?: string | null) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function isFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return (
    parts.length >= 2 &&
    parts.every((part) => part.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'-]/g, "").length >= 2)
  );
}

export default function Requests() {
  const queryClient = useQueryClient();
  const requestsQuery = useListRequests();
  const createRequest = useCreateRequest();
  const [savedName, setSavedName] = useState(
    () => window.localStorage.getItem("commonspine-name") ?? "",
  );
  const [form, setForm] = useState({
    title: "",
    requesterName: savedName,
    note: "",
  });
  const [notice, setNotice] = useState("");
  const requests = requestsQuery.data ?? [];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !isFullName(form.requesterName)) return;
    createRequest.mutate(
      {
        data: {
          title: form.title.trim(),
          requesterName: form.requesterName.trim(),
          note: form.note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListRequestsQueryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: getGetLibrarySummaryQueryKey(),
          });
          window.localStorage.setItem(
            "commonspine-name",
            form.requesterName.trim(),
          );
          setSavedName(form.requesterName.trim());
          setForm({
            title: "",
            requesterName: form.requesterName.trim(),
            note: "",
          });
          setNotice(
            "Your request is on the board. A neighbor may have just the thing.",
          );
        },
        onError: () =>
          setNotice("We could not post that request. Please try again."),
      },
    );
  };
  return (
    <div className="page-shell pb-12 pt-10 sm:pt-16">
      <section className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-end">
        <div>
          <p className="flex items-center gap-2 font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">
            <Search size={13} /> The looking-for board
          </p>
          <h1
            data-testid="text-requests-heading"
            className="mt-5 max-w-2xl font-display text-[clamp(3.3rem,7vw,6.5rem)] font-semibold leading-[.88] tracking-[-.06em]"
          >
            Some stories
            <br />
            <span className="text-primary">are still missing.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground">
            Tell the neighborhood what you’re hoping to find. Requests stay open
            until the right book walks through the door.
          </p>
        </div>
        <div className="rounded-[26px] bg-sidebar p-6 text-sidebar-foreground shadow-sm sm:p-7">
          <BookHeart className="text-accent" size={28} />
          <p className="mt-7 font-display text-2xl leading-tight">
            A well-placed recommendation is a small kind of magic.
          </p>
          <p className="mt-3 text-sm leading-6 text-sidebar-foreground/65">
            Have a title that answers a request? Leave it on the shelf.
          </p>
        </div>
      </section>
      <div className="mt-8 grid gap-8 border-t border-border pt-8 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="order-2 lg:order-1">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-primary">
                Open requests
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-.045em]">
                {requests.length
                  ? "On the community radar."
                  : "A quiet board, for now."}
              </h2>
            </div>
            <span
              data-testid="text-request-count"
              className="font-mono-ui text-xs text-muted-foreground"
            >
              {requests.length} open
            </span>
          </div>
          {requestsQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="shimmer h-[126px] rounded-[20px]" />
              ))}
            </div>
          ) : requestsQuery.isError ? (
            <ErrorState onRetry={() => requestsQuery.refetch()} />
          ) : requests.length === 0 ? (
            <EmptyState
              requests
              title="No asks on the board."
              message="Be the first neighbor to name the story you’re hoping to find."
            />
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <article
                  data-testid={`card-request-${request.id}`}
                  key={request.id}
                  className="lift relative rounded-[20px] border border-border bg-card p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3
                        data-testid={`text-request-title-${request.id}`}
                        className="font-display text-2xl font-semibold tracking-[-.02em]"
                      >
                        {request.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        asked by{" "}
                        <strong className="font-semibold text-foreground">
                          {request.requesterName}
                        </strong>{" "}
                        · {dateLabel(request.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent px-3 py-1 font-mono-ui text-[9px] font-bold uppercase tracking-[.12em]">
                      looking
                    </span>
                  </div>
                  {request.note && (
                    <p className="mt-5 border-l-2 border-primary/40 pl-3 text-sm leading-6 text-muted-foreground">
                      {request.note}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="order-1 lg:order-2">
          <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm sm:p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Send size={18} />
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold">
              Add to the wish list.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Name the book, leave a little context, and let the shelf listen.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="request-title"
                  className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground"
                >
                  Book title
                </label>
                <input
                  id="request-title"
                  data-testid="input-request-title"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="The book you’re hoping for"
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label
                  htmlFor="request-name"
                  className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground"
                >
                  Your full name
                </label>
                <input
                  id="request-name"
                  data-testid="input-request-name"
                  required
                  maxLength={80}
                  value={form.requesterName}
                  onChange={(event) =>
                    setForm({ ...form, requesterName: event.target.value })
                  }
                  placeholder="e.g. Mina Thomas"
                  className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
                {form.requesterName && !isFullName(form.requesterName) && (
                  <p className="mt-2 text-xs text-destructive">
                    Please enter your first and last name.
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="request-note"
                  className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground"
                >
                  A note{" "}
                  <span className="font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="request-note"
                  data-testid="input-request-note"
                  maxLength={240}
                  value={form.note}
                  onChange={(event) =>
                    setForm({ ...form, note: event.target.value })
                  }
                  placeholder="Why this one? A translation, an edition, a mood…"
                  className="mt-2 min-h-[94px] w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <button
                type="submit"
                data-testid="button-submit-request"
                disabled={
                  createRequest.isPending ||
                  !form.title.trim() ||
                  !isFullName(form.requesterName)
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground disabled:opacity-55"
              >
                {createRequest.isPending
                  ? "Posting your ask…"
                  : "Post this request"}{" "}
                <ArrowRight size={16} />
              </button>
            </form>
            {notice && (
              <p
                data-testid="status-request-notice"
                className={`mt-4 flex items-start gap-2 text-sm leading-5 ${notice.includes("could not") ? "text-destructive" : "text-secondary-foreground"}`}
              >
                <Check size={16} className="mt-0.5 shrink-0" /> {notice}
              </p>
            )}
          </div>
          <p className="mt-4 flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <Sparkles size={13} className="text-primary" /> Requests are a
            promise that someone is listening.
          </p>
        </section>
      </div>
    </div>
  );
}
