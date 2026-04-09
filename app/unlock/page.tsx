import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/form-status";
import { FlashNotice } from "@/components/finflow-sections";
import { unlockAppAction } from "@/app/security-actions";

export default async function UnlockPage({
  searchParams,
}: {
  searchParams?: Promise<{ flash?: string; tone?: "success" | "error"; next?: string }>;
}) {
  if (!process.env.APP_PIN) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const nextPath = params?.next?.startsWith("/") ? params.next : "/dashboard";

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="auth-kicker">FinFlow protegido</p>
        <h1>Digite seu PIN para entrar</h1>
        <p className="auth-copy">
          Esta protecao minima evita acesso casual ao app publicado. O PIN e validado no servidor antes de liberar a navegacao.
        </p>

        <FlashNotice message={params?.flash} tone={params?.tone} />

        <form action={unlockAppAction} className="auth-form">
          <input type="hidden" name="next" value={nextPath} />
          <label className="field">
            <span>PIN</span>
            <input name="pin" type="password" inputMode="numeric" placeholder="Digite seu PIN" required />
          </label>

          <SubmitButton className="primary-button" idleLabel="Desbloquear app" pendingLabel="Validando..." />
        </form>
      </section>
    </main>
  );
}
