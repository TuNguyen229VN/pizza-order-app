export function dbTimeForHuman(str) {

  // return str.replace('T', ' ').substring(0, 16);

   return new Date(str).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
     });
}