import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER SECRET";

const router = Router();
const prisma = new PrismaClient();

// Generate a random 8 digit number as the email token
function generateEmailToken(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateAuthToken(tokenId: number): string {
    const jwtPayLoad = { tokenId };

    return jwt.sign(jwtPayLoad, JWT_SECRET, {
        algorithm: "HS256",
        noTimestamp: true,
    })
}

// Create a user if it doesn't exits,
// genrate the email token and send it to thier email
router.post("/login", async (req, res) => {
  const { email } = req.body;

  //generate token
  const emailToken = generateEmailToken();
  const expiration = new Date(
    new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
  );

  try {
    const createdToken = await prisma.token.create({
      data: {
        type: "EMAIL",
        emailToken,
        expiration,
        user: {
          connectOrCreate: {
            where: { email },
            create: { email },
          },
        },
      },
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ error: "Token not created!" });
  }
});

//Validate the emailToken
// Generate a long lived JWT token
router.post("/authenticate", async (req, res) => {
  const { email, emailToken } = req.body;

  const dbEmailToken = await prisma.token.findUnique({
    where: {
      emailToken,
    },
    include: {
      user: true,
    },
  });

  if (!dbEmailToken || !dbEmailToken.vaild) {
    return res.status(401);
  }

  if (dbEmailToken.expiration < new Date()) {
    return res.status(401).json({ error: "Token expired" });
  }

  if (dbEmailToken?.user?.email !== email) {
    return res.sendStatus(401);
  }

  // Here we validated that the user is the owner of the email

  //Generate an API token

  const expiration = new Date(
    new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000
  );

  const apiToken = await prisma.token.create({
    data: {
      type: "API",
      expiration,
      user: {
        connect: {
          email,
        },
      },
    },
  });

  //Invalidate email token
  await prisma.token.update({
    where: {id: dbEmailToken.id},
    data: {vaild: false}
  });

  //Generate the JWT token
  const authToken = generateAuthToken(apiToken.id);

  res.json({authToken});
});

export default router;
