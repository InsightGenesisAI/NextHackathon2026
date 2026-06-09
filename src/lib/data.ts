import type { BusinessSnapshot, Decision } from "./types";

export const businessSnapshot: BusinessSnapshot = {
  name: "Bloom & Brew Cafe",
  type: "Local cafe",
  cashAvailable: 12400,
  monthlyRevenue: 18500,
  monthlyExpenses: 13200,
  taxReserveNeeded: 3100,
  payrollDue: 4800,
  payrollDueInDays: 10,
  unpaidInvoice: 2400,
  invoiceOverdueDays: 12,
  financeHealth: "Caution",
};

export const fallbackDecisions: Decision[] = [
  {
    id: "tax-reserve",
    title: "Set aside money for taxes",
    whatHappened: "Bloom & Brew Cafe made $18,500 this month.",
    whyItMatters:
      "A portion of revenue should be saved now so taxes do not become a surprise later.",
    recommendedAction: "Move $3,100 into a tax reserve.",
    amount: "$3,100",
    riskLevel: "High",
    status: "Needs Approval",
  },
  {
    id: "payroll",
    title: "Prepare for payroll",
    whatHappened: "Payroll of $4,800 is due in 10 days.",
    whyItMatters:
      "Payroll should be protected before spending on growth or optional expenses.",
    recommendedAction: "Reserve $4,800 so employees can be paid on time.",
    amount: "$4,800",
    riskLevel: "High",
    status: "Needs Approval",
  },
  {
    id: "invoice",
    title: "Follow up on unpaid invoice",
    whatHappened: "A $2,400 catering invoice is 12 days overdue.",
    whyItMatters:
      "Collecting this invoice improves cash flow without needing new sales.",
    recommendedAction: "Send a friendly payment reminder to the client.",
    amount: "$2,400",
    riskLevel: "Medium",
    status: "Needs Approval",
  },
  {
    id: "subscriptions",
    title: "Review software subscriptions",
    whatHappened: "The business is paying for multiple recurring software tools.",
    whyItMatters: "Small recurring charges can quietly reduce profit.",
    recommendedAction:
      "Review subscriptions and cancel tools that are not being used.",
    amount: "$145/month potential savings",
    riskLevel: "Low",
    status: "Needs Approval",
  },
  {
    id: "marketing",
    title: "Delay extra marketing spend",
    whatHappened: "The business planned an $800 ad campaign this month.",
    whyItMatters:
      "Payroll and tax reserves should come first while cash flow is tight.",
    recommendedAction:
      "Delay the campaign until payroll and tax reserves are covered.",
    amount: "$800",
    riskLevel: "Medium",
    status: "Needs Approval",
  },
];

export const AGENT_SYSTEM_PROMPT =
  "You are AgentCFO, an autonomous CFO assistant for small business owners who do not understand finance. Explain financial decisions in simple, non-technical language. Your job is to create a clear human-in-the-loop approval list. The AI cannot finalize actions without owner approval. Prioritize payroll, taxes, cash flow, unpaid invoices, unnecessary expenses, savings, and sustainable growth.";
