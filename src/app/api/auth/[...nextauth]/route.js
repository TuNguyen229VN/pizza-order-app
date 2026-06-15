import mongoose from "mongoose";
import NextAuth, { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/libs/mongoConnect";
import { UserInfo } from "@/models/UserInfo";
import { connectDB } from "@/libs/connectDB";


export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { prompt: "select_account" },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        username: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        await connectDB(); 
        const user = await User.findOne({ email });
        const passwordOk = user && bcrypt.compareSync(password, user.password);
        if (passwordOk) {
          const userInfo = await UserInfo.findOne({ email });
          if (userInfo?.status === "on") {
            throw new Error("AccountBlocked");
          }
          return user;
        }
        return null;
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      await connectDB(); 
      await User.findOneAndUpdate(
        { email: user.email },
        { $set: { createdAt: new Date() } }
      );
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      await connectDB(); 

      if (user) {
        token.id = user._id;
        token.email = user.email;
        token.name = user.name;
        const userInfo = await UserInfo.findOne({ email: user.email });
        token.admin = userInfo?.admin || false;
        token.status = userInfo?.status || "off";
        token.pointRewards = userInfo?.pointRewards ?? 0;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.admin !== undefined) token.admin = session.admin;
        if (session.status !== undefined) token.status = session.status;
      }

      // Realtime check status mỗi lần token được đọc
      if (token.email) {
        const userInfo = await UserInfo.findOne({ email: token.email });
        token.status = userInfo?.status || "off";
        token.pointRewards = userInfo?.pointRewards ?? 0;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.status === "on") return null;

      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        admin: token.admin,
        status: token.status,
        pointRewards: token.pointRewards ?? 0,
      };
      return session;
    },
  },
};

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) return false;
  await connectDB();
  const userInfo = await UserInfo.findOne({ email: userEmail });
  if (!userInfo) return false;
  return userInfo.admin;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };