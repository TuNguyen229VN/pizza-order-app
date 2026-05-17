/**
 * React Email template – dùng với `@react-email/components`
 * npm i @react-email/components resend
 */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function ResetPasswordEmail({ resetUrl, userName }) {
  return (
    <Html>
      <Head />
      <Preview>Đặt lại mật khẩu của bạn</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo / Brand */}
          <Section style={logoSection}>
            <Text style={logo}>🍕 Pizza Teo</Text>
          </Section>

          <Heading style={heading}>Quên mật khẩu?</Heading>

          <Text style={paragraph}>
            Xin chào{userName ? ` ${userName}` : ""},
          </Text>
          <Text style={paragraph}>
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của
            bạn. Nhấn vào nút bên dưới để tạo mật khẩu mới:
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={resetUrl}>
              Đặt lại mật khẩu
            </Button>
          </Section>

          <Text style={paragraph}>
            Link này sẽ hết hạn sau <strong>1 giờ</strong>.
          </Text>
          <Text style={paragraph}>
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này —
            tài khoản của bạn vẫn an toàn.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Nếu nút không hoạt động, hãy sao chép và dán link sau vào trình
            duyệt:
          </Text>
          <Text style={footerLink}>{resetUrl}</Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const main = {
  backgroundColor: "#f4f4f5",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container = {
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
  maxWidth: "520px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const logoSection = { textAlign: "center", marginBottom: "24px" };
const logo = { fontSize: "24px", fontWeight: "700", margin: "0" };

const heading = {
  fontSize: "26px",
  fontWeight: "700",
  color: "#111827",
  textAlign: "center",
  marginBottom: "16px",
};

const paragraph = { fontSize: "15px", color: "#374151", lineHeight: "1.6" };

const btnContainer = { textAlign: "center", margin: "32px 0" };

const button = {
  backgroundColor: "#E71E23",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "15px",
  textDecoration: "none",
  display: "inline-block",
};

const hr = { borderColor: "#e5e7eb", margin: "28px 0 16px" };

const footer = { fontSize: "12px", color: "#9ca3af", lineHeight: "1.5" };
const footerLink = { fontSize: "11px", color: "#6b7280", wordBreak: "break-all" };