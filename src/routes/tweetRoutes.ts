import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER SECRET";

// CRUD
//Create a tweet
router.post("/", async (req, res) => {
  const { content, image } = req.body;
  // @ts-ignore
  const user = req.user;
  try {
    const result = await prisma.tweet.create({
      data: {
        content,
        image,
        userId: user.id
      },
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: "Tweet not created!" });
  }
});

//List tweets
router.get("/", async (req, res) => {
  try {
    const allTweets = await prisma.tweet.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });
    res.json(allTweets);
  } catch (error) {
    res.status(400).json({ error: "Problem fetching tweets!" });
  }
});

//Get one tweet
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tweet = await prisma.tweet.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });
    if (!tweet) {
      res.status(400).json("Tweet not found!");
    }
    res.json(tweet);
  } catch (error) {
    res.status(400).json({ error: `Problem fetching the tweet` });
  }
});

//Update tweet
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, image } = req.body;
    const result = await prisma.tweet.update({
      where: { id: Number(id) },
      data: { content, image },
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: `Tweet not updated!` });
  }
});

//Delete tweet
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tweet.delete({ where: { id: Number(id) } });
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ error: `Tweet not deleted!` });
  }
});

export default router;
