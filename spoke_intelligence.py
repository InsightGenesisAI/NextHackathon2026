"""Spoke: OpenAI Evaluators — Search Strategist (Agent 1) and CFO Auditor (Agent 2)."""

from __future__ import annotations

import json
import os
from typing import Any

from openai import OpenAI

from spoke_cards import detect_stack_duplicates, evaluate_policy_violations


def run_search_strategist(raw_cart: dict[str, Any], api_key: str | None = None) -> str:
    """
    Evaluator 1: Convert raw cart/DOM text into an optimized Exa Instant search query.
    """
    key = api_key or os.getenv("OPENAI_API_KEY")
    dom_text = raw_cart.get("raw_dom_text") or str(raw_cart.get("line_items", []))

    if not key:
        return _simulated_exa_query(raw_cart)

    client = OpenAI(api_key=key)
    prompt = (
        "You are a procurement search strategist. Given raw e-commerce checkout text, "
        "output ONE concise semantic search query (max 30 words) optimized for finding "
        "B2B pricing benchmarks and volume discount tiers. Return only the query string.\n\n"
        f"Checkout text:\n{dom_text}"
    )

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=80,
        )
        return (response.choices[0].message.content or "").strip().strip('"')
    except Exception:
        return _simulated_exa_query(raw_cart)


def run_cfo_auditor(
    cart: dict[str, Any],
    market_data: dict[str, Any],
    company_rules: dict[str, Any],
    financials: dict[str, Any],
    api_key: str | None = None,
) -> dict[str, Any]:
    """
    Evaluator 2: Cross-examine cart, market benchmarks, company DNA, and Stripe health.
    Returns hard-wall payload: is_flagged, concise_analysis, missing_context_question.
    """
    key = api_key or os.getenv("OPENAI_API_KEY")
    deterministic = _deterministic_audit_signals(cart, market_data, company_rules, financials)

    if not key:
        return _simulated_cfo_verdict(cart, market_data, company_rules, financials, deterministic)

    client = OpenAI(api_key=key)
    system = (
        "You are AgentCFO, a corporate fiscal alignment auditor. Synthesize market, "
        "financial, and company-policy data. Respond ONLY with valid JSON keys: "
        "chain_of_thought (array of 3-6 short strings, each a single reasoning step you took "
        "BEFORE concluding, e.g. 'Step 1: Recognized GitHub seats priced 22% above market.'), "
        "is_flagged (bool), concise_analysis (string, 2-4 sentences with emoji section headers "
        "like '🛑 APE Intercept'), missing_context_question (string, one specific, context-aware "
        "question that asks for the exact data you are missing rather than a generic block)."
    )
    user_payload = {
        "cart": cart,
        "market_benchmarks": market_data,
        "company_dna": company_rules,
        "stripe_financials": financials,
        "deterministic_signals": deterministic,
    }

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user_payload, default=str)},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        verdict = json.loads(content)
        verdict.setdefault("is_flagged", deterministic["is_flagged"])
        if not verdict.get("chain_of_thought"):
            verdict["chain_of_thought"] = _build_chain_of_thought(
                cart, market_data, company_rules, financials, deterministic
            )
        verdict["signals"] = deterministic
        return verdict
    except Exception:
        return _simulated_cfo_verdict(cart, market_data, company_rules, financials, deterministic)


def _deterministic_audit_signals(
    cart: dict[str, Any],
    market_data: dict[str, Any],
    company_rules: dict[str, Any],
    financials: dict[str, Any],
) -> dict[str, Any]:
    duplicates = detect_stack_duplicates(cart, company_rules)
    violations = evaluate_policy_violations(cart, company_rules)
    premium = market_data.get("summary", {}).get("estimated_premium_percent", 0)

    dept = cart.get("department") or financials.get("department", "Engineering")
    budgets = financials.get("department_budgets") or company_rules["policy_spoke"]["department_budgets"]
    dept_budget = budgets.get(dept, {})
    projected_pct = 0.0
    if dept_budget.get("allocation_cents"):
        projected = dept_budget.get("spent_cents", 0) + cart.get("amount_cents", 0)
        projected_pct = (projected / dept_budget["allocation_cents"]) * 100

    is_flagged = bool(duplicates or violations or premium >= 10 or projected_pct > 100)

    return {
        "is_flagged": is_flagged,
        "market_premium_percent": premium,
        "stack_duplicates": duplicates,
        "policy_violations": violations,
        "department_projected_utilization_percent": round(projected_pct, 1),
        "cash_runway_months": financials.get("cash_runway_months"),
    }


