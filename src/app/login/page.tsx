import { AuthForm } from '@/components/auth/AuthForm';
import AuthGuard from '@/components/auth/AuthGuard';

export default function LoginPage() {
  return (
    <AuthGuard>
      <div className="flex justify-center items-center pt-16">
        <AuthForm />
      </div>
    </AuthGuard>
  );
}
