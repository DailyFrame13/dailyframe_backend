import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const processImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);

    // Python 서버로 요청 (포트 8000번 확인!)
    const response = await axios.post('http://127.0.0.1:8000/generate', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: 'arraybuffer' // 이미지를 바이너리로 받음
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};