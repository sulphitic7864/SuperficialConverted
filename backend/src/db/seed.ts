import "dotenv/config";
import { db } from "./index";
import {
  booksTable,
  requestsTable,
  activityTable,
} from "./schema";


async function seed() {

  const books = Array.from({ length: 10 }).map((_, i) => ({
    title: `Sample Book ${i + 1}`,
    author: `Author ${i + 1}`,
    genre: [
      "Fiction",
      "Technology",
      "History",
      "Science",
    ][i % 4],

    personName: `User ${i + 1}`,

    status: "available" as const,

    rating: Math.floor(Math.random() * 5) + 1,

    nextReaderNote: `Note for book ${i + 1}`,

    lovedThing: `Loved feature ${i + 1}`,
  }));


  const insertedBooks = await db
    .insert(booksTable)
    .values(books)
    .returning();


  const requests = Array.from({ length: 10 }).map((_, i) => ({
    title: `Sample Book ${i + 1}`,
    requesterName: `Requester ${i + 1}`,
    note: `Request note ${i + 1}`,
  }));


  await db
    .insert(requestsTable)
    .values(requests);


  const activities = insertedBooks.map((book, i) => ({
    type: "added" as const,

    personName: `User ${i + 1}`,

    bookTitle: book.title,

    bookId: book.id,
  }));


  await db
    .insert(activityTable)
    .values(activities);


  console.log("Seed completed");

  process.exit(0);
}


seed().catch((error) => {

  console.error(error);

  process.exit(1);

});