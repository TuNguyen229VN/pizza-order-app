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

// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import uniqid from "uniqid";
// export async function POST(req) {
//   const data = await req.formData();
//   if (data.get("file")) {
//     // upload the file
//     const file = data.get("file");
//     const s3Client = new S3Client({
//       region: "",
//       credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY,
//         secretAccessKey: process.env.AWS_SECRET_KEY,
//       },
//     });

//     const ext = file.name.split(".").slice(-1)[0];
//     const newFileName = uniqid() + "." + ext;

//     const chunks = [];
//     for await (const chunk of file.stream()) {
//       chunks.push(chunk);
//     }
//     const buffer = Buffer.concat(chunks);

//     const bucket = "";
//     S3Client.send(
//       new PutObjectCommand({
//         Bucket: bucket,
//         Key: newFileName,
//         ACL: "public-read",
//         ContentType: file.type,
//         Body: buffer,
//       })
//     );
//     const link = `https://${bucket}.s3.amazonaws.com/` + newFileName;
//     return Response.json(link);
//   }
//   return Response.json(true);
// }
