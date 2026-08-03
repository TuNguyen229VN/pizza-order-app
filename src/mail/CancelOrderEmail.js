// mail/CancelOrderEmail.js
export function renderCancelOrderEmail({ orderId, userName, total, refunded, paymentMethod }) {
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
                                <h1 style="font-size:26px;font-weight:700;color:#111827;margin:0;">Đơn hàng đã bị hủy</h1>
                            </td>
                        </tr>

                        <!-- Body text -->
                        <tr>
                            <td style="font-size:15px;color:#374151;line-height:1.6;padding-bottom:8px;">
                                Xin chào${userName ? ` ${userName}` : " bạn"},
                            </td>
                        </tr>
                        <tr>
                            <td style="font-size:15px;color:#374151;line-height:1.6;padding-bottom:24px;">
                                Đơn hàng <strong>#${orderId}</strong> của bạn đã được hủy thành công.
                            </td>
                        </tr>

                        <!-- Order info box -->
                        <tr>
                            <td style="background-color:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="font-size:14px;color:#6b7280;padding-bottom:6px;">Mã đơn hàng</td>
                                        <td align="right" style="font-size:14px;color:#111827;font-weight:600;padding-bottom:6px;">#${orderId}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size:14px;color:#6b7280;padding-bottom:6px;">Tổng tiền</td>
                                        <td align="right" style="font-size:14px;color:#111827;font-weight:600;padding-bottom:6px;">${Number(total).toLocaleString("vi-VN")}đ</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size:14px;color:#6b7280;">Trạng thái thanh toán</td>
                                        <td align="right" style="font-size:14px;color:#111827;font-weight:600;">
                                            ${refunded
                                                ? "Đã hoàn tiền"
                                                : paymentMethod === "cod"
                                                    ? "COD - không phát sinh thanh toán"
                                                    : "Đang hoàn tiền hoặc chưa thanh toán"}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr><td style="padding-bottom:24px;"></td></tr>

                        ${refunded ? `
                        <tr>
                            <td style="font-size:15px;color:#374151;line-height:1.6;padding-bottom:28px;">
                                Số tiền sẽ được hoàn về phương thức thanh toán ban đầu của bạn trong vòng <strong>3-5 ngày làm việc</strong>.
                            </td>
                        </tr>` : ""}

                        <tr>
                            <td style="font-size:15px;color:#374151;line-height:1.6;padding-bottom:28px;">
                                Nếu đây không phải yêu cầu của bạn, hoặc bạn cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi.
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr>
                            <td style="border-top:1px solid #e5e7eb;padding-bottom:16px;"></td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="font-size:12px;color:#9ca3af;line-height:1.5;">
                                Cảm ơn bạn đã sử dụng dịch vụ của Pizza Teo.
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