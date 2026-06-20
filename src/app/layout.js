import { Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "@/components/AppContext";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "leaflet/dist/leaflet.css";
import { DeliveryProvider } from "@/context/DeliveryContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const roboto = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// export const metadata = {
//   metadataBase:"",
//   title: "PizzaTeo | Home",
//   description: "Pizza ngon, giá cả phải chăng Tận hưởng hương vị đặc trưng của Pizza Teo với ưu đãi đến 40% cho Combo tiệc tại gia, phục vụ 2-6 người. Pizza nóng hổi, giòn ngon kèm theo đồ ăn khai vị đa dạng, hứa hẹn một bữa tiệc tuyệt vời! Đặt hàng ngay để trải nghiệm!",
//   icons: {
//     icon: '/favicon1.ico',
//   },
// };

export const metadata = {
  metadataBase: new URL("https://pizzateo.vercel.app"),

  title: {
    default: "PizzaTeo - Pizza Delivery & Online Food Ordering",
    template: "%s | PizzaTeo",
  },

  description:
    "Pizza ngon, giá cả phải chăng Tận hưởng hương vị đặc trưng của Pizza Teo với ưu đãi đến 40% cho Combo tiệc tại gia, phục vụ 2-6 người. Pizza nóng hổi, giòn ngon kèm theo đồ ăn khai vị đa dạng, hứa hẹn một bữa tiệc tuyệt vời! Đặt hàng ngay để trải nghiệm!",

  keywords: [
    "PizzaTeo",
    "đặt pizza online",
    "pizza ngon",
    "pizza giao tận nơi",
    "pizza mang đi",
    "đặt đồ ăn trực tuyến",
    "đặt món ăn online",
    "combo pizza",
    "pizza giá rẻ",
    "khuyến mãi pizza",
    "giao đồ ăn",
    "thức ăn nhanh",
    "nhà hàng pizza",
    "pizza phô mai",
    "pizza hải sản",
    "pizza xúc xích",
    "đặt món trực tuyến",
    "food delivery",
    "tích điểm đổi thưởng",
    "thanh toán online"
  ],

  creator: "Teo",
  publisher: "PizzaTeo",

  applicationName: "PizzaTeo",

  category: "Food & Restaurant",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon1.ico",
    shortcut: "/favicon1.ico",
    apple: "/favicon1.ico",
  },

  alternates: {
    canonical: "https://pizzateo.vercel.app",
    languages: {
      en: "/en",
      vi: "/vi",
    },
  },

  openGraph: {
    title: "PizzaTeo - Pizza Delivery & Online Food Ordering",
    description:
      "Order delicious pizzas, combo meals, and side dishes online with fast delivery, takeaway options, reward points, and secure payments.",

    url: "https://pizzateo.vercel.app",
    siteName: "PizzaTeo",

    locale: "vi_VN",

    type: "website",

    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "PizzaTeo - Pizza Delivery & Online Food Ordering",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PizzaTeo - Pizza Delivery & Online Food Ordering",
    description:
      "Order delicious pizzas, combo meals, and side dishes online with delivery and takeaway options.",
    images: ["/twitter-image.png"],
  },

  appleWebApp: {
    capable: true,
    title: "PizzaTeo",
    statusBarStyle: "default",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};


export default async function RootLayout({ children }) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html lang="vi" className="scroll-smooth" suppressHydrationWarning={true}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `if (window.location.hash) { history.scrollRestoration = "manual"; window.scrollTo(0,0); }`
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `
      if (window.location.search.includes('debug=1')) {
        var box = document.createElement('div');
        box.id = '__debugbox';
        box.style.position = 'fixed';
        box.style.top = '0';
        box.style.left = '0';
        box.style.right = '0';
        box.style.zIndex = '2147483647';
        box.style.background = 'rgba(200,0,0,0.95)';
        box.style.color = '#fff';
        box.style.fontSize = '11px';
        box.style.lineHeight = '1.4';
        box.style.padding = '6px';
        box.style.maxHeight = '60vh';
        box.style.overflow = 'auto';
        box.style.whiteSpace = 'pre-wrap';
        box.style.fontFamily = 'monospace';
        document.documentElement.appendChild(box);

        function logMsg(msg) {
          var p = document.createElement('div');
          p.textContent = new Date().toISOString().slice(11,19) + ' ' + msg;
          box.appendChild(p);
        }

        logMsg('head script chạy');

        window.addEventListener('error', function(e) {
          logMsg('JS ERROR: ' + e.message + ' @ ' + e.filename + ':' + e.lineno);
        });
        window.addEventListener('unhandledrejection', function(e) {
          logMsg('PROMISE REJECT: ' + (e.reason && (e.reason.message || e.reason)));
        });
        document.addEventListener('DOMContentLoaded', function() {
          logMsg('DOMContentLoaded');
        });
        window.addEventListener('load', function() {
          logMsg('window load xong');
        });
      }
    `
        }} />
      </head>
      <body className={roboto.className}>
        <NextIntlClientProvider messages={messages} timeZone="Asia/Ho_Chi_Minh" locale={locale}>
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
        </NextIntlClientProvider>
        {/* <Analytics />
        <SpeedInsights /> */}
      </body>
    </html>
  );
}
