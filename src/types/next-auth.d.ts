import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Estendendo o objeto User
   */
  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    headline?: string;
    industry?: string;
    profileUrl?: string;
    location?: string;
    connections?: number;
  }

  /**
   * Estendendo o objeto Session
   */
  interface Session {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      accessToken?: string;
      headline?: string;
      industry?: string;
      profileUrl?: string;
      location?: string;
      connections?: number;
    } & DefaultSession["user"];
  }

  /**
   * Estendendo o objeto JWT
   */
  interface JWT {
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    expiresAt?: number;
    headline?: string;
    industry?: string;
    profileUrl?: string;
    location?: string;
    connections?: number;
  }
}
