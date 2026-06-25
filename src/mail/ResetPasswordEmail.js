// mail/ResetPasswordEmail.js
// Hàm cho Nodemailer (trả về HTML string)
// Design match với React Email template

export function renderResetPasswordEmail({ resetUrl, userName }) {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
            <tr>
                <td align="center">
                    <table width="520" cellpadding="0" cellspacing="0"
                        style="background-color:#ffffff;border-radius:12px;padding:40px;max-width:520px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                        <!-- Logo -->
                        <tr>
                            <td align="center" style="padding-bottom:24px;">
                                <img src="https://i.ibb.co/bRbhrtvK/logo.png" alt="logo" style="width: 200px; height: 80px;">
                            </td>
                        </tr>

                        <!-- Heading -->
                        <tr>
                            <td align="center" style="padding-bottom:16px;">
                                <h1 style="font-size:26px;font-weight:700;color:#111827;margin:0;">Quên mật khẩu?</h1>
                            </td>
                        </tr>

                        <!-- Body text -->
                        <tr>
                            <td style="font-size:15px;color:#374151;line-height:1.6;padding-bottom:8px;">
                                Xin chào${userName ? ` ${userName}` : " bạn"},
                            </td>
                        </tr>
                        <tr>
                            <td style="font-size:15px;color:#374151;line-height:1.6;padding-bottom:32px;">
                                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                                Nhấn vào nút bên dưới để tạo mật khẩu mới:
                            </td>
                        </tr>

                        <!-- Button -->
                        <tr>
                            <td align="center" style="padding-bottom:32px;">
                                <a href="${resetUrl}"
                                   style="display:inline-block;background-color:#E71E23;color:#ffffff;
                                          padding:14px 32px;border-radius:8px;font-weight:600;
                                          font-size:15px;text-decoration:none;">
                                    Đặt lại mật khẩu
                                </a>
                            </td>
                        </tr>

                        <!-- Expiry note -->
                        <tr>
                            <td style="font-size:15px;color:#374151;line-height:1.6;padding-bottom:8px;">
                                Link này sẽ hết hạn sau <strong>1 giờ</strong>.
                            </td>
                        </tr>
                        <tr>
                            <td style="font-size:15px;color:#374151;line-height:1.6;padding-bottom:28px;">
                                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này —
                                tài khoản của bạn vẫn an toàn.
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr>
                            <td style="border-top:1px solid #e5e7eb;padding-bottom:16px;"></td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="font-size:12px;color:#9ca3af;line-height:1.5;padding-bottom:4px;">
                                Nếu nút không hoạt động, hãy sao chép và dán link sau vào trình duyệt:
                            </td>
                        </tr>
                        <tr>
                            <td style="font-size:11px;color:#6b7280;word-break:break-all;">
                                ${resetUrl}
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
}