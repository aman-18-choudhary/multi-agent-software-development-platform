import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <SignUp />
    </div>
  );
}
