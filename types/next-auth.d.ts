// Fix NextAuth Types
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            phoneNumber?: string | null;
        } & DefaultSession['user'];
    }
}
