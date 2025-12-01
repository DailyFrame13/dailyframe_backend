import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import swaggerAutogen from "swagger-autogen";
import swaggerUiExpress from "swagger-ui-express";

import { generateDiary } from "./controllers/ai.controller.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; 

const upload = multer({ dest: 'uploads/' });


app.use((req, res, next) => {
  res.success = (success) => {
    return res.json({ resultType: "SUCCESS", error: null, success });
  };
  res.error = ({ errorCode = "unknown", reason = null, data = null }) => {
    return res.json({
      resultType: "FAIL",
      error: { errorCode, reason, data },
      success: null,
    });
  };
  next();
});

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("DailyFrame Backend is Running!");
});

/* #swagger.consumes = ['multipart/form-data']
  #swagger.parameters['file'] = {
      in: 'formData',
      type: 'file',
      required: true,
      description: '업로드할 이미지 파일'
  } 
*/
app.post("/api/v1/generate", upload.single('file'), generateDiary);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.statusCode || 500).error({
    errorCode: err.errorCode || "unknown",
    reason: err.reason || err.message || null,
    data: err.data || null,
  });
});

app.use(
  "/docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup({}, {
    swaggerOptions: {
      url: "/openapi.json",
    },
  })
);

app.get("/openapi.json", async (req, res, next) => {
  const options = {
    openapi: "3.0.0",
    disableLogs: true,
    writeOutputFile: false,
  };
  const outputFile = "/dev/null";
  const routes = ["src/index.js"];
  const doc = {
    info: {
      title: "DailyFrame API",
      description: "AI Diary Generator",
    },
    host: "localhost:3000",
  };
  const result = await swaggerAutogen(options)(outputFile, routes, doc);
  res.json(result ? result.data : null);
});

app.listen(port, () => {
  console.log(`🚀 Node.js Server listening on port ${port}`);
});