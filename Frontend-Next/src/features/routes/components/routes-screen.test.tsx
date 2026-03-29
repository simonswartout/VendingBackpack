import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  apiRequest: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
  default: () =>
    function MockRouteMapCanvas() {
      return <div data-testid="routes-map-canvas" />;
    },
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/lib/api/api-client", () => ({
  apiRequest: mocks.apiRequest,
}));

import { RoutesScreen } from "@/features/routes/components/routes-screen";

function machinesPayload() {
  return [
    { id: "M-101", name: "Union Station", vin: null, organizationId: null, status: "online", battery: 90, lat: 42.3524, lng: -71.0552, location: "Downtown Loop", createdAt: null, updatedAt: null },
    { id: "M-120", name: "North Campus", vin: null, organizationId: null, status: "online", battery: 88, lat: 42.3651, lng: -71.104, location: "Cambridge North", createdAt: null, updatedAt: null },
  ];
}

describe("RoutesScreen", () => {
  beforeEach(() => {
    mocks.apiRequest.mockImplementation(async (path: string) => {
      if (path === "/machines") {
        return machinesPayload();
      }

      if (path === "/employees") {
        return [
          { id: "emp-07", name: "Amanda Jones", color: null, department: null, location: null, floor: null, building: null, isActive: true, createdAt: null, updatedAt: null },
          { id: "emp-11", name: "Luis Vega", color: null, department: null, location: null, floor: null, building: null, isActive: true, createdAt: null, updatedAt: null },
        ];
      }

      if (path === "/routes") {
        return [
          { id: 1, employeeId: "emp-07", employeeName: "Amanda Jones", distanceMeters: 10, durationSeconds: 20, stops: [{ machineId: "M-101", name: "Union Station", lat: 42.3524, lng: -71.0552, location: "Downtown Loop", position: 0 }], createdAt: null, updatedAt: null },
          { id: 2, employeeId: "emp-11", employeeName: "Luis Vega", distanceMeters: 12, durationSeconds: 24, stops: [{ machineId: "M-120", name: "North Campus", lat: 42.3651, lng: -71.104, location: "Cambridge North", position: 0 }], createdAt: null, updatedAt: null },
        ];
      }

      if (path === "/employees/user_emp/routes") {
        return { id: 2, employeeId: "user_emp", employeeName: "Luis Vega", distanceMeters: 12, durationSeconds: 24, stops: [{ machineId: "M-120", name: "North Campus", lat: 42.3651, lng: -71.104, location: "Cambridge North", position: 0 }], createdAt: null, updatedAt: null };
      }

      return {};
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates the selected assignment details when the manager filter changes", async () => {
    mocks.useAuth.mockReturnValue({
      effectiveRole: "manager",
      session: {
        user: {
          id: "user_admin",
          name: "Admin Manager",
        },
      },
    });

    const { container } = render(<RoutesScreen />);

    await screen.findByText("SELECT OPERATIVE FOR UNION STATION");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "emp-11" } });

    await waitFor(() => {
      expect(screen.getByText("SELECT OPERATIVE FOR NORTH CAMPUS")).toBeInTheDocument();
    });

    expect(screen.getByText("Cambridge North")).toBeInTheDocument();
    expect(container.querySelector('.routes-sheet__row[data-active="true"]')).toHaveTextContent("Luis Vega");
  });

  it("shows the employee route sheet without manager assignment controls", async () => {
    mocks.useAuth.mockReturnValue({
      effectiveRole: "employee",
      session: {
        user: {
          id: "user_emp",
          name: "Luis Vega",
        },
      },
    });

    render(<RoutesScreen />);

    await screen.findByText("TODAY'S ACTIVE NODES");
    expect(screen.queryByText(/SELECT OPERATIVE FOR/i)).not.toBeInTheDocument();
    expect(screen.getByText(/M-120 \/ North Campus/i)).toBeInTheDocument();
  });

  it("reloads assignee names after route autogeneration", async () => {
    let routeAssignments = [
      { id: 1, employeeId: "emp-07", employeeName: "Amanda Jones", distanceMeters: 10, durationSeconds: 20, stops: [{ machineId: "M-101", name: "Union Station", lat: 42.3524, lng: -71.0552, location: "Downtown Loop", position: 0 }], createdAt: null, updatedAt: null },
      { id: 2, employeeId: "emp-11", employeeName: "Luis Vega", distanceMeters: 12, durationSeconds: 24, stops: [{ machineId: "M-120", name: "North Campus", lat: 42.3651, lng: -71.104, location: "Cambridge North", position: 0 }], createdAt: null, updatedAt: null },
    ];

    mocks.apiRequest.mockImplementation(async (path: string) => {
      if (path === "/machines") {
        return machinesPayload();
      }

      if (path === "/employees") {
        return [
          { id: "emp-07", name: "Amanda Jones", color: null, department: null, location: null, floor: null, building: null, isActive: true, createdAt: null, updatedAt: null },
          { id: "emp-11", name: "Luis Vega", color: null, department: null, location: null, floor: null, building: null, isActive: true, createdAt: null, updatedAt: null },
          { id: "emp-13", name: "Maya Chen", color: null, department: null, location: null, floor: null, building: null, isActive: true, createdAt: null, updatedAt: null },
        ];
      }

      if (path === "/routes") {
        return routeAssignments;
      }

      if (path === "/routes/autogenerate") {
        routeAssignments = [
          { id: 3, employeeId: "emp-13", employeeName: "Maya Chen", distanceMeters: 10, durationSeconds: 20, stops: [{ machineId: "M-101", name: "Union Station", lat: 42.3524, lng: -71.0552, location: "Downtown Loop", position: 0 }], createdAt: null, updatedAt: null },
          { id: 4, employeeId: "emp-07", employeeName: "Amanda Jones", distanceMeters: 12, durationSeconds: 24, stops: [{ machineId: "M-120", name: "North Campus", lat: 42.3651, lng: -71.104, location: "Cambridge North", position: 0 }], createdAt: null, updatedAt: null },
        ];
        return { status: "success" };
      }

      return {};
    });

    mocks.useAuth.mockReturnValue({
      effectiveRole: "manager",
      session: {
        user: {
          id: "user_admin",
          name: "Admin Manager",
        },
      },
    });

    const { container } = render(<RoutesScreen />);

    await screen.findByText("SELECT OPERATIVE FOR UNION STATION");
    fireEvent.click(screen.getByRole("button", { name: "Autogenerate routes" }));

    await waitFor(() => {
      expect(container.querySelector('.routes-sheet__row[data-active="true"]')).toHaveTextContent("Maya Chen");
    });
  });
});
