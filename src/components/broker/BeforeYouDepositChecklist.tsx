import { useState } from "react";
import { ChevronDown, ChevronRight, ShieldCheck, CheckCircle2, Circle } from "lucide-react";
import NeonCard from "@/components/ui/NeonCard";

type Variant = "broker" | "prop-firm";

const brokerItems = [
  {
    title: "Verify the regulator",
    detail:
      "Look up the license number on the regulator's official website (FCA, ASIC, CySEC, FSCA, etc.). Don't trust badges shown on the broker's own site.",
  },
  {
    title: "Read the latest withdrawal complaints",
    detail:
      "Check the broker's complaints tab for the last 30 days. Multiple unresolved withdrawal complaints = serious red flag.",
  },
  {
    title: "Test withdrawal with a small amount first",
    detail:
      "Deposit $50–$100, trade once, then immediately request a withdrawal. Time it. If it takes longer than the broker's stated timeframe, do not deposit more.",
  },
  {
    title: "Confirm the spread + commission match the marketing",
    detail:
      "Open a demo or fund a small live account and screenshot real spreads at the times you'll actually trade.",
  },
  {
    title: "Check the bonus terms and trading-volume traps",
    detail:
      "Most bonuses lock your withdrawal until you trade an unrealistic volume. Read the T&Cs — if confusing, skip the bonus.",
  },
  {
    title: "Confirm the broker is not on our Scam Watch",
    detail:
      "Look for an active scam alert ribbon on this page. If one exists, walk away.",
  },
];

const propFirmItems = [
  {
    title: "Verify the firm's payout history",
    detail:
      "Check the 30-day withdrawal proof gallery and recent payout complaints. No verified proofs or repeated payout delays = walk away.",
  },
  {
    title: "Read the full challenge rules before paying",
    detail:
      "Daily loss, max drawdown, consistency rule, min trading days, news/EA/weekend restrictions — one missed line can bust the account. Read every clause.",
  },
  {
    title: "Start with the smallest account size",
    detail:
      "Buy a $5k or $10k challenge first to test execution, slippage, dashboard accuracy and support response. Don't risk a $100k fee on an untested firm.",
  },
  {
    title: "Confirm the profit split + payout cycle",
    detail:
      "80/20 vs 90/10, bi-weekly vs monthly, minimum payout threshold and method (Deel, Rise, Wise, crypto) — make sure it's all written in the T&Cs, not just marketing.",
  },
  {
    title: "Check the broker behind the firm",
    detail:
      "Prop firm orders route through an underlying broker. Confirm that broker's regulation and live spreads actually fit your strategy and instruments.",
  },
  {
    title: "Confirm the firm is not on our Scam Watch",
    detail:
      "If an active scam alert ribbon exists on this page, skip it. Refund policy and dispute resolution should be clear before you pay any fee.",
  },
];

const BeforeYouDepositChecklist = ({
  brokerName,
  variant = "broker",
}: {
  brokerName: string;
  variant?: Variant;
}) => {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const items = variant === "prop-firm" ? propFirmItems : brokerItems;
  const heading =
    variant === "prop-firm"
      ? `Before you buy a challenge at ${brokerName}`
      : `Before you deposit at ${brokerName}`;

  const toggle = (i: number) => {
    setChecked((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  return (
    <NeonCard className="p-5 my-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-foreground text-sm">
            {heading}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            ({checked.size}/{items.length})
          </span>
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => {
            const isChecked = checked.has(i);
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="flex items-start gap-3 text-left w-full group"
                >
                  {isChecked ? (
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                  )}
                  <span>
                    <span
                      className={`block text-sm font-medium ${
                        isChecked ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {item.detail}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </NeonCard>
  );
};

export default BeforeYouDepositChecklist;
