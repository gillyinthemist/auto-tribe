import Logo from '@/app/ui/autotribe-logo';
import LoginForm from '../ui/login-form';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6 md:justify-center">
      <div className="flex flex-col items-center gap-5 rounded-lg bg-raisin p-6 md:justify-center md:self-center">
        {<Logo />}
        <LoginForm />
      </div>
    </main>
  );
}
