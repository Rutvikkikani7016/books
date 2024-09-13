import app from "./app.js";

app.listen(process.env.PORT  || 5000, () => {
    console.log(`Server listening at port ${process.env.PORT}`);
  });
  