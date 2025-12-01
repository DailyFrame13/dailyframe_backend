export const swaggerDocs = {
  openapi: "3.0.0",
  info: {
    title: "DailyFrame API",
    version: "1.0.0",
    description: "AI Diary Generator",
  },
  paths: {
    "/api/v1/generate": {
      post: {
        tags: ["Poster"],
        summary: "이미지를 업로드하면 AI 포스터 생성",
        requestBody: {
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
                    description: "업로드할 이미지 파일들 (최대 3장)"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "포스터 생성 성공" },
          500: { description: "서버 오류" }
        }
      }
    }
  }
};
