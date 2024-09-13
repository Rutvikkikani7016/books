import express from "express";
import { addUser, getUser } from "../Controllers/User.js";


const router = express.Router();

router.post('/adduser', addUser)
router.get('/getusers', getUser)

export default router