import type { ActionState } from "@/lib/validation";

export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  const firstError = state.errors ? Object.values(state.errors).flat()[0] : undefined;
  return (
    <p className={`form-message form-message-${state.status}`} role="status">
      {state.message ?? firstError}
    </p>
  );
}

