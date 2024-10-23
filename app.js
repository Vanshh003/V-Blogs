import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.log('Error connecting to MongoDB Atlas:', err));



// Define a schema for page content
const contentSchema = new mongoose.Schema({
  title: String,
  content: String
});

// Create a model based on the schema
const Content = mongoose.model("Content", contentSchema);



// Define a schema for blog posts
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});

// Create a model for blog posts
const Post = mongoose.model("Post", postSchema);




const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



// Home route
app.get("/", async (req, res) => {
    try {
      const foundHomeContent = await Content.findOne({ title: "Home" });
      const allPosts = await Post.find({});
      res.render("home.ejs", {
        startingContentHome: foundHomeContent.content,
        allposts: allPosts
      });
    } catch (err) {
      console.log(err);
    }
  });
  


// Home route
app.get("/admin/:password", async (req, res) => {
  if(req.params.password && req.params.password === process.env.PASSWORD) {
    try {
      const foundHomeContent = await Content.findOne({ title: "Home" });
      const allPosts = await Post.find({});
      res.render("home_admin.ejs", {
        startingContentHome: foundHomeContent.content,
        allposts: allPosts
      });
    } catch (err) {
      console.log(err);
    }
  }
  else {
    res.render("unauthorisedAccess.ejs");
  }
});





// About route
app.get("/about", async (req, res) => {
    try {
      const foundContent = await Content.findOne({ title: "About" });
      res.render("about.ejs", {
        startingContentAbout: foundContent.content
      });
    } catch (err) {
      console.log(err);
    }
  });



// Contact route
app.get("/contact", async (req, res) => {
    try {
      const foundContent = await Content.findOne({ title: "Contact" });
      res.render("contact.ejs", {
        startingContentContact: foundContent.content
      });
    } catch (err) {
      console.log(err);
    }
  });



// Compose route
app.get("/compose", (req, res) => {
  res.render("compose.ejs");
});



// Post route for composing new blog posts
app.post("/compose", async (req, res) => {
    const post = new Post({ // Ensure you're creating a new Post instance here
      title: req.body.postTitle,
      content: req.body.postBody
    });
  
    try {
      await post.save();
      res.redirect("/"); // Redirect to the home page
    } catch (err) {
      console.error(err);
    }
  });



// Dynamic post route
app.get("/posts/:postName", async (req, res) => {
    const requestedTitle = _.lowerCase(req.params.postName);
    
    try {
      const post = await Post.findOne({ title: { $regex: new RegExp(`^${requestedTitle}$`, "i") } });
      if (post) {
        res.render("post.ejs", {
          title: post.title,
          content: post.content
        });
      } else {
        res.send("Post not found.");
      }
    } catch (err) {
      console.log(err);
      res.send("Error retrieving post.");
    }
  });



// Delete route for blog posts
app.post("/delete/:postTitle", async (req, res) => {
    const requestedTitle = decodeURIComponent(req.params.postTitle); // Decode the title

    console.log(`Attempting to delete post titled: "${requestedTitle}"`); // Debugging information

    try {
        // Find and delete the post by title
        const result = await Post.deleteOne({ title: requestedTitle });
        console.log(`Post deletion result: ${JSON.stringify(result)}`); // Log the deletion result
        res.redirect("/"); // Redirect to the home page after deletion
    } catch (err) {
        console.error(err);
        res.send("Error deleting post.");
    }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
