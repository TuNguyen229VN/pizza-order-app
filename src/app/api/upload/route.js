import axios from "axios";
import FormData from "form-data";

export async function POST(req) {
  const data = await req.formData();
  if (data.get("file")) {
    // Lấy file từ form data
    const file = data.get("file");
    const fileName = file.name;

    // Chuyển file thành buffer
    const chunks = [];
    for await (const chunk of file.stream()) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    // Tạo instance của FormData để tải lên ImgBB
    const formData = new FormData();
    formData.append("image", buffer.toString("base64"));
    formData.append("name", fileName.split(".")[0]);
    
    // Thay 'your-imgbb-api-key' bằng API key thực của bạn
    const url = `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`;
    try {
      // Thực hiện yêu cầu POST để tải ảnh lên
      const response = await axios.post(url, formData, {
        headers: formData.getHeaders(),
      });

      // Lấy URL của ảnh từ phản hồi
      const imageUrl = response.data.data.url;
      return new Response(JSON.stringify({ url: imageUrl }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Lỗi khi tải lên ImgBB:", error);
      return new Response(JSON.stringify({ error: "Error upload file" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  return new Response(JSON.stringify(true), {
    headers: { "Content-Type": "application/json" },
  });
}

