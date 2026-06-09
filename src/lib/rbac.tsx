import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "@/data/seed";

export const ROLES: { id: Role; label: string }[] = [
  { id: "admin", label: "Federation Admin" },
  { id: "coach", label: "Coach" },
  { id: "physio", label: "Physiotherapist" },
  { id: "scientist", label: "Sports Scientist" },
  { id: "nutritionist", label: "Nutritionist" },
  { id: "athlete", label: "Athlete" },
];

interface Ctx { role: Role; setRole: (r: Role) => void }
const RoleCtx = createContext<Ctx>({ role: "admin", setRole: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("admin");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("usi-role") : null;
    if (stored) setRoleState(stored as Role);
  }, []);
  const setRole = (r: Role) => { setRoleState(r); if (typeof window !== "undefined") localStorage.setItem("usi-role", r); };
  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>;
}

export const useRole = () => useContext(RoleCtx);

// Map role → modules visible
export const ROLE_ACCESS: Record<Role, string[]> = {
  admin:        ["command","registry","onboarding","training","medical","body-map","rehab","sports-science","nutrition","assessments","analytics","copilot"],
  coach:        ["command","registry","training","sessions","sports-science","assessments","copilot","analytics"],
  physio:       ["command","registry","medical","body-map","rehab","copilot"],
  scientist:    ["command","registry","sports-science","analytics","copilot"],
  nutritionist: ["command","registry","nutrition","copilot"],
  athlete:      ["command","training","medical","nutrition","copilot"],
};

export function can(role: Role, key: string) {
  return ROLE_ACCESS[role].includes(key);
}
