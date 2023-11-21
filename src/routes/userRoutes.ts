import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// CRUD
//Create a user
router.post("/", async (req, res) => {
  const { email, name, username } = req.body;

  try {
    const result = await prisma.user.create({
      data: {
        email,
        name,
        username,
        bio: "Hello, I am new on Twitter",
      },
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({error: "Username and eamil should be unique!"})
  }
});

//List users
router.get("/", async (req, res) => {
  const allUser = await prisma.user.findMany({
    // select: {
    //     id: true,
    //     name: true,
    //     image: true,
    //     bio: true,
    // }
  });
  res.json(allUser);
});

//Get one user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ 
    where: { id: Number(id) },
    include: {tweets: true}
});
  if(!user){
    res.status(400).json("User not found!")
  }
  res.json(user);
});

//Update user
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const {name, bio, image} = req.body;
    const result = await prisma.user.update({
        where: {id: Number(id)},
        data: {name, bio, image}
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({error: "Failed to update the user!"})
  }
});

//Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({where: {id: Number(id)}})
  res.sendStatus(200);
});

export default router;
