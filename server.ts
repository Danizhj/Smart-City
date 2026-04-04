// import express from "express";
// import path from "node:path";
// import { fileURLToPath } from "node:url";
// import { createServer as createViteServer } from "vite";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// async function startServer() {
//   const app = express();
//   const PORT = 3000;

//   // In development, use Vite middleware to handle routing and HMR
//   if (process.env.NODE_ENV !== "production") {
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: "spa",
//     });
//     app.use(vite.middlewares);
//   } else {
//     // In production, serve the built files from the 'dist' folder
//     const distPath = path.resolve(__dirname, "dist");
//     app.use(express.static(distPath));

//     // This is the CRITICAL part for React Router:
//     // It sends index.html for any request that doesn't match a static file.
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(distPath, "index.html"));
//     });
//   }

//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running at http://localhost:${PORT}`);
//   });
// }

// startServer();

import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);

  app.listen(5173, () => {
    console.log("Server running on http://localhost:5173");
  });
}

startServer();
