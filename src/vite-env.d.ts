/// <reference types="vite/client" />

declare module "@lovable.dev/cloud-auth-js" {
  export type OAuthProvider = "google" | "apple" | "microsoft" | "lovable";

  export type OAuthTokens = {
    access_token: string;
    refresh_token: string;
  };

  export type SignInWithOAuthOptions = {
    redirect_uri?: string;
    extraParams?: Record<string, string>;
  };

  export type SignInWithOAuthResult =
    | { tokens: OAuthTokens; error: null; redirected?: false }
    | { tokens?: undefined; error: Error; redirected?: false }
    | { tokens?: undefined; error: null; redirected: true };

  export type LovableAuthConfig = {
    oauthBrokerUrl?: string;
    supportedOAuthOrigins?: string[];
  };

  export type LovableAuth = {
    signInWithOAuth: (
      provider: OAuthProvider,
      opts?: SignInWithOAuthOptions,
    ) => Promise<SignInWithOAuthResult>;
  };

  export function createLovableAuth(config?: LovableAuthConfig): LovableAuth;
}
