"use client";

import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ParityCard } from "@/components/parity/parity-card";
import type { EmployeeDto, MachineDto, RouteDto } from "@/lib/api/contracts/operations";
import { apiRequest } from "@/lib/api/api-client";
import { useAuth } from "@/providers/auth-provider";
import type { RouteMachine } from "@/features/routes/components/route-map-canvas";

const RouteMapCanvas = dynamic(
  () => import("@/features/routes/components/route-map-canvas").then((module) => module.RouteMapCanvas),
  { ssr: false },
);

const baseEmployees = [
  { id: "none", name: "NONE" },
  { id: "all", name: "ALL NODES" },
];

function buildEmployeeLookup(employees: Array<Pick<EmployeeDto, "id" | "name">>) {
  return new Map(employees.map((employee) => [employee.id, employee.name]));
}

function buildEmployeeOptions(employees: Array<Pick<EmployeeDto, "id" | "name">>) {
  return employees.length
    ? [...baseEmployees, ...employees.map((employee) => ({ id: employee.id, name: employee.name }))]
    : baseEmployees;
}

function buildAssignmentMap(routes: RouteDto[], employeeLookup: Map<string, string>) {
  const assignmentMap = new Map<string, string>();

  routes.forEach((route) => {
    const employeeName = route.employeeName || employeeLookup.get(route.employeeId) || "Assigned";
    route.stops.forEach((stop) => {
      assignmentMap.set(stop.machineId, employeeName);
    });
  });

  return assignmentMap;
}

function normalizeLocations(backendMachines: MachineDto[], assignmentMap: Map<string, string>): RouteMachine[] {
  if (!backendMachines.length) {
    return [];
  }

  return backendMachines
    .filter((machine) => typeof machine.lat === "number" && typeof machine.lng === "number")
    .map((machine) => ({
      id: machine.id,
      name: machine.name,
      lat: machine.lat ?? 0,
      lng: machine.lng ?? 0,
      zone: machine.location ?? "Assigned node",
      serviceWindow: "Pending",
      assignedTo: assignmentMap.get(machine.id) ?? "Unassigned",
    }));
}

