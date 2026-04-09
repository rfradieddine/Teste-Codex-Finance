"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE = "finflow_unlock";

export async function unlockAppAction(formData: FormData) {
  const configuredPin = process.env.APP_PIN;

  if (!configuredPin) {
    redirect("/dashboard");
  }

  const submittedPin = String(formData.get("pin") ?? "").trim();
  const nextPath = sanitizeNextPath(String(formData.get("next") ?? "/dashboard"));

  if (submittedPin !== configuredPin) {
    redirect(`/unlock?flash=${encodeURIComponent("PIN invalido. Tente novamente.")}&tone=error&next=${encodeURIComponent(nextPath)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(nextPath);
}

export async function logoutAppAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/unlock?flash=App%20bloqueado%20com%20sucesso&tone=success");
}

function sanitizeNextPath(nextPath: string) {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}
