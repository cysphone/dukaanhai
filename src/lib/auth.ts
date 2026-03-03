import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or WhatsApp Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Email/Phone and password required');
        }

        let identifier = credentials.identifier.trim();

        // Auto-prepend +91 for 10-digit phone numbers
        if (/^\d{10}$/.test(identifier)) {
          identifier = `+91${identifier}`;
        } else if (/^\d{12}$/.test(identifier) && identifier.startsWith('91')) {
          identifier = `+${identifier}`;
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { phoneNumber: identifier },
              { phoneNumber: identifier.replace('+', '') }
            ]
          },
        });

        if (!user || (!user.password && user.createdVia === "whatsapp")) {
          throw new Error('No valid account found or password not set.');
        } else if (!user.password) {
          throw new Error('Please login via magic link to set a password first.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.phoneNumber = (user as any).phoneNumber;
      }
      if (trigger === "update" && session !== null) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.phoneNumber) token.phoneNumber = session.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).phoneNumber = token.phoneNumber as string | null;
      }
      return session;
    },
  },
};
