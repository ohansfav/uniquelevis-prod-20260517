import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signInWithGoogleIdToken = async (idToken: string) => {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    accessToken: data.session?.access_token || "",
    refreshToken: data.session?.refresh_token || "",
    user: {
      id: data.user?.id || "",
      email: data.user?.email || "",
      firstName: data.user?.user_metadata?.first_name || "",
    },
  };
};
