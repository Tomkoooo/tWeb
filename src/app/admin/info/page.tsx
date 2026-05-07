import { Settings2, ToggleLeft, ToggleRight } from "lucide-react";
import { getAdminFeatureFlags, updateFeatureFlag } from "@/actions/admin-flags";
import { getAdminLegalDocuments, uploadLegalDocument } from "@/actions/admin-legal";
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

type LegalDocumentRow = {
  _id: string;
  key: "impresszum" | "terms" | "gdpr";
  title: string;
  fileName: string;
  uploadedAt?: string | Date;
};

export default async function AdminInfoPage() {
  const flags = await getAdminFeatureFlags() as FeatureFlagRow[];
  const legalDocs = await getAdminLegalDocuments() as LegalDocumentRow[];
  const docsByKey = new Map(legalDocs.map((doc) => [doc.key, doc]));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
          Beállítások <span className="text-primary underline decoration-primary/10 underline-offset-8">Feature Flag-ek</span>
        </h1>
        <p className="text-white/40 font-medium italic">
          Az új funkciók fokozatos aktiválása környezetenként.
        </p>
      </div>

      <div className="space-y-4">
        {flags.map((flag) => (
          <div key={flag._id} className="bg-white/5 border border-white/10 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
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

      <div className="space-y-4 pt-6 border-t border-white/10">
        <h2 className="text-2xl font-heading font-black uppercase tracking-wider text-white">
          Jogi dokumentumok
        </h2>
        <p className="text-neutral-400 text-sm">
          Töltsd fel az Impresszum, ÁSZF és GDPR dokumentumokat. Ezek linkje megjelenik a footerben.
        </p>

        {(["impresszum", "terms", "gdpr"] as const).map((docKey) => {
          const existing = docsByKey.get(docKey);
          return (
            <div key={docKey} className="bg-white/5 border border-white/10 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {docKey === "impresszum" ? "Impresszum" : docKey === "terms" ? "ÁSZF" : "GDPR"}
                </h3>
                {existing ? (
                  <div className="text-xs text-neutral-400">
                    <p>
                      Feltöltve: {existing.uploadedAt ? new Date(existing.uploadedAt).toLocaleString("hu-HU") : "-"}
                    </p>
                    <Link href={`/api/media/${existing.fileName}`} className="text-primary hover:underline" target="_blank">
                      Jelenlegi dokumentum megnyitása
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500">Még nincs feltöltve.</p>
                )}
              </div>

              <form action={uploadLegalDocument.bind(null, docKey)} className="flex items-center gap-3">
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="text-xs text-neutral-300"
                  required
                />
                <Button className="rounded-none bg-primary hover:bg-primary/85 text-white uppercase tracking-widest text-[10px] h-11">
                  Feltöltés
                </Button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
