
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const getAdminEmail = () =>
  process.env.ADMIN_EMAIL?.trim().toLowerCase();

const getAdminGitHubId = () =>
  process.env.ADMIN_GITHUB_ID?.trim();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],

  pages: {
    signIn: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },

  callbacks: {
    async signIn({ user, profile }) {
      const adminEmail = getAdminEmail();
      const userEmail = user.email?.trim().toLowerCase();

      const adminGitHubId = getAdminGitHubId();
      const githubProfile = profile as
        | { id?: string | number }
        | undefined;
const githubId = githubProfile?.id?.toString();
      return Boolean(
        adminEmail &&
        adminGitHubId &&
        userEmail &&
        userEmail === adminEmail &&
        githubId &&
        githubId === adminGitHubId
      );
    },

    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;

      if (
        pathname === "/admin/login" ||
        pathname.startsWith("/api/auth")
      ) {
        return true;
      }

      if (pathname.startsWith("/admin")) {
        return Boolean(session?.user);
      }

      return true;
    },


    async jwt({ token, profile, user }) {
      const githubProfile = profile as
        | { id?: string | number }
        | undefined;

      const githubId =
        githubProfile?.id?.toString() ?? user?.id;

      if (githubId) {
        (token as typeof token & { githubId?: string }).githubId =
          githubId;
      }

      return token;
    },

    async session({ session, token }) {
      const githubId = (
        token as typeof token & { githubId?: string }
      ).githubId;

      if (session.user && githubId) {
        (
          session.user as typeof session.user & {
            githubId?: string;
          }
        ).githubId = githubId;
      }

      return session;
    },



  },
});