export function RoutesScreen() {
  const { session, effectiveRole } = useAuth();
  const isManager = effectiveRole === "manager";
  const [filter, setFilter] = useState("none");
  const [employees, setEmployees] = useState(baseEmployees);
  const [assignments, setAssignments] = useState<RouteMachine[]>([]);
  const [employeeRouteStops, setEmployeeRouteStops] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRoutes() {
      setIsLoading(true);
      setError("");

      try {
        const [machinesResult, employeesResult] = await Promise.allSettled([
          apiRequest<MachineDto[]>("/machines"),
          apiRequest<EmployeeDto[]>("/employees"),
        ]);
        const nextErrors: string[] = [];
        const machinesResponse =
          machinesResult.status === "fulfilled"
            ? machinesResult.value
            : (nextErrors.push("route map"), []);
        const employeesResponse =
          employeesResult.status === "fulfilled"
            ? employeesResult.value
            : (nextErrors.push("employee roster"), []);
        const employeeLookup = buildEmployeeLookup(employeesResponse ?? []);
        const nextEmployees = buildEmployeeOptions(employeesResponse ?? []);
        let currentRouteStops: string[] = [];
        let assignmentMap = new Map<string, string>();

        if (isManager) {
          try {
            const allRoutes = await apiRequest<RouteDto[]>("/routes");
            assignmentMap = buildAssignmentMap(allRoutes, employeeLookup);
          } catch {
            nextErrors.push("route assignments");
          }
        } else if (session?.user.id) {
          try {
            const currentRouteResponse = await apiRequest<RouteDto>(`/employees/${session.user.id}/routes`);
            currentRouteStops = currentRouteResponse.stops.map((stop) => stop.machineId);
            currentRouteStops.forEach((stopId) => {
              assignmentMap.set(stopId, session?.user.name ?? "You");
            });
          } catch {
            nextErrors.push("assigned route");
          }
        }

        const backendLocations = normalizeLocations(machinesResponse ?? [], assignmentMap);

        if (active) {
          setAssignments(backendLocations);
          setEmployees(nextEmployees);
          setEmployeeRouteStops(currentRouteStops);
          setError(nextErrors.length ? `Live ${nextErrors.join(" and ")} could not be loaded` : "");
        }
      } catch (nextError) {
        if (active) {
          setAssignments([]);
          setEmployees(baseEmployees);
          setEmployeeRouteStops([]);
          setError(nextError instanceof Error ? nextError.message : "Routes could not be loaded");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadRoutes();

    return () => {
      active = false;
    };
  }, [isManager, session?.user.id, session?.user.name]);

  const visibleLocations = useMemo(() => {
    if (!isManager) {
      if (employeeRouteStops.length) {
        return assignments.filter((machine) => employeeRouteStops.includes(machine.id));
      }

      return assignments.filter((machine) => machine.assignedTo === session?.user.name);
    }

    if (filter === "none" || filter === "all") {
      return assignments;
    }

    const selectedEmployee = employees.find((employee) => employee.id === filter)?.name;
    return assignments.filter((machine) => machine.assignedTo === selectedEmployee);
  }, [assignments, employeeRouteStops, employees, filter, isManager, session?.user.name]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!visibleLocations.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !visibleLocations.some((location) => location.id === selectedId)) {
      setSelectedId(visibleLocations[0].id);
    }
  }, [selectedId, visibleLocations]);

  const selectedLocation = visibleLocations.find((location) => location.id === selectedId) ?? null;
  const selectableEmployees = employees.filter((employee) => employee.id !== "none" && employee.id !== "all");

  async function autogenerateRoutes() {
    setIsLoading(true);
    setError("");

    try {
      await apiRequest("/routes/autogenerate", { method: "POST" });
      const [nextMachines, nextRoutes] = await Promise.all([
        apiRequest<MachineDto[]>("/machines"),
        apiRequest<RouteDto[]>("/routes"),
      ]);
      const employeeLookup = buildEmployeeLookup(selectableEmployees);
      const assignmentMap = buildAssignmentMap(nextRoutes, employeeLookup);
      setAssignments(normalizeLocations(nextMachines ?? [], assignmentMap));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Route autogeneration failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function assignMachine(machineId: string, employeeId: string) {
    setError("");

    try {
      await apiRequest(`/employees/${employeeId}/routes/assign`, {
        method: "POST",
        body: { machineId },
      });

      const allRoutes = await apiRequest<RouteDto[]>("/routes");
      const employeeLookup = buildEmployeeLookup(selectableEmployees);
      const assignmentMap = buildAssignmentMap(allRoutes, employeeLookup);

      setAssignments((currentAssignments) =>
        currentAssignments.map((machine) => ({
          ...machine,
          assignedTo: assignmentMap.get(machine.id) ?? "Unassigned",
        })),
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Assignment failed");
    }
  }

  return (
    <div className="routes-screen">
      <div className="routes-map-shell" data-loading={isLoading}>
        <RouteMapCanvas
          locations={visibleLocations}
          activeId={selectedId}
          onSelect={(location) => {
            setSelectedId(location.id);
          }}
        />

        <ParityCard className="routes-filter-pod">
          <div className="routes-filter-pod__label">FILTER //</div>
          {isManager ? (
            <>
              <select className="routes-filter-pod__select" value={filter} onChange={(event) => setFilter(event.target.value)}>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              <div className="routes-filter-pod__status">{visibleLocations.length} NODES</div>
              <button className="routes-filter-pod__sparkle" type="button" aria-label="Autogenerate routes" onClick={() => void autogenerateRoutes()}>
                <Sparkles size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="routes-filter-pod__meta">MY ROUTE</div>
              <div className="routes-filter-pod__status">{visibleLocations.length} STOPS</div>
            </>
          )}
        </ParityCard>

        {isManager ? (
          <div className="routes-sheet">
            {selectedLocation ? (
              <>
                <div className="routes-sheet__eyebrow">ASSIGNMENT / NODE {selectedLocation.id}</div>
                <div className="routes-sheet__title">SELECT OPERATIVE FOR {selectedLocation.name.toUpperCase()}</div>
                <div className="routes-sheet__meta">
                  <div className="routes-sheet__meta-item">
                    <span>Zone</span>
                    <strong>{selectedLocation.zone}</strong>
                  </div>
                  <div className="routes-sheet__meta-item">
                    <span>Window</span>
                    <strong>{selectedLocation.serviceWindow}</strong>
                  </div>
                  <div className="routes-sheet__meta-item">
                    <span>Assigned</span>
                    <strong>{selectedLocation.assignedTo}</strong>
                  </div>
                </div>
                <div className="routes-sheet__list">
                  {selectableEmployees.length ? (
                    selectableEmployees.map((employee) => (
                      <button
                        key={employee.id}
                        className="routes-sheet__row"
                        data-active={employee.name === selectedLocation.assignedTo}
                        type="button"
                        onClick={() => {
                          void assignMachine(selectedLocation.id, employee.id);
                        }}
                      >
                        <span>{employee.name}</span>
                        <strong>{employee.name === selectedLocation.assignedTo ? "ASSIGNED" : "SELECT"}</strong>
                      </button>
                    ))
                  ) : (
                    <div className="routes-sheet__empty">No employees are currently available for assignment.</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="routes-sheet__eyebrow">ASSIGNMENT / NODE --</div>
                <div className="routes-sheet__title">NO NETWORK NODE SELECTED</div>
                <div className="routes-sheet__list">
                  <div className="routes-sheet__empty">
                    {error ? "Live route data could not be loaded for this session." : "No route nodes are currently available."}
                  </div>
                </div>
                <div className="routes-sheet__footer-copy">Assignment controls remain available once live nodes are loaded.</div>
              </>
            )}
          </div>
        ) : (
          <div className="routes-sheet routes-sheet--employee">
            <div className="routes-sheet__eyebrow">ASSIGNED ROUTE</div>
            <div className="routes-sheet__title">TODAY&apos;S ACTIVE NODES</div>
            <div className="routes-sheet__list">
              {visibleLocations.length ? (
                visibleLocations.map((location) => (
                  <div key={location.id} className="routes-sheet__row routes-sheet__row--static">
                    <span>
                      {location.id} / {location.name}
                    </span>
                    <strong>{location.serviceWindow}</strong>
                  </div>
                ))
              ) : (
                <div className="routes-sheet__empty">No stops are currently assigned to this session.</div>
              )}
            </div>
            <div className="routes-sheet__footer-copy">Manager assignment controls stay hidden while employee context is active.</div>
          </div>
        )}
      </div>
      {error ? <div className="form-error form-error--compact">{error.toUpperCase()}</div> : null}
    </div>
  );
}