def _build_chain_of_thought(
    cart: dict[str, Any],
    market_data: dict[str, Any],
    company_rules: dict[str, Any],
    financials: dict[str, Any],
    signals: dict[str, Any],
) -> list[str]:
    """Deterministic reasoning trace — fallback and a guaranteed audit log."""
    steps: list[str] = []
    premium = signals.get("market_premium_percent", 0)
    merchant = cart.get("merchant", "vendor")

    steps.append(
        f"Step 1: Parsed cart from {merchant} totaling "
        f"${cart.get('amount_cents', 0) / 100:,.2f}."
    )
    if premium >= 10:
        steps.append(
            f"Step 2: Exa benchmark scan shows pricing ~{premium}% above standard B2B volume rates."
        )
    else:
        steps.append("Step 2: Exa benchmark scan shows pricing within normal B2B range.")

    duplicates = signals.get("stack_duplicates", [])
    if duplicates:
        alt = duplicates[0]
        steps.append(
            f"Step 3: Checked Stack Registry — found {alt['unused_seats']} unused "
            f"{alt['existing_tool']} licenses in the same category."
        )
    else:
        steps.append("Step 3: Checked Stack Registry — no redundant tooling detected.")

    util = signals.get("department_projected_utilization_percent", 0)
    steps.append(
        f"Step 4: Cross-referenced Stripe ledger — department budget projects to {util:.0f}% "
        f"with cash runway ~{signals.get('cash_runway_months', 'n/a')} months."
    )

    violations = signals.get("policy_violations", [])
    if violations:
        steps.append(
            f"Step 5: Matched {len(violations)} expense policy violation(s): "
            f"{violations[0].get('rule_id', 'policy')}."
        )

    decision = "FLAG for human review" if signals.get("is_flagged") else "CLEAR to proceed"
    steps.append(f"Decision: {decision}.")
    return steps


def reevaluate_with_justification(
    cart: dict[str, Any],
    market_data: dict[str, Any],
    company_rules: dict[str, Any],
    financials: dict[str, Any],
    prior_signals: dict[str, Any],
    justification: str,
    api_key: str | None = None,
) -> dict[str, Any]:
    """
    HITL: re-run the CFO Auditor with the human's justification as new context.
    Returns {approved: bool, reasoning: str, chain_of_thought: list[str]}.
    """
    key = api_key or os.getenv("OPENAI_API_KEY")
    justification = (justification or "").strip()

    if not justification:
        return {
            "approved": False,
            "reasoning": "No justification provided. Purchase remains flagged.",
            "chain_of_thought": ["Step 1: Empty justification received.", "Decision: Hold flag."],
        }

    if not key:
        return _simulated_reevaluation(cart, prior_signals, justification)

    client = OpenAI(api_key=key)
    system = (
        "You are AgentCFO performing a human-in-the-loop override review. The purchase was "
        "previously flagged. A human has supplied a justification. Decide whether the justification "
        "provides sufficient business context to APPROVE the override. Respond ONLY with valid JSON: "
        "chain_of_thought (array of 2-4 short reasoning steps), approved (bool), "
        "reasoning (string, 1-2 sentences explaining the decision to the human)."
    )
    payload = {
        "cart": cart,
        "prior_signals": prior_signals,
        "human_justification": justification,
        "company_dna": company_rules,
        "stripe_financials": financials,
    }
    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(payload, default=str)},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        verdict = json.loads(response.choices[0].message.content or "{}")
        verdict.setdefault("approved", True)
        verdict.setdefault("reasoning", "Justification accepted.")
        if not verdict.get("chain_of_thought"):
            verdict["chain_of_thought"] = [
                f"Step 1: Received human context: '{justification[:80]}'.",
                "Step 2: Weighed context against flagged signals.",
                f"Decision: {'Approve override' if verdict['approved'] else 'Hold flag'}.",
            ]
        return verdict
    except Exception:
        return _simulated_reevaluation(cart, prior_signals, justification)


