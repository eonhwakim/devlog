import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      authorization: {
        params: { scope: "read:user repo" }, // repo 스코프: 커밋/PR 데이터 접근
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 로그인 시 GitHub access token 저장
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // 세션에 access token 노출
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
