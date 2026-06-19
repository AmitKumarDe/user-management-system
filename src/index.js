import "dotenv/config";

import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server Running On Port ${process.env.PORT}`);
  });
});
