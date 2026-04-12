// Re-export from useUserRole for backward compatibility
import { useUserRole } from "./useUserRole";

export const useAdminRole = () => {
  const { hasRole, loading, user } = useUserRole();
  return { isAdmin: hasRole("super_admin"), loading, user };
};
