import AuthForm from "@/components/auth/auth-form";

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Account</h1>
      <AuthForm />
    </div>
  );
}
