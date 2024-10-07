import express from "express";
import bodyParser from "body-parser";
import { supabase } from "./supabaseClient.js";
const app = express();
const port = 4000;
let lastId = 0;
let posts = [];

const setData = async ()=>{
  try {
    const { data, error } = await supabase
        .from('postList')
        .select('lastId');

    if (data && data.length === 0) {
        const { error: insertError } = await supabase
            .from('postList')
            .insert([{ lastId: lastId, postsArray: posts }]);

        if (insertError) throw insertError;
    } else {
      const { error: updateError } = await supabase
            .from('postList')
            .update([{ lastId: lastId, postsArray: posts }])
            .eq('lastId', data[0].lastId);

        if (updateError) throw updateError;
    }
    } catch (error) {
      console.log(error);
      console.log('Error updating todo');
    }
}

const getData = async()=>{
  const {data, error} = await supabase 
    .from('postList')
    .select('lastId, postsArray');
    if (error) {
      console.log(error);
    } else if (data && data.length > 0) {
        lastId = data[0].lastId;
        posts = data[0].postsArray;
    } else {
      setData();
    }
}

await getData();

console.log(lastId);
console.log(posts);



/*
posts = [
  {
    id: 1,
    title: "The Rise of Decentralized Finance",
    content:
      "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
    author: "Alex Thompson",
    date: "2023-08-01T10:00:00Z",
  },
  {
    id: 2,
    title: "The Impact of Artificial Intelligence on Modern Businesses",
    content:
      "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
    author: "Mia Williams",
    date: "2023-08-05T14:30:00Z",
  },
  {
    id: 3,
    title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
    content:
      "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
    author: "Samuel Green",
    date: "2023-08-10T09:15:00Z",
  },
];
*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/posts", (req,res)=>{
  res.json(posts);
});

app.get("/posts/:id", (req,res)=>{
  const id = parseInt(req.params.id);
  const post = posts.find((post)=> post.id === id);
  if(!post) return res.status(404).json({error: "Post does not exist!"});
  res.json(post);
});

app.post("/posts", (req,res)=>{
  const newId = lastId+1;
  const newPost = {
    id: newId,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    img: req.body.img,
    date: new Date(),
  }
  lastId = newId;
  posts.unshift(newPost);
  setData();
  res.json(newPost);
});

app.patch("/posts/:id", (req,res)=>{
  const id = parseInt(req.params.id);
  const post = posts.find((post)=> post.id === id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  if (req.body.title) post.title = req.body.title;
  if (req.body.content) post.content = req.body.content;
  if (req.body.author) post.author = req.body.author;
  if (req.body.img) post.img = req.body.img;
  setData();
  res.json(post);
});

app.delete("/posts/:id", (req,res)=>{
  const id = parseInt(req.params.id);
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ message: "Post not found" });

  posts.splice(index, 1);
  setData();
  res.json({ message: "Post deleted" });

});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});