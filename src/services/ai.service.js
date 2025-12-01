import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const processImage = async (files) => {
  try {
    const formData = new FormData();

    // [핵심] 여러 장의 파일을 'files'라는 키값으로 계속 추가
    // FastAPI: generate_diary(files: list[UploadFile]) 와 매칭됨
    files.forEach((file) => {
      formData.append('files', fs.createReadStream(file.path), file.originalname);
    });
    
    // 환경변수에서 AI 서버 주소 가져오기
    // 예: https://abcd-1234.ngrok-free.app
    const aiBaseUrl = process.env.AI_API_URL || 'http://127.0.0.1:8000';

    console.log(`[AI Service] 요청 전송: ${aiBaseUrl}/generate (파일 ${files.length}개)`);

    // AI 서버로 POST 요청
    const response = await axios.post(`${aiBaseUrl}/generate`, formData, {
      headers: {
        ...formData.getHeaders(), // Multipart 헤더 자동 생성
      },
      responseType: 'arraybuffer', // ⭐ 중요: 이미지 파일(바이너리)을 받아야 함
      timeout: 180000 // 3분 (이미지 처리가 오래 걸릴 수 있으므로 넉넉하게)
    });

    return response.data; // 이미지 데이터 반환
  } catch (error) {
    // 에러 로그 상세 출력
    if (error.response) {
        console.error(`[AI Error] Status: ${error.response.status}`);
        try { console.error(`[AI Error] Data: ${error.response.data.toString()}`); } catch(e) {}
    } else {
        console.error(`[AI Error] ${error.message}`);
    }
    throw error;
  }
};