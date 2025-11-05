export const ROLE_ROUTES = [
  'admin',
  'doctor',
  'nurse',
  'student',
  'pharmacist',
  'lab_technician',
  'store_keeper',
] as const;

export type AppRole = typeof ROLE_ROUTES[number];

export const roleToPathPrefix: Record<AppRole, string> = ROLE_ROUTES.reduce((acc, role) => {
  acc[role] = `/${role}`;
  return acc;
}, {} as Record<AppRole, string>);

export function isKnownRole(role: string | undefined | null): role is AppRole {
  return !!role && (ROLE_ROUTES as readonly string[]).includes(role);
}

