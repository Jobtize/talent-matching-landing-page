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
    } & DefaultSession["user"];
  }
}

