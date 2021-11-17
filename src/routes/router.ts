import { Router } from "express";
import usersRouter from "./users/users";

const router = Router();

router.use(usersRouter);

export default router;
