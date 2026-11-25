type Listener = () => void;

let pendingPlanId: string | null = null;
const listeners = new Set<Listener>();

export function getPendingPlanningPlanId(): string | null {
  return pendingPlanId;
}

export function selectPlanningPlanFromAssistant(planId: string) {
  pendingPlanId = planId;
  listeners.forEach((listener) => listener());
}

export function clearPendingPlanningPlanId() {
  if (!pendingPlanId) return;
  pendingPlanId = null;
  listeners.forEach((listener) => listener());
}

export function subscribePendingPlanningPlan(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
