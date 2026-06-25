import {  METHODS } from "@/constant/constant";

function cartProductPrice(product) {
    let price = product.basePrice ?? product.price ?? 0;
    if (product.size) price += product.size.price ?? 0;
    if (product.extras?.length) {
        for (const extra of product.extras) price += extra.price ?? 0;
    }
    return price * (product.quantity ?? 1);
}

export function renderOrderInvoiceEmail({ order, subtotal, deliveryFee, earnedPoints }) {
    const fmt = (price) => `${(price ?? 0).toLocaleString("vi-VN")}đ`;

    const discountAmount = order?.pointDiscount?.discountAmount ?? 0;
    const discountPercent = order?.pointDiscount?.discountPercent ?? 0;
    const total = subtotal + deliveryFee - discountAmount;
    const paymentLabel = METHODS?.find(m => m.value === order?.paymentMethod)?.label ?? order?.paymentMethod;

    const itemsHtml = (order.cartProducts ?? []).map(product => {
        const price = cartProductPrice(product);
        return `
        <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#222;">
                ${product.name}
                ${product.size ? `<span style="color:#888;font-size:12px;"> · ${product.size.name}</span>` : ""}
                ${product.noteOrder ? `<div style="font-size:12px;color:#999;margin-top:2px;">Ghi chú: ${product.noteOrder}</div>` : ""}
            </td>
            <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#555;">x${product.quantity ?? 1}</td>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:600;color:#222;white-space:nowrap;">${fmt(price)}</td>
        </tr>`;
    }).join("");

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;">
<tr><td align="center" style="padding:32px 16px;">

<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

    <!-- Header -->
    <tr>
        <td style="background:#ffd6d8;padding:28px 32px;text-align:center;">
            <img src="https://i.ibb.co/bRbhrtvK/logo.png" alt="Pizza Teo" style="width:200px;height:80px;display:block;margin:0 auto;" />
            <p style="margin:8px 0 0;color:#e63946;font-size:14px;text-transform:uppercase;font-weight:600;">Hóa đơn thanh toán</p>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="padding:28px 32px 0;">

            <!-- Greeting -->
            <p style="margin:0 0 4px;font-size:15px;color:#222;">Xin chào <strong>${order.userName || "bạn"}</strong>,</p>
            <p style="margin:0 0 24px;font-size:14px;color:#555;">Đơn hàng của bạn đã được thanh toán thành công. Cảm ơn bạn đã tin tưởng Pizza Teo! 🎉</p>

            <!-- 2 box info — dùng table thay grid -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr valign="top">
                    <!-- Giao đến -->
                    <td width="48%" style="padding:16px 20px;border:1px solid #e8e8e8;border-radius:12px;">
                        <p style="margin:0 0 10px;font-weight:700;font-size:14px;color:#222;">${order.deliveryInfo?.mode === "delivery" ? "Giao đến" : "Mua mang về tại"}</p>
                        <p style="margin:0 0 4px;font-size:13px;color:#555;"><strong>Khách hàng:</strong> ${order.userName}</p>
                        <p style="margin:0 0 4px;font-size:13px;color:#555;">${order.phone}</p>
                        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#222;">${order.deliveryInfo?.address || order.deliveryInfo?.store?.name || ""}</p>
                        ${order.deliveryInfo?.store?.address ? `<p style="margin:0 0 4px;font-size:13px;color:#555;">${order.deliveryInfo.store.address}</p>` : ""}
                        ${order.noteDelivery ? `<p style="margin:0;font-size:12px;color:#999;font-style:italic;">Ghi chú: ${order.noteDelivery}</p>` : ""}
                    </td>
                    <td width="4%"></td>
                    <!-- Thanh toán -->
                    <td width="48%" style="padding:16px 20px;border:1px solid #e8e8e8;border-radius:12px;">
                        <p style="margin:0 0 10px;font-weight:700;font-size:14px;color:#222;">Phương thức thanh toán</p>
                        <p style="margin:0 0 10px;font-size:13px;color:#555;">${paymentLabel}</p>
                        <span style="display:inline-block;padding:4px 14px;border-radius:8px;font-size:13px;font-weight:600;background:${order.paid ? "#dcfce7" : "#fee2e2"};color:${order.paid ? "#15803d" : "#dc2626"};">${order.paid ? "Đã thanh toán" : "Chưa thanh toán"}</span>
                        <p style="margin:10px 0 0;font-size:12px;color:#999;">Mã đơn: #${order._id}</p>
                    </td>
                </tr>
            </table>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <thead>
                    <tr style="border-bottom:2px solid #f0f0f0;">
                        <th style="padding:8px 0;text-align:left;font-size:13px;color:#888;font-weight:600;">Sản phẩm</th>
                        <th style="padding:8px 8px;text-align:center;font-size:13px;color:#888;font-weight:600;white-space:nowrap;">SL</th>
                        <th style="padding:8px 0;text-align:right;font-size:13px;color:#888;font-weight:600;white-space:nowrap;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <!-- CartSubtotal — dùng table thay flex -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;border:1px solid #e8e8e8;border-radius:12px;">
                <tr><td style="padding:16px 20px;">

                    <!-- Tạm tính -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                        <tr>
                            <td style="font-size:14px;color:#222;">Tạm tính</td>
                            <td style="font-size:14px;font-weight:600;color:#222;text-align:right;white-space:nowrap;">${fmt(subtotal)}</td>
                        </tr>
                    </table>

                    <!-- Giảm giá -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                        <tr>
                            <td style="font-size:14px;color:#222;">Giảm giá thành viên</td>
                            <td style="font-size:14px;font-weight:600;color:#0a8020;text-align:right;white-space:nowrap;">(${discountPercent}%) ${fmt(discountAmount)}</td>
                        </tr>
                    </table>

                    <!-- Phí giao hàng -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding-bottom:12px;border-bottom:1px solid #f0f0f0;margin-bottom:12px;">
                        <tr>
                            <td style="font-size:14px;color:#222;">Phí giao hàng</td>
                            <td style="font-size:14px;font-weight:600;color:#222;text-align:right;white-space:nowrap;">${fmt(deliveryFee)}</td>
                        </tr>
                    </table>

                    <!-- Tổng cộng -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr valign="middle">
                            <td style="font-size:14px;color:#222;">Tổng cộng</td>
                            <td style="text-align:right;">
                                <div style="font-size:22px;font-weight:800;color:#222;">${fmt(total)}</div>
                                <div style="font-size:13px;color:#888;margin-top:2px;">Nhận <strong style="color:#222;">${earnedPoints} điểm</strong> Teo rewards</div>
                            </td>
                        </tr>
                    </table>

                    ${earnedPoints > 0 ? `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                        <tr>
                            <td style="padding:10px 14px;background:#fff8e1;border-radius:8px;font-size:13px;color:#b45309;">
                                🌟 Bạn vừa nhận được <strong>${earnedPoints} điểm</strong> Teo rewards từ đơn hàng này!
                            </td>
                        </tr>
                    </table>` : ""}

                </td></tr>
            </table>

            <!-- Hỗ trợ -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;margin-bottom:28px;border:1px solid #e8e8e8;border-radius:12px;">
                <tr>
                    <td style="padding:16px 20px;">
                        <p style="margin:0 0 8px;font-weight:700;font-size:14px;color:#222;">Có câu hỏi về đơn hàng?</p>
                        <p style="margin:0 0 4px;font-size:13px;color:#555;">Gọi đến Tổng đài Dịch vụ Khách hàng: <strong style="color:#e63946;">19001822</strong></p>
                        <p style="margin:0;font-size:12px;color:#999;">Đơn hàng không thể thay đổi hoặc hủy từ trang web. Vui lòng gọi cho chúng tôi.</p>
                    </td>
                </tr>
            </table>

        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td style="padding:20px 32px;background:#f5f5f5;text-align:center;font-size:12px;color:#aaa;">
            © 2025 Pizza Teo. All rights reserved.
        </td>
    </tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}