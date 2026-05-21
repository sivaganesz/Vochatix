import { AuthCard } from '@/components/auth/AuthCard';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      subtitle="Join Vochatix to start chatting"
    >
      <RegisterForm />
    </AuthCard>
  );
}
