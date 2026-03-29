import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
  apiRequest: mocks.apiRequest,
}));

import { ApiDashboardRepository } from "@/lib/api/repositories/api-dashboard-repository";

describe("ApiDashboardRepository", () => {
  beforeEach(() => {
    mocks.apiRequest.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("keeps live snapshot data and annotates partial feed failures", async () => {
    mocks.apiRequest.mockImplementation(async (path: string) => {
      if (path === "/inventory") {
        return [{ machineId: "M-101", machineName: "Union Station", status: "online", location: "Downtown Loop", items: [{ itemId: 1, sku: "SKU-1", name: "Cold Brew", quantity: 2, barcode: "111", slotNumber: "A1" }] }];
      }

      if (path === "/employees") {
        throw new Error("Employees unavailable");
      }

      if (path === "/daily_stats") {
        return [{ date: "2026-03-29", amount: 420, transactionCount: 4 }];
      }

      if (path === "/machines") {
        return [{ id: "M-101", name: "Union Station", vin: null, organizationId: null, status: "online", battery: 88, lat: 42.3524, lng: -71.0552, location: "Downtown Loop", createdAt: null, updatedAt: null }];
      }

      if (path === "/routes") {
        return [{ id: 1, employeeId: "emp-07", employeeName: "Amanda Jones", distanceMeters: 10, durationSeconds: 20, stops: [{ machineId: "M-101", name: "Union Station", lat: 42.3524, lng: -71.0552, location: "Downtown Loop", position: 0 }], createdAt: null, updatedAt: null }];
      }

      return {};
    });

    const repository = new ApiDashboardRepository();
    const snapshot = await repository.getSnapshot("manager", "mgr-01", "Renee Goodman");

    expect(snapshot.heroValue).toBe("$420");
    expect(snapshot.machineSummaries[0]?.name).toBe("Union Station");
    expect(snapshot.machineSummaries[0]?.assignedTo).toBe("Amanda Jones");
    expect(snapshot.routeHighlights).toContain("Unavailable live feeds: employees.");
  });

  it("returns a truthful unavailable snapshot when no live feeds load", async () => {
    mocks.apiRequest.mockRejectedValue(new Error("Gateway unavailable"));

    const repository = new ApiDashboardRepository();
    const snapshot = await repository.getSnapshot("manager", "mgr-01", "Renee Goodman");

    expect(snapshot.heroValue).toBe("$0");
    expect(snapshot.machineSummaries).toEqual([]);
    expect(snapshot.routeHighlights[0]).toContain("currently unavailable");
  });
});
