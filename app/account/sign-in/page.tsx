import AuthForm from "../AuthForm";

export default async function SignInPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <AuthForm mode="sign-in" linkError={params?.error === "link"} />;
}
