import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import swaggerAutogen from "swagger-autogen";
import swaggerUiExpress from "swagger-ui-express";
import path from 'path';
import { fileURLToPath } from 'url';

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

/* #swagger.summary = 'DailyFrame 포스터 생성'
    #swagger.description = '이미지를 업로드하면 AI가 일기를 생성합니다.'
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['files'] = {
        in: 'formData',
        type: 'array',
        required: true,
        description: '업로드할 이미지 파일들 (최대 3장)',
        collectionFormat: 'multi',
        items: { type: 'file' }
    }
*/
app.post("/api/v1/generate", upload.array("files", 3), generateDiary);

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/openapi.json", async (req, res, next) => {
  const options = {
    disableLogs: true,
    writeOutputFile: false,
  };
  const outputFile = "/dev/null";
  
  
  const routes = [__filename]; 
  
  const doc = {
    info: {
      title: "DailyFrame API",
      description: "AI Diary Generator",
    },
    openapi: "3.0.0", 
    host: req.get("host"), 
    schemes: ["https", "http"], 
  };

  const result = await swaggerAutogen(options)(outputFile, routes, doc);

  if (result && result.data) {
      delete result.data.swagger; 
  }

  res.json(result ? result.data : null);
});

app.listen(port, () => {
  console.log(`🚀 Node.js Server listening on port ${port}`);
});