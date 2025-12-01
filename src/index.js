import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import swaggerUiExpress from "swagger-ui-express";

import { generateDiary } from "./controllers/ai.controller.js";
import { swaggerDocs} from "./common/swagger/generate.js" // ⭐️ 추가

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

// 응답 헬퍼
app.use((req, res, next) => {
  res.success = (success) => res.json({ resultType: "SUCCESS", error: null, success });
  res.error = ({ errorCode = "unknown", reason = null, data = null }) =>
    res.json({ resultType: "FAIL", error: { errorCode, reason, data }, success: null });
  next();
});

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("DailyFrame Backend is Running!");
});

// ⭐️ 파일 최대 3장 업로드
app.post("/api/v1/generate", upload.array("files", 3), generateDiary);

// 📌 Swagger UI 등록 (⭐️ 요거만 남음)
app.use("/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerDocs));

// 에러 핸들러
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(err.statusCode || 500).error({
    errorCode: err.errorCode || "unknown",
    reason: err.reason || err.message || null,
    data: err.data || null,
  });
});

// 서버 실행
app.listen(port, () => {
  console.log(`🚀 Node.js Server listening on port ${port}`);
  console.log(`📌 Swagger Docs: http://localhost:${port}/docs`);
});
