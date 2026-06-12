import { Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "@/components/AppContext";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "leaflet/dist/leaflet.css";
import { DeliveryProvider } from "@/context/DeliveryContext";
import { NotificationProvider } from "@/context/NotificationContext";

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
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `if (window.location.hash) { history.scrollRestoration = "manual"; window.scrollTo(0,0); }`
        }} />
      </head>
      <body className={roboto.className}>
        <AppProvider>
          <DeliveryProvider>
            <NotificationProvider>
              <Toaster
                position="top-right"
              />
              {children}
            </NotificationProvider>
          </DeliveryProvider>
        </AppProvider>
        {/* <Analytics />
        <SpeedInsights /> */}
      </body>
    </html>
  );
}
