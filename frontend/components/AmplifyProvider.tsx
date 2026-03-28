"use client";
import { Amplify } from "aws-amplify";

// Configure immediately at module level, not inside useEffect
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      signUpVerificationMethod: "code",
    },
  },
});

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}