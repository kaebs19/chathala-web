"use client";

const APPLE_CLIENT_ID = "com.app.hala.web";
const REDIRECT_URI = "https://chathala.com/api/auth/apple/callback";

export function initAppleSignIn() {
  // Load Apple JS SDK
  if (typeof window === "undefined") return;
  if (document.getElementById("apple-signin-sdk")) return;

  const script = document.createElement("script");
  script.id = "apple-signin-sdk";
  script.src =
    "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
  script.onload = () => {
    window.AppleID?.auth.init({
      clientId: APPLE_CLIENT_ID,
      scope: "name email",
      redirectURI: REDIRECT_URI,
      usePopup: true,
    });
  };
  document.head.appendChild(script);
}

export async function signInWithApple(): Promise<{
  identityToken: string;
  authorizationCode: string;
  fullName?: { givenName?: string; familyName?: string };
  email?: string;
} | null> {
  try {
    if (!window.AppleID) {
      initAppleSignIn();
      await new Promise((r) => setTimeout(r, 1000));
    }

    const response = await window.AppleID!.auth.signIn();
    return {
      identityToken: response.authorization.id_token,
      authorizationCode: response.authorization.code,
      fullName: response.user?.name,
      email: response.user?.email,
    };
  } catch (error) {
    console.error("Apple Sign In error:", error);
    return null;
  }
}

// Type declaration for Apple JS SDK
declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: {
            id_token: string;
            code: string;
          };
          user?: {
            name?: { givenName?: string; familyName?: string };
            email?: string;
          };
        }>;
      };
    };
  }
}
