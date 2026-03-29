"use client";

import { apiRequest } from "@/lib/api/api-client";
import type {
  DailyStatDto,
  EmployeeDto,
  MachineDto,
  MachineInventorySnapshotDto,
  RouteDto,
} from "@/lib/api/contracts/operations";
import type { DashboardRepository } from "@/lib/api/interfaces/dashboard-repository";
import type { UserRole } from "@/types/auth";
import type { DashboardSnapshot, DashboardViewPreferences } from "@/types/dashboard";

type FeedKey = "inventory" | "employees" | "dailyStats" | "machines" | "routes";

function formatFeedLabel(feedKey: FeedKey) {
  switch (feedKey) {
    case "inventory":
      return "inventory";
    case "employees":
      return "employees";
    case "dailyStats":
      return "daily stats";
    case "machines":
      return "machines";
    case "routes":
      return "routes";
  }
}

function createUnavailableSnapshot(role: UserRole, failedFeeds: FeedKey[], hasAnyLiveData: boolean): DashboardSnapshot {
  const feedSummary = failedFeeds.length
    ? `Live ${failedFeeds.map(formatFeedLabel).join(", ")} ${failedFeeds.length === 1 ? "is" : "are"} currently unavailable.`
    : "No live dashboard data is available for this session yet.";

  return {
    heroLabel: role === "manager" ? "Fleet revenue today" : "Your route progress",
    heroValue: role === "manager" ? "$0" : "0 / 0 stops",
    heroNote: hasAnyLiveData ? feedSummary : `Dashboard feed unavailable. ${feedSummary}`,
    kpis:
      role === "manager"
        ? [
            { label: "Active machines", value: "0", tone: "default" as const },
            { label: "Employees", value: "0", tone: "default" as const },
            { label: "Revenue today", value: "$0", tone: "warning" as const },
          ]
        : [
            { label: "Stops assigned", value: "0", tone: "default" as const },
            { label: "Machines online", value: "0", tone: "default" as const },
            { label: "Low stock alerts", value: "0", tone: "warning" as const },
          ],
    machineSummaries: [],
    routeHighlights: [feedSummary],
  };
}

function appendFeedWarning(snapshot: DashboardSnapshot, failedFeeds: FeedKey[]): DashboardSnapshot {
  if (!failedFeeds.length) {
    return snapshot;
  }

  const feedSummary = `Unavailable live feeds: ${failedFeeds.map(formatFeedLabel).join(", ")}.`;

  return {
    ...snapshot,
    heroNote: `${snapshot.heroNote} ${feedSummary}`.trim(),
    routeHighlights: [...snapshot.routeHighlights, feedSummary],
  };
}

