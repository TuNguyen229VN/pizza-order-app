import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import AppProvider from "@/components/AppContext";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/layout/Footer";

const roboto = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "PizzaTeo | Home",
  description: "Pizza ngon, giá cả phải chăng Tận hưởng hương vị đặc trưng của Pizza Teo với ưu đãi đến 40% cho Combo tiệc tại gia, phục vụ 2-6 người. Pizza nóng hổi, giòn ngon kèm theo đồ ăn khai vị đa dạng, hứa hẹn một bữa tiệc tuyệt vời! Đặt hàng ngay để trải nghiệm!",
  icons: {
    icon: '/favicon1.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="scroll-smooth" suppressHydrationWarning={true}>
      <body className={roboto.className}>     
          <AppProvider>
            <Toaster
              position="top-right"
            />
            {children}
          </AppProvider>
        {/* <Analytics />
        <SpeedInsights /> */}
      </body>
    </html>
  );
}
