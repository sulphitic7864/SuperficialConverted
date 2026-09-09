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
      "Science"
    ][i % 4],
    personName: `User ${i + 1}`,
    status: "available",
    rating: Math.floor(Math.random() * 5) + 1,
    nextReaderNote: `Note for book ${i + 1}`,
    lovedThing: `Loved feature ${i + 1}`,
  }));


  await db.insert(booksTable).values(books);


  const requests = Array.from({ length: 10 }).map((_, i)=>({
    title:`Sample Book ${i+1}`,
    requesterName:`Requester ${i+1}`,
    note:`Request note ${i+1}`,
  }));


  await db.insert(requestsTable).values(requests);


  const activities = Array.from({ length: 10 }).map((_, i) => ({
  type: "added",
  personName: `User ${i + 1}`,
  bookTitle: `Sample Book ${i + 1}`,
  bookId: i + 1,
}));


  await db.insert(activityTable).values(activities);


  console.log("Seed completed");
  process.exit();
}


seed();