import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const processImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);
    
    const response = await axios.post('http://127.0.0.1:8000/generate', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: 'arraybuffer',
      timeout: 60000
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};