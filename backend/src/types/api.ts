import { z } from "zod";


// ---------------- HEALTH ----------------

export const HealthCheckResponse = z.object({
  status: z.string(),
});


// ---------------- BOOKS ----------------

export const ListBooksQueryParams = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  borrowedBy: z.string().optional(),
});


export const CreateBookBody = z.object({
  title: z.string(),
  author: z.string(),
  genre: z.string().optional(),
  personName: z.string().optional(),
  rating: z.number().optional(),
  nextReaderNote: z.string().optional(),
  lovedThing: z.string().optional(),
});


const BookResponse = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  genre: z.string(),
  status: z.enum(["available", "reading"]),
  holderName: z.string().nullable().optional(),
  takenAt: z.coerce.date().nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  rating: z.number().nullable().optional(),
  nextReaderNote: z.string().nullable().optional(),
  lovedThing: z.string().nullable().optional(),
  addedBy: z.string().nullable().optional(),
  leftAt: z.coerce.date().nullable().optional(),
  addedAt: z.coerce.date(),
});


export const CreateBookResponse = BookResponse;


// export const ListBooksResponse = z.array(
//   z.object({
//     id: z.number(),
//     title: z.string(),
//     author: z.string(),
//     genre: z.string(),
//     personName: z.string().nullable().optional(),
//     status: z.string().optional(),
//   })
// );

export const ListBooksResponse = z.array(
  z.object({
    id: z.number(),
    title: z.string(),
    author: z.string(),
    genre: z.string(),

    status: z.enum([
      "available",
      "reading",
    ]),

    holderName: z.string().nullable().optional(),

    takenAt: z.coerce.date().nullable().optional(),

    dueAt: z.coerce.date().nullable().optional(),

    addedAt: z.coerce.date().optional(),

    rating: z.number().nullable().optional(),

    nextReaderNote: z.string().nullable().optional(),

    lovedThing: z.string().nullable().optional(),

    addedBy: z.string().nullable().optional(),

    leftAt: z.coerce.date().nullable().optional(),

    readerCount: z.number().optional(),
  })
);


export const TakeBookParams = z.object({
  bookId: z.coerce.number(),
});


export const TakeBookBody = z.object({
  personName: z.string(),
});


export const TakeBookResponse = z.object({
  ...BookResponse.shape,
});


export const ReturnBookParams = z.object({
  bookId: z.coerce.number(),
});


export const ReturnBookBody = z.object({
  personName: z.string(),
  rating: z.number().optional(),
  nextReaderNote: z.string().optional(),
  lovedThing: z.string().optional(),
});


export const ReturnBookResponse = z.object({
  ...BookResponse.shape,
});


export const DeleteBookParams = z.object({
  bookId: z.coerce.number(),
});


export const DeleteBookResponse = z.object({
  ...BookResponse.shape,
});


// ---------------- REQUESTS ----------------

export const CreateRequestBody = z.object({
  title: z.string().min(1),
  requesterName: z.string(),
  note: z.string().optional(),
});


export const RequestCommentResponse = z.object({
  id: z.number(),
  requestId: z.number(),
  commenterName: z.string(),
  message: z.string(),
  createdAt: z.coerce.date(),
});


export const CreateRequestResponse = z.object({
  id: z.number(),
  title: z.string(),
  requesterName: z.string(),
  note: z.string().nullable().optional(),
  comments: z.array(RequestCommentResponse).default([]),
  createdAt: z.coerce.date(),
});


export const CreateRequestCommentBody = z.object({
  commenterName: z.string(),
  message: z.string().min(1).max(500),
});


export const CreateRequestCommentResponse = RequestCommentResponse;


export const DeleteRequestParams = z.object({
  requestId: z.coerce.number(),
});


export const DeleteRequestResponse = z.object({
  id: z.number(),
});


export const ListRequestsResponse = z.array(
  z.object({
    id: z.number(),
    title: z.string(),
    requesterName: z.string(),
    note: z.string().nullable().optional(),
    comments: z.array(RequestCommentResponse),
    createdAt: z.coerce.date(),
  })
);


// ---------------- SUMMARY ----------------

export const GetLibrarySummaryResponse = z.object({
  totalBooks: z.number(),
});