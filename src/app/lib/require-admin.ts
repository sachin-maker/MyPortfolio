
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminGitHubId = process.env.ADMIN_GITHUB_ID?.trim();

  const sessionEmail = session.user.email?.trim().toLowerCase();

  const sessionGitHubId = (
    session.user as typeof session.user & {
      githubId?: string;
    }
  ).githubId;

  if (
    !adminEmail ||
    !adminGitHubId ||
    !sessionEmail ||
    !sessionGitHubId ||
    sessionEmail !== adminEmail ||
    sessionGitHubId !== adminGitHubId
  ) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  return null;
}
