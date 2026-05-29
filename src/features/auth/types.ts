export type AuthError = {
  message: string;
};

export type AuthResult =
  | { success: true; redirectTo: string }
  | { success: false; error: AuthError };

export type SignupResult = AuthResult;
export type LoginResult = AuthResult;
export type LogoutResult = { success: true };
