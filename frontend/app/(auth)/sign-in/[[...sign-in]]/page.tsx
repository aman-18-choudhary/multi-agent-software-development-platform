import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <SignIn />
    </div>
  );
}