def _simulated_reevaluation(
    cart: dict[str, Any], prior_signals: dict[str, Any], justification: str
) -> dict[str, Any]:
    """Heuristic HITL review when OpenAI is unavailable: accepts substantive justifications."""
    words = len(justification.split())
    context_terms = (
        "test", "load", "launch", "deadline", "client", "production", "hackathon",
        "migration", "compliance", "security", "outage", "scale", "contract",
    )
    has_context = any(term in justification.lower() for term in context_terms)
    approved = words >= 4 and has_context

    if approved:
        reasoning = (
            "Human justification supplies time-bound business context that outweighs the flagged "
            "signals. Approving override and logging to CFO."
        )
        steps = [
            f"Step 1: Received human context: '{justification[:80]}'.",
            "Step 2: Context cites a concrete operational need not visible in ledger data.",
            "Decision: Approve override and log rationale to CFO.",
        ]
    else:
        reasoning = (
            "Justification lacks specific business context (expected a concrete operational reason). "
            "Purchase remains flagged for executive approval."
        )
        steps = [
            f"Step 1: Received human context: '{justification[:80]}'.",
            "Step 2: No concrete operational driver detected in justification.",
            "Decision: Hold flag pending stronger justification.",
        ]
    return {"approved": approved, "reasoning": reasoning, "chain_of_thought": steps}


def _simulated_exa_query(raw_cart: dict[str, Any]) -> str:
    text = (raw_cart.get("raw_dom_text") or "").lower()
    if "github" in text:
        return (
            "standard annual pricing schedules and mid-market volume discounts "
            "for GitHub Enterprise seats"
        )
    if "zoom" in text:
        return "Zoom Business annual pricing vs Microsoft Teams enterprise collaboration licensing"
    return f"B2B SaaS volume pricing benchmarks for {raw_cart.get('merchant', 'software')}"


def _simulated_cfo_verdict(
    cart: dict[str, Any],
    market_data: dict[str, Any],
    company_rules: dict[str, Any],
    financials: dict[str, Any],
    signals: dict[str, Any],
) -> dict[str, Any]:
    premium = signals.get("market_premium_percent", 0)
    dept = cart.get("department", "Development")
    util = signals.get("department_projected_utilization_percent", 0)
    duplicates = signals.get("stack_duplicates", [])
    runway = financials.get("cash_runway_months", 14)

    market_line = (
        f"This vendor is charging {premium}% above standard B2B volume rates for this tier."
        if premium >= 10
        else "Market pricing appears within normal B2B ranges."
    )
    financial_line = (
        f"This purchase will push the '{dept}' budget to {util:.0f}% capacity for this quarter."
        if util > 100
        else f"Cash runway remains ~{runway} months at current burn; departmental budget impact is manageable."
    )

    if duplicates:
        alt = duplicates[0]
        company_line = (
            f"Our Stack Registry shows we already have {alt['unused_seats']} unused "
            f"[{alt['existing_tool']}] licenses available."
        )
        question = (
            f"Why is this specific vendor required instead of provisioning one of our "
            f"open, pre-paid {alt['existing_tool']} licenses?"
        )
    elif premium >= 10:
        question = "What volume discount was negotiated, and why is list pricing acceptable?"
    elif util > 100:
        question = f"Which budget reallocation authorizes exceeding the {dept} Q3 software cap?"
    else:
        question = "Provide business justification for this purchase."

    analysis = (
        f"🛑 APE Intercept: Fiscal Alignment Review\n\n"
        f"Market Intelligence (Exa): {market_line}\n"
        f"Financial Health (Stripe): {financial_line}\n"
        f"Company Context (Precollected DNA): {company_line if duplicates else company_rules['mission_hub']['statement']}"
    )

    return {
        "is_flagged": signals["is_flagged"],
        "chain_of_thought": _build_chain_of_thought(
            cart, market_data, company_rules, financials, signals
        ),
        "concise_analysis": analysis,
        "missing_context_question": question,
        "signals": signals,
    }
