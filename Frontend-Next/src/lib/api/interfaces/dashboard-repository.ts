import type { DashboardSnapshot, DashboardViewPreferences } from "@/types/dashboard";
import type { UserRole } from "@/types/auth";

export interface DashboardRepository {
  getSnapshot(role: UserRole, userId?: string | null, userName?: string | null): Promise<DashboardSnapshot>;
  getPreferences(): Promise<DashboardViewPreferences>;
  savePreferences(preferences: DashboardViewPreferences): Promise<DashboardViewPreferences>;
}
