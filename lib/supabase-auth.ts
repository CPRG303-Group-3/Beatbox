import { supabase } from "./supabase";

export async function signUp(email: string, name: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.log("Sign Up Error", error);
    throw error;
  }

  if (data.user) {
    const { error: userError } = await supabase.from("user").insert({
      email: email,
      name: name,
    });

    if (userError) {
      console.log("User Error", userError);
      throw userError;
    }
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log("Sign In Error: ", error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
