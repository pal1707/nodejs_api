import express from "express";
import UserRoutes from './routes/userRoutes';
import tweetRoutes from './routes/tweetRoutes';
import authRoutes from './routes/authRoutes';
import { authenticateToken } from "./middlewares/authMiddleware";

const app = express();
app.use(express.json());
app.use('/user', authenticateToken, UserRoutes);
app.use('/tweet', authenticateToken, tweetRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send("Hello world!!!")
});

app.listen(4000, () => {
    console.log("Server ready at localhost:4000");  
});