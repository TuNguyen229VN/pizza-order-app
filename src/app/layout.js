import { Roboto, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import AppProvider from "@/components/AppContext";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const roboto = Roboto({ 
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning={true}>
      <body className={roboto.className}>
        <main className="max-w-6xl p-4 mx-auto">
          <AppProvider>
            <Toaster
              position="top-right"
            />
            <Header />
            {children}
            <footer className="p-8 mt-16 text-center text-gray-500 border-t">
              &copy; 2024 All rights reserved
            </footer>
          </AppProvider>
        </main>
         <Analytics />
         <SpeedInsights/>
      </body>
    </html>
  );
}
