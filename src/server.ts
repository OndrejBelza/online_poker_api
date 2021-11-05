import express from "express";
import "dotenv-safe/config";

const port = process.env.PORT;

const main = async () => {
  const app = express();

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
};

main().catch(console.error);
