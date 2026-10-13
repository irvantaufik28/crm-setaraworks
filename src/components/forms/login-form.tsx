"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { FormMessage } from "@/components/ui/form-message";
import { initialActionState } from "@/lib/validation";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialActionState);

  return (
    <form action={action} className="auth-form">
      <div className="field">
        <label htmlFor="email">Email admin</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="admin@setaraworks.id" required />
        {state.errors?.email?.map((error) => <small className="field-error" key={error}>{error}</small>)}
      </div>
      <div className="field">
        <label htmlFor="password">Kata sandi</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        {state.errors?.password?.map((error) => <small className="field-error" key={error}>{error}</small>)}
      </div>
      <FormMessage state={state} />
      <button className="button button-primary button-block" type="submit" disabled={pending}>
        {pending ? "Memeriksa akun..." : "Masuk ke CRM"}
      </button>
    </form>
  );
}

