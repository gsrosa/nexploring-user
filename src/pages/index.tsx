import Link from 'next/link';

export default function UserHomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-12 text-neutral-100">
      <h1 className="text-2xl font-bold">User account</h1>
      <nav className="mt-6 flex flex-col gap-3 text-sm text-primary-400">
        <Link href="/profile">Profile</Link>
        <Link href="/profile/settings">Settings</Link>
        <Link href="/profile/password">Password</Link>
        <Link href="/profile/onboarding">Preferences onboarding</Link>
      </nav>
    </main>
  );
}
