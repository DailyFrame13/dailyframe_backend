import { processImage } from "../services/ai.service.js";
import fs from "fs";

export const generateDiary = async (req, res, next) => {
  try {
    if (!req.file) {
        // 프로젝트의 에러 처리 방식 활용
        return res.status(400).error({
            errorCode: "FILE_MISSING",
            reason: "업로드된 파일이 없습니다."
        });
    }

    console.log(`[AI Controller] 파일 처리 시작: ${req.file.originalname}`);

    // 서비스 호출
    const imageBuffer = await processImage(req.file);

    // 임시 파일 삭제
    fs.unlinkSync(req.file.path);

    // ✅ 이미지는 JSON 포맷(res.success)이 아니라 바이너리(파일)로 바로 보냅니다.
    // 프론트엔드에서 Blob으로 받아서 처리해야 합니다.
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);

  } catch (err) {
    // 임시 파일이 남아있으면 삭제
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    // 전역 에러 핸들러로 넘김
    next(err);
  }
};