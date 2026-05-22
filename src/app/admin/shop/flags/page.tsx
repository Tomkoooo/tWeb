import { Settings2, ToggleLeft, ToggleRight } from "lucide-react";
import { getShopParcelFeatureFlags, updateFeatureFlag } from "@/actions/admin-flags";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type FeatureFlagRow = {
  _id: string;
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
};

export default async function AdminShopParcelFlagsPage() {
  const flags = (await getShopParcelFeatureFlags()) as FeatureFlagRow[];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
          Csomagpont <span className="admin-headline-accent">GLS / Foxpost</span>
        </h1>
        <p className="text-white/40 font-medium italic max-w-2xl">
          Kapcsolók a pénztári csomagpont választókhoz és az admin csomag/címke kezelőkhöz. Telepítés és env változók:{" "}
          <code className="text-neutral-300">docs/integrations/parcel-locker-gls-foxpost.md</code> a repóban.
        </p>
      </div>

      <div className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag._id}
            className="bg-white/5 border border-white/10 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 admin-icon-accent" />
                <h2 className="text-lg font-black uppercase tracking-wider text-white">{flag.label}</h2>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-widest font-black px-2 py-1 border",
                    flag.enabled
                      ? "text-emerald-400 border-emerald-400/40 bg-emerald-500/10"
                      : "text-neutral-400 border-white/20 bg-white/5"
                  )}
                >
                  {flag.enabled ? "Aktív" : "Inaktív"}
                </span>
              </div>
              <p className="text-sm text-neutral-400">{flag.description || "Nincs leírás."}</p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600">{flag.key}</p>
            </div>

            <form action={updateFeatureFlag.bind(null, flag.key, !flag.enabled)}>
              <Button
                className={cn(
                  "rounded-none min-w-[170px] h-12 font-black uppercase tracking-widest text-[10px]",
                  flag.enabled
                    ? "bg-rose-700 hover:bg-rose-800 text-white"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                )}
              >
                {flag.enabled ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
                {flag.enabled ? "Kikapcsolás" : "Bekapcsolás"}
              </Button>
            </form>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-500 border-t border-white/10 pt-6">
        Egyéb funkciókapcsolók (shop oldal, Stripe, hírlevél, …) továbbra is a{" "}
        <Link href="/admin/info" className="admin-link-accent">
          Beállítások
        </Link>{" "}
        menüpontban érhetők el.
      </p>
    </div>
  );
}
