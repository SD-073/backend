import "#db";
import express from "express";
import { userRoutes } from "#routes";
import { errorHandler, logger } from "#middleware";
import {z} from "zod/v4"
import { resourceLimits } from "worker_threads";
import { createUser, getAllUsers } from "#controllers";

const app = express();
const port = 3000;








// schemas = zod schema => z.infer<typeof schemaName>;
const userSchema = z.object({
  firstName: z.string().min(3).max(10),
  lastName: z.string().min(3).max(10).optional(),
  email: z.string().min(3).max(10),
  password: z.string().min(3).max(10),
})

// creating type from schemas
type User = z.infer<typeof userSchema>

function dataValidator (uInput:User){

  return z.safeParse(userSchema, uInput)

}

// const userInput = {name: "Sa", age: "33"}
// const userInput2 = {firstName: "Sami"}
// const result = z.safeParse(userSchema, userInput)
// const result2 = z.safeParse(userSchema, userInput2)

// console.log(result);
// console.log(result2);






// Zod:
// create data type for expected user input "schema" src/schemas zod schemas
// use the schema in a middleware to validate the user input src/middleware validators

// Steps:
// Installation: npm install zod
// Configuration: tsconfig.json: "compilerOptions": {"strict": true}
// Import: import {z} from "zod/v4" OR import * as z from "zod"; 
// Define schema: const User = z.object({ firstName: z.string(), lastName: z.string()});
// use .parse / .parseSafe / .parseSafeAsync to validate input/data
// we can create types from zod schemas: type UserType = z.infer<typeof User>/





app.use(express.json());
app.use(logger)

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the main app!",
  });
});


// middleware to vaidate userinput on post method
app.post("/users", (req, res, next) => {
  console.log("new post req ");
  const result = dataValidator(req.body)

  // res.send(`the input is: ${result.success ? "success": "failed"}`)

  if (result.success){
    console.log("input is valid");
    
  } else {
    console.log("input is not valid");
    console.log(result);
    throw new Error("input is not valid")
    
    
  }

  next()
  

})



// blogPostRoutes
//     .route('/')
//     .get(getAllBlogPosts)
//     .post(validateBody(blogPostInputSchema), createBlogPost); // <= Middleware
// blogPostRoutes
//     .route('/:id')
//     .get(getBlogPostById)
//     .put(validateBody(blogPostInputSchema), updateBlogPost) // <= Middleware
//     .delete(deleteBlogPost);

// userRoutes.route("/users").get(getAllUsers).post(dataValidator(userinput), createUser)



app.use("/users", userRoutes);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`\x1b[34mMain app listening at http://localhost:${port}\x1b[0m`),
);







































// app.use((req, res, next) => {
//   console.log("Time:", Date.now());
//   console.log(req.method);
//   console.log(1);

//   next();
// });

// app.use((req, res, next) => {
//   console.log("Time:", Date.now());
//   console.log(req.method);
//   console.log(2);
//   throw new Error("no match");
// });