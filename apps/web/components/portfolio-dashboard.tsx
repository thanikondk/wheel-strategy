"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AllocationChart } from "@/components/allocation-chart";
import { Badge, Button, Card, PageHeader, Stat } from "@/components/ui";
import { currency, percent } from "@/lib/utils";

type SharePosition = {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;
  marketPrice: number;
};

type OptionPosition = {
  id: string;
  ticker: string;
  strategy: "CSP" | "Covered Call";
  expiration: string;
  strike: number;
  contracts: number;
  premium: number;
  currentValue: number;
  costBasis?: number;
  wouldOwn: boolean;
};

type PortfolioState = {
  accountValue: number;
  cashAvailable: number;
  premiumCollectedMtd: number;
  premiumCollectedYtd: number;
  realizedPnl: number;
  shares: SharePosition[];
  options: OptionPosition[];
};

const STORAGE_KEY = "wheeldesk.portfolio.v1";

const emptyPortfolio: PortfolioState = {
  accountValue: 0,
  cashAvailable: 0,
  premiumCollectedMtd: 0,
  premiumCollectedYtd: 0,
  realizedPnl: 0,
  shares: [],
  options: []
};

function id() {
  return crypto.randomUUID();
}

function toNumber(value: FormDataEntryValue | null) {
  return Number(value || 0);
}

function Field({ label, name, value, step = "0.01" }: { label: string; name: string; value: number; step?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <input
        className="h-10 rounded-md border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-primary/30"
        name={name}
        type="number"
        min="0"
        step={step}
        defaultValue={value || ""}
      />
    </label>
  );
}

export function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioState>(emptyPortfolio);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPortfolio(JSON.parse(saved) as PortfolioState);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    }
  }, [loaded, portfolio]);

  const metrics = useMemo(() => {
    const openCsps = portfolio.options.filter((option) => option.strategy === "CSP");
    const coveredCalls = portfolio.options.filter((option) => option.strategy === "Covered Call");
    const assignedShares = portfolio.shares.reduce((sum, position) => sum + position.shares, 0);
    const cspCollateral = openCsps.reduce((sum, option) => sum + option.strike * 100 * option.contracts, 0);
    const shareCapital = portfolio.shares.reduce((sum, position) => sum + position.costBasis * position.shares, 0);
    const marketValue = portfolio.shares.reduce((sum, position) => sum + position.marketPrice * position.shares, 0);
    const unrealizedPnl = marketValue - shareCapital;
    const capitalAtRisk = cspCollateral + shareCapital;
    const cashReservePercent = portfolio.accountValue > 0 ? portfolio.cashAvailable / portfolio.accountValue : 0;

    const allocation = [
      ...portfolio.shares.map((position) => ({
        ticker: position.ticker || "Shares",
        value: position.costBasis * position.shares
      })),
      ...openCsps.map((option) => ({
        ticker: `${option.ticker || "CSP"} CSP`,
        value: option.strike * 100 * option.contracts
      }))
    ].filter((item) => item.value > 0);

    const violations = [
      ...allocation
        .filter((item) => portfolio.accountValue > 0 && item.value / portfolio.accountValue > 0.2)
        .map((item) => `${item.ticker} exceeds the 20% max allocation rule.`),
      ...(portfolio.accountValue > 0 && cashReservePercent < 0.15 ? ["Cash reserve is below the 15% hard floor."] : []),
      ...openCsps.filter((option) => !option.wouldOwn).map((option) => `${option.ticker || "CSP"} is not marked assignment-ready.`),
      ...coveredCalls
        .filter((option) => option.costBasis && option.strike < option.costBasis)
        .map((option) => `${option.ticker || "Covered call"} strike is below adjusted cost basis.`)
    ];

    return {
      openCsps,
      coveredCalls,
      assignedShares,
      unrealizedPnl,
      capitalAtRisk,
      cashReservePercent,
      allocation,
      violations
    };
  }, [portfolio]);

  function saveAccount(formData: FormData) {
    setPortfolio((current) => ({
      ...current,
      accountValue: toNumber(formData.get("accountValue")),
      cashAvailable: toNumber(formData.get("cashAvailable")),
      premiumCollectedMtd: toNumber(formData.get("premiumCollectedMtd")),
      premiumCollectedYtd: toNumber(formData.get("premiumCollectedYtd")),
      realizedPnl: toNumber(formData.get("realizedPnl"))
    }));
  }

  function addShare(formData: FormData) {
    setPortfolio((current) => ({
      ...current,
      shares: [
        ...current.shares,
        {
          id: id(),
          ticker: String(formData.get("ticker") || "").toUpperCase(),
          shares: toNumber(formData.get("shares")),
          costBasis: toNumber(formData.get("costBasis")),
          marketPrice: toNumber(formData.get("marketPrice"))
        }
      ]
    }));
  }

  function addOption(formData: FormData) {
    setPortfolio((current) => ({
      ...current,
      options: [
        ...current.options,
        {
          id: id(),
          ticker: String(formData.get("ticker") || "").toUpperCase(),
          strategy: formData.get("strategy") === "Covered Call" ? "Covered Call" : "CSP",
          expiration: String(formData.get("expiration") || ""),
          strike: toNumber(formData.get("strike")),
          contracts: toNumber(formData.get("contracts")),
          premium: toNumber(formData.get("premium")),
          currentValue: toNumber(formData.get("currentValue")),
          costBasis: toNumber(formData.get("costBasis")) || undefined,
          wouldOwn: formData.get("wouldOwn") === "on"
        }
      ]
    }));
  }

  function removeShare(positionId: string) {
    setPortfolio((current) => ({ ...current, shares: current.shares.filter((position) => position.id !== positionId) }));
  }

  function removeOption(optionId: string) {
    setPortfolio((current) => ({ ...current, options: current.options.filter((option) => option.id !== optionId) }));
  }

  function resetPortfolio() {
    window.localStorage.removeItem(STORAGE_KEY);
    setPortfolio(emptyPortfolio);
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Enter your account, share positions, and open options to calculate a risk-managed wheel command center." />

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Portfolio Inputs</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Saved locally in this browser. No broker connection or external API is used for these values.</p>
          </div>
          <Button type="button" className="bg-slate-800" onClick={resetPortfolio}>
            Reset
          </Button>
        </div>

        <form
          key={`account-${portfolio.accountValue}-${portfolio.cashAvailable}-${portfolio.premiumCollectedMtd}-${portfolio.premiumCollectedYtd}-${portfolio.realizedPnl}`}
          className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            saveAccount(new FormData(event.currentTarget));
          }}
        >
          <Field label="Account value" name="accountValue" value={portfolio.accountValue} />
          <Field label="Cash available" name="cashAvailable" value={portfolio.cashAvailable} />
          <Field label="Premium MTD" name="premiumCollectedMtd" value={portfolio.premiumCollectedMtd} />
          <Field label="Premium YTD" name="premiumCollectedYtd" value={portfolio.premiumCollectedYtd} />
          <Field label="Realized P&L" name="realizedPnl" value={portfolio.realizedPnl} />
          <div className="md:col-span-3 xl:col-span-5">
            <Button type="submit"><Save className="h-4 w-4" /> Save account</Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Account value" value={currency(portfolio.accountValue)} detail={portfolio.accountValue ? "Your entered account value" : "Enter account details above"} />
        <Stat label="Cash available" value={currency(portfolio.cashAvailable)} detail={`${percent(metrics.cashReservePercent)} reserve`} />
        <Stat label="Premium MTD / YTD" value={`${currency(portfolio.premiumCollectedMtd)} / ${currency(portfolio.premiumCollectedYtd)}`} />
        <Stat label="Capital at risk" value={currency(metrics.capitalAtRisk)} detail="CSP collateral plus share cost basis" />
        <Stat label="Open CSPs" value={metrics.openCsps.length} />
        <Stat label="Assigned shares" value={metrics.assignedShares} />
        <Stat label="Covered calls" value={metrics.coveredCalls.length} />
        <Stat label="Realized P&L" value={currency(portfolio.realizedPnl)} detail={`Unrealized ${currency(metrics.unrealizedPnl)}`} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-lg font-semibold">Allocation by Ticker</h2>
          {metrics.allocation.length ? (
            <AllocationChart data={metrics.allocation} />
          ) : (
            <p className="mt-4 text-sm text-slate-500">Add shares or cash-secured puts to see allocation.</p>
          )}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Risk Violations</h2>
          <div className="mt-4 grid gap-3">
            {metrics.violations.length === 0 ? <p className="text-sm text-slate-500">No hard-rule violations from your current entries.</p> : null}
            {metrics.violations.map((violation) => (
              <div key={violation} className="rounded-md border border-border p-3">
                <Badge tone="danger">Blocked</Badge>
                <p className="mt-2 text-sm">{violation}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Add Shares</h2>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              addShare(new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">Ticker</span>
              <input className="h-10 rounded-md border border-border bg-background px-3 uppercase outline-none focus:ring-2 focus:ring-primary/30" name="ticker" required />
            </label>
            <Field label="Shares" name="shares" value={0} step="1" />
            <Field label="Cost basis" name="costBasis" value={0} />
            <Field label="Market price" name="marketPrice" value={0} />
            <div className="sm:col-span-2">
              <Button type="submit"><Plus className="h-4 w-4" /> Add shares</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Add Open Option</h2>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              addOption(new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">Ticker</span>
              <input className="h-10 rounded-md border border-border bg-background px-3 uppercase outline-none focus:ring-2 focus:ring-primary/30" name="ticker" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">Strategy</span>
              <select className="h-10 rounded-md border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-primary/30" name="strategy">
                <option>CSP</option>
                <option>Covered Call</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">Expiration</span>
              <input className="h-10 rounded-md border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-primary/30" name="expiration" type="date" required />
            </label>
            <Field label="Strike" name="strike" value={0} />
            <Field label="Contracts" name="contracts" value={0} step="1" />
            <Field label="Premium received" name="premium" value={0} />
            <Field label="Current option value" name="currentValue" value={0} />
            <Field label="Adjusted cost basis" name="costBasis" value={0} />
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input name="wouldOwn" type="checkbox" />
              I would own this stock long term if assigned
            </label>
            <div className="sm:col-span-2">
              <Button type="submit"><Plus className="h-4 w-4" /> Add option</Button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Open Wheel Cycles</h2>
        {portfolio.shares.length === 0 && portfolio.options.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Add shares or open options to build your wheel cycle view.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-slate-500">
                <tr><th className="py-2">Type</th><th>Ticker</th><th>Expiration</th><th>Strike</th><th>Contracts/Shares</th><th>Premium</th><th>Action</th></tr>
              </thead>
              <tbody>
                {portfolio.options.map((option) => (
                  <tr key={option.id} className="border-b border-border">
                    <td className="py-3">{option.strategy}</td>
                    <td>{option.ticker}</td>
                    <td>{option.expiration}</td>
                    <td>{currency(option.strike)}</td>
                    <td>{option.contracts}</td>
                    <td>{currency(option.premium)}</td>
                    <td><button aria-label={`Remove ${option.ticker} option`} onClick={() => removeOption(option.id)}><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
                {portfolio.shares.map((position) => (
                  <tr key={position.id} className="border-b border-border">
                    <td className="py-3">Shares</td>
                    <td>{position.ticker}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>{position.shares}</td>
                    <td>-</td>
                    <td><button aria-label={`Remove ${position.ticker} shares`} onClick={() => removeShare(position.id)}><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
