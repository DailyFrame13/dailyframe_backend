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

// 응답 헬퍼 함수들
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
   #swagger.requestBody = {
       required: true,
       content: {
           "multipart/form-data": {
               schema: {
                   type: "object",
                   properties: {
                       files: {
                           type: "array",
                           items: {
                               type: "string",
                               format: "binary"
                           },
                           description: "업로드할 이미지 파일들 (여러 장 선택 가능)"
                       }
                   }
               }
           }
       }
   } 
*/
// ✅ [중요] 'files'라는 이름으로 최대 3장까지 허용
app.post("/api/generate", upload.array('files', 3), generateDiary);

// 에러 핸들러
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

// Swagger 설정
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
    openapi: "3.0.0",
    host: req.get("host"), 
    schemes: ["https", "http"], 
  };
  const result = await swaggerAutogen(options)(outputFile, routes, doc);
  res.json(result ? result.data : null);
});

app.listen(port, () => {
  console.log(`🚀 Node.js Server listening on port ${port}`);
});