import "#db";
import express from "express";
import { userRoutes } from "#routes";
import { errorHandler, logger } from "#middleware";


const app = express();
const port = 3000;

// built-in middleware
 
app.use(express.json());


// app.use((req, res, next)=>{
//     console.log("Middleware 1 log: ", req.method);
//     next()
// })

app.use(logger)

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the main app!",
  });
});

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