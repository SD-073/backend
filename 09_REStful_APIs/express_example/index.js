const express = require("express")

const app = express()

app.get("/", (req, res) => {

    res.send("We accept requests on /users and /posts only!")
})

app.get("/users", (req, res) => {

    res.send("users collection")
})

app.post("/users", (req, res) => {
    const data = req.body
    console.log(data);
    
    
    res.send("Post for users is called!")
})

app.get("/posts", (req, res) => {

    res.send("posts collection...")
})




app.listen(5000, () => {
    console.log("Sever is runing on port 5000");
    
})