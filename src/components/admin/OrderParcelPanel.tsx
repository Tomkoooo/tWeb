import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import type { ParcelLockerProvider } from "@/lib/parcel-locker";
import { orderNeedsParcelLabel } from "@/lib/parcel-locker";

type GlsParcelPoint = {
  id?: string;
  name?: string;
  contact?: {
    postalCode?: string;
    city?: string;
    address?: string;
  };
};

type FoxpostParcelPoint = {
  id?: string;
  name?: string;
  address?: string;
  zip?: string;
  city?: string;
  findme?: string;
  load?: string;
};

type GlsLabel = {
  parcelNumber?: string;
  generatedAt?: string | Date;
  labelUrl?: string;
  lastError?: string;
};

type FoxpostShipment = {
  clFoxId?: string;
  refCode?: string;
  trackingStatus?: string;
  generatedAt?: string | Date;
  labelUrl?: string;
  lastError?: string;
};

type OrderParcelPanelProps = {
  parcelManagerEnabled: boolean;
  provider: ParcelLockerProvider;
  orderId: string;
  glsParcelPoint?: GlsParcelPoint | null;
  foxpostParcelPoint?: FoxpostParcelPoint | null;
  glsLabel?: GlsLabel | null;
  foxpostShipment?: FoxpostShipment | null;
  generateGlsAction: () => Promise<void>;
  generateFoxpostAction: () => Promise<void>;
};

export function OrderParcelPanel({
  parcelManagerEnabled,
  provider,
  orderId,
  glsParcelPoint,
  foxpostParcelPoint,
  glsLabel,
  foxpostShipment,
  generateGlsAction,
  generateFoxpostAction,
}: OrderParcelPanelProps) {
  const orderSnapshot = {
    glsParcelPoint,
    foxpostParcelPoint,
    glsLabel,
    foxpostShipment,
  };
  const needsLabel = orderNeedsParcelLabel(orderSnapshot);

  if (provider === "gls") {
    return (
      <div className="rounded border border-white/10 bg-black/40 p-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest admin-text-accent">GLS</p>
        <p className="text-[11px] text-neutral-300">
          <span className="text-white">{glsParcelPoint?.name}</span>
          {glsParcelPoint?.id ? (
            <span className="block text-neutral-500 mt-1">ID: {glsParcelPoint.id}</span>
          ) : null}
        </p>
        {glsParcelPoint?.contact ? (
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
            {glsParcelPoint.contact.postalCode} {glsParcelPoint.contact.city}{" "}
            {glsParcelPoint.contact.address}
          </p>
        ) : null}
        {parcelManagerEnabled && glsParcelPoint?.id ? (
          <form action={generateGlsAction}>
            <Button
              variant="outline"
              className="h-10 admin-action-outline rounded-none uppercase tracking-widest text-[10px] font-black"
            >
              <Printer className="w-4 h-4 mr-2" />
              GLS címke generálása
            </Button>
          </form>
        ) : null}
        {glsLabel?.parcelNumber ? (
          <div className="text-[10px] font-black uppercase tracking-widest text-neutral-300 space-y-1">
            <p>
              Csomagszám: <span className="text-white">{glsLabel.parcelNumber}</span>
            </p>
            {glsLabel.generatedAt ? (
              <p>
                Generálva:{" "}
                <span className="text-white">
                  {format(new Date(glsLabel.generatedAt), "yyyy. MMMM dd. HH:mm", { locale: hu })}
                </span>
              </p>
            ) : null}
            {glsLabel.labelUrl ? (
              <a
                href={glsLabel.labelUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex admin-link-accent"
              >
                Címke megnyitása
              </a>
            ) : null}
          </div>
        ) : needsLabel ? (
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Címke hiányzik
          </p>
        ) : null}
        {glsLabel?.lastError ? (
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
            GLS hiba: {glsLabel.lastError}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded border border-white/10 bg-black/40 p-4 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest admin-text-accent">Foxpost</p>
      <p className="text-[11px] text-neutral-300">
        <span className="text-white">{foxpostParcelPoint?.name}</span>
        {foxpostParcelPoint?.id ? (
          <span className="block text-neutral-500 mt-1">Automata: {foxpostParcelPoint.id}</span>
        ) : null}
      </p>
      <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
        {foxpostParcelPoint?.zip} {foxpostParcelPoint?.city} {foxpostParcelPoint?.address}
      </p>
      {foxpostParcelPoint?.findme ? (
        <p className="text-[10px] text-neutral-500">{foxpostParcelPoint.findme}</p>
      ) : null}
      {foxpostParcelPoint?.load ? (
        <p className="text-[10px] text-neutral-500">Telítettség: {foxpostParcelPoint.load}</p>
      ) : null}
      {parcelManagerEnabled && foxpostParcelPoint?.id ? (
        <form action={generateFoxpostAction}>
          <Button
            variant="outline"
            className="h-10 admin-action-outline rounded-none uppercase tracking-widest text-[10px] font-black"
          >
            <Printer className="w-4 h-4 mr-2" />
            Foxpost csomag + címke
          </Button>
        </form>
      ) : null}
      {foxpostShipment?.clFoxId ? (
        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-300 space-y-1">
          <p>
            CLFOX: <span className="text-white">{foxpostShipment.clFoxId}</span>
          </p>
          {foxpostShipment.refCode ? (
            <p>
              Ref: <span className="text-white">{foxpostShipment.refCode}</span>
            </p>
          ) : null}
          {foxpostShipment.trackingStatus ? (
            <p>
              Státusz: <span className="text-white">{foxpostShipment.trackingStatus}</span>
            </p>
          ) : null}
          {foxpostShipment.generatedAt ? (
            <p>
              Generálva:{" "}
              <span className="text-white">
                {format(new Date(foxpostShipment.generatedAt), "yyyy. MMMM dd. HH:mm", {
                  locale: hu,
                })}
              </span>
            </p>
          ) : null}
          {foxpostShipment.labelUrl ? (
            <a
              href={foxpostShipment.labelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex admin-link-accent"
            >
              Címke megnyitása
            </a>
          ) : null}
        </div>
      ) : needsLabel ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Csomag/címke hiányzik
        </p>
      ) : null}
      {foxpostShipment?.lastError ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
          Foxpost hiba: {foxpostShipment.lastError}
        </p>
      ) : null}
    </div>
  );
}

export function orderHasParcelShipping(order: {
  glsParcelPoint?: { id?: string } | null;
  foxpostParcelPoint?: { id?: string } | null;
}): boolean {
  return Boolean(order.glsParcelPoint?.id || order.foxpostParcelPoint?.id);
}