function buildLiveSnapshot(
  role: UserRole,
  inventory: MachineInventorySnapshotDto[],
  employees: EmployeeDto[],
  dailyStats: DailyStatDto[],
  machines: MachineDto[],
  routes: RouteDto[],
  userName?: string | null,
  userRoute?: RouteDto | null,
): DashboardSnapshot | null {
  const machineEntries = machines.length
    ? machines
    : inventory.map((snapshot) => ({
        id: snapshot.machineId,
        name: snapshot.machineName,
        vin: null,
        organizationId: null,
        status: snapshot.items.some((row) => row.quantity > 0) ? "online" : "attention",
        battery: 0,
        lat: null,
        lng: null,
        location: snapshot.location,
        createdAt: null,
        updatedAt: null,
      }));

  if (!machineEntries.length && !employees.length && !dailyStats.length && !inventory.length) {
    return null;
  }

  const inventoryByMachineId = new Map(inventory.map((snapshot) => [snapshot.machineId, snapshot.items]));
  const employeeNameById = new Map(employees.map((employee) => [employee.id, employee.name]));
  const assignmentByMachineId = new Map<string, string>();

  routes.forEach((route) => {
    const assignee = route.employeeName || employeeNameById.get(route.employeeId) || "Assigned";
    route.stops.forEach((stop) => {
      assignmentByMachineId.set(stop.machineId, assignee);
    });
  });

  const latestDailyStat = dailyStats.length ? dailyStats[dailyStats.length - 1] : null;
  const revenueToday = latestDailyStat ? Number(latestDailyStat.amount ?? 0) : 0;
  const activeMachineCount = machineEntries.filter((machine) => machine.status !== "attention").length;
  const totalMachineCount = machineEntries.length;
  const routeStopIds = userRoute?.stops.map((stop) => stop.machineId) ?? [];
  const routeMachines = routeStopIds.length ? machineEntries.filter((machine) => routeStopIds.includes(machine.id)) : [];
  const routeMachineCount = routeMachines.length;
  const routeMachinesOnline = routeMachines.filter((machine) => machine.status !== "attention").length;
  const routeInventoryRows = routeMachines.flatMap((machine) => inventoryByMachineId.get(machine.id) ?? []);
  const summaryMachines = role === "manager" ? machineEntries : routeMachines;

  return {
    heroLabel: role === "manager" ? "Fleet revenue today" : "Your route progress",
    heroValue:
      role === "manager"
        ? `$${revenueToday.toLocaleString("en-US", { maximumFractionDigits: 0 }) || "0"}`
        : `${routeMachinesOnline} / ${Math.max(routeMachineCount, 1)} stops online`,
    heroNote:
      role === "manager"
        ? `${totalMachineCount || 0} machines reporting and ${employees.length || 0} employees loaded from the backend.`
        : `${routeInventoryRows.length || 0} stocked machine rows remain on the assigned route.`,
    kpis:
      role === "manager"
        ? [
            { label: "Active machines", value: String(activeMachineCount || 0), tone: "success" as const },
            { label: "Employees", value: String(employees.length || 0), tone: "default" as const },
            { label: "Revenue today", value: `$${revenueToday.toLocaleString("en-US", { maximumFractionDigits: 0 }) || "0"}`, tone: "warning" as const },
          ]
        : [
            { label: "Stops assigned", value: String(routeMachineCount || 0), tone: "default" as const },
            { label: "Machines online", value: String(routeMachinesOnline || 0), tone: "success" as const },
            { label: "Low stock alerts", value: String(routeInventoryRows.filter((row) => row.quantity <= 1).length), tone: "warning" as const },
          ],
    machineSummaries: summaryMachines.slice(0, 3).map((machine, index) => {
      const inventoryRows = inventoryByMachineId.get(machine.id) ?? [];
      const topItem = inventoryRows[0]?.name ?? (index === 0 ? "Cold Brew" : "Inventory rows pending");

      return {
        id: machine.id,
        name: machine.name,
        status: machine.status === "attention" ? "attention" : "online",
        assignedTo: role === "manager" ? (assignmentByMachineId.get(machine.id) ?? "Unassigned") : userName ?? "You",
        nextServiceWindow: index === 0 ? "11:30 AM" : index === 1 ? "1:15 PM" : "3:45 PM",
        topItem,
      };
    }),
    routeHighlights: [
      `${totalMachineCount || 0} machines reporting through the live API.`,
      `${employees.length || 0} employees loaded from persisted records.`,
      role === "manager"
        ? `${routes.length || 0} routes currently assigned across the network.`
        : `${routeMachineCount || 0} route stops assigned to ${userName ?? "this session"}.`,
      dailyStats.length ? `Most recent revenue entry is $${revenueToday.toLocaleString("en-US", { maximumFractionDigits: 0 }) || "0"}.` : "No daily stats have been recorded yet.",
    ],
  };
}

export class ApiDashboardRepository implements DashboardRepository {
  async getSnapshot(role: UserRole, userId?: string | null, userName?: string | null): Promise<DashboardSnapshot> {
    const routesPath = role === "manager" ? "/routes" : userId ? `/employees/${userId}/routes` : null;
    const [inventoryResult, employeesResult, dailyStatsResult, machinesResult, routesResult] = await Promise.allSettled([
      apiRequest<MachineInventorySnapshotDto[]>("/inventory"),
      apiRequest<EmployeeDto[]>("/employees"),
      apiRequest<DailyStatDto[]>("/daily_stats"),
      apiRequest<MachineDto[]>("/machines"),
      routesPath ? apiRequest<RouteDto[] | RouteDto>(routesPath) : Promise.resolve(role === "manager" ? [] : null),
    ]);

    const failedFeeds: FeedKey[] = [];

    const inventory =
      inventoryResult.status === "fulfilled"
        ? (inventoryResult.value ?? [])
        : (failedFeeds.push("inventory"), []);
    const employees =
      employeesResult.status === "fulfilled"
        ? (employeesResult.value ?? [])
        : (failedFeeds.push("employees"), []);
    const dailyStats =
      dailyStatsResult.status === "fulfilled"
        ? (dailyStatsResult.value ?? [])
        : (failedFeeds.push("dailyStats"), []);
    const machines =
      machinesResult.status === "fulfilled"
        ? (machinesResult.value ?? [])
        : (failedFeeds.push("machines"), []);
    const routesValue =
      routesResult.status === "fulfilled"
        ? routesResult.value
        : (failedFeeds.push("routes"), role === "manager" ? [] : null);
    const routes = Array.isArray(routesValue) ? routesValue : routesValue ? [routesValue] : [];
    const userRoute = !Array.isArray(routesValue) ? routesValue : null;

    const liveSnapshot = buildLiveSnapshot(role, inventory, employees, dailyStats, machines, routes, userName, userRoute);
    if (!liveSnapshot) {
      return createUnavailableSnapshot(role, failedFeeds, false);
    }

    return appendFeedWarning(liveSnapshot, failedFeeds);
  }

  async getPreferences(): Promise<DashboardViewPreferences> {
    return apiRequest<DashboardViewPreferences>("/dashboard/preferences", { method: "GET" });
  }

  async savePreferences(preferences: DashboardViewPreferences): Promise<DashboardViewPreferences> {
    return apiRequest<DashboardViewPreferences>("/dashboard/preferences", {
      method: "PUT",
      body: preferences,
    });
  }
}
