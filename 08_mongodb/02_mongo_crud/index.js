
const { MongoClient } = require('mongodb');
const dotenv = require("dotenv")
dotenv.config()

async function addBook() {

  const uri = process.env.URI;
  const client = new MongoClient(uri);

  try {
    const database = client.db('bookStore');
    const books = database.collection('books');

    const book = {name: "Streets", author: "Sarah", quantity: 10, price: 55}
    const createBook = await books.insertOne(book)
    console.log(createBook);
    


  } finally {
    await client.close();
  }
}
// addBook().catch(console.dir);



async function listBooks() {

  const uri = process.env.URI;
  const client = new MongoClient(uri);

  try {
    const database = client.db('bookStore');
    const books = database.collection('books');


    const booksList = await books.find().toArray()
    console.log(booksList);
    


  } finally {
    await client.close();
  }
}
// listBooks().catch(console.dir);


async function booksByAuthor(authorName) {

  const uri = process.env.URI;
  const client = new MongoClient(uri);

  try {
    const database = client.db('bookStore');
    const books = database.collection('books');


    const booksList = await books.find({author: authorName}).toArray()
    console.log(booksList);
    


  } finally {
    await client.close();
  }
}
// booksByAuthor("Sarah").catch(console.dir);



async function booksByTitle(title) {

  const uri = process.env.URI;
  const client = new MongoClient(uri);

  try {
    const database = client.db('bookStore');
    const books = database.collection('books');


    const booksList = await books.findOne({name: title})
    console.log(booksList);
    


  } finally {
    await client.close();
  }
}
booksByTitle("Trees").catch(console.dir);











