import { processImage } from "../services/ai.service.js";
import fs from "fs";

export const generateDiary = async (req, res, next) => {
  try {
    // 1. 파일 확인 (단일 파일 req.file이 아니라 배열 req.files 확인)
    if (!req.files || req.files.length === 0) {
        return res.status(400).error({
            errorCode: "FILE_MISSING",
            reason: "업로드된 파일이 없습니다."
        });
    }

    console.log(`[AI Controller] 파일 처리 시작: 총 ${req.files.length}장`);

    // 2. 서비스 호출 (배열 전달)
    // processImage 함수가 AI 서버와 통신 후 이미지 버퍼(binary)를 리턴합니다.
    const imageBuffer = await processImage(req.files);

    // 3. 임시 파일 삭제 (반복문)
    req.files.forEach((file) => {
        try {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        } catch (e) {
            console.error(`임시 파일 삭제 실패: ${file.path}`, e);
        }
    });

    // 4. 결과 응답 (이미지 파일 전송)
    // AI 서버가 파일을 줬으므로 우리도 프론트엔드에 파일을 줍니다.
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);

  } catch (err) {
    // 에러 발생 시 임시 파일 청소
    if (req.files) {
        req.files.forEach((file) => {
            try {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            } catch (e) {}
        });
    }
    next(err);
  }
};