export type RiskLevel = "Low" | "Medium" | "High";

export type DecisionStatus =
  | "Needs Approval"
  | "Approved"
  | "Rejected"
  | "Review Later";

export interface Decision {
  id: string;
  title: string;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
  amount: string;
  riskLevel: RiskLevel;
  status: DecisionStatus;
}

export interface BusinessSnapshot {
  name: string;
  type: string;
  cashAvailable: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  taxReserveNeeded: number;
  payrollDue: number;
  payrollDueInDays: number;
  unpaidInvoice: number;
  invoiceOverdueDays: number;
  financeHealth: "Healthy" | "Caution" | "At Risk";
}
