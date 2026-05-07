
const { MongoClient } = require('mongodb');
const dotenv = require("dotenv")
dotenv.config()

// async function runGetStarted() {
//   const uri = process.env.URI;
//   const client = new MongoClient(uri);

//   try {
//     // const users = db.collection("users")
//     const database = client.db('sample_mflix');
//     const movies = database.collection('movies');

  
//     const query = { title: 'Back to the Future' };
//     const movie = await movies.findOne(query);
//     console.log(movie);
//   } finally {
//     await client.close();
//   }
// }
// runGetStarted().catch(console.dir);

async function runGetStarted() {

  const uri = process.env.URI;
  const client = new MongoClient(uri);

  try {
    const database = client.db('app');
    const users = database.collection('users');

  
    // const userData = { name: 'Nina', grade: 6 };
    // const user = await users.insertOne(userData);

    const userData = {
      "name": "Sarah",
      "children": { "name": "Mike", "age": "28", "grade": 6 }
    };
    const user = await users.insertOne(userData);
    
    // const usersData = await users.findOne({name: "Nina"});

    console.log(user);
  } finally {
    await client.close();
  }
}
runGetStarted().catch(console.dir);


// schema
// data
// language:
//    SQL: create table xxx, insert into xx (),  select x from x;

// db.createCollection("users")
// const users = db.collection("users") 
// users.insert({name: "Khaled", age: "28", grade: 6})
// users.insert({name: "Grace", age: "20", grade: 6})
// users.insert({name: "Ahmad", age: "28", grade: 6, country: "Egypt"})

// users.find() // all docu in the collection
// users.find({name: "Khaled"}) // {name: "Khaled", age: "28", grade: 6}


// CREATE TABLE users (
//   name string required,
//   age string required,
//   grade number required,
//   ....
// );
// Khaled 28 6
// Grace 20 6
// Ahmad 28 6 "Eygpt"
// INSERT INTO users (name, age, grade)
// VALUES ("Khaled", "28", 6);
// INSERT INTO users (name, age, grade)
// VALUES ("Grace", "28", 6);
// INSERT INTO users (name, age, grade)
// VALUES ("Ahmad", "28", 6, "Egypt");




//    NoSQL: db.createCollection(), db.x.insert(), db.x.find()

// .env?
