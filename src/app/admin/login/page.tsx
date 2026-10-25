import { signIn } from "@/auth";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center">
        <p className="text-sm font-medium tracking-[0.3em] text-violet-300">
          PRIVATE ACCESS
        </p>

        <h1 className="mt-4 text-3xl font-semibold">
          Admin sign in
        </h1>

        <p className="mt-3 text-sm text-zinc-400">
          Sign in using the authorized GitHub account.
        </p>

        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/admin" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-violet-100"
          >
            Continue with GitHub
          </button>
        </form>

        <a
          href="/"
          className="mt-6 inline-block text-sm text-zinc-400 hover:text-white"
        >
          Back to portfolio
        </a>
      </div>
    </main>
  );
}