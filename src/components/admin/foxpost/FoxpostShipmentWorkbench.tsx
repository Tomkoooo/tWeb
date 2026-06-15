"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import {
  Loader2,
  Printer,
  RefreshCw,
  Trash2,
  RotateCcw,
  FileText,
  Info,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orderNeedsParcelLabel } from "@/lib/parcel-locker";
import type { FoxpostLabelInfo, FoxpostParcelPoint, FoxpostShipment, FoxpostTrack } from "@/lib/foxpost";
import type { FoxpostShipmentSource } from "@/actions/foxpost-shipment";

type ParcelActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

type FoxpostShipmentWorkbenchProps = {
  source: FoxpostShipmentSource;
  orderId: string;
  parcelManagerEnabled: boolean;
  foxpostParcelPoint?: FoxpostParcelPoint | null;
  foxpostShipment?: FoxpostShipment | null;
  generateAction: () => Promise<ParcelActionResult>;
  refreshTrackingAction: () => Promise<ParcelActionResult>;
  updateParcelAction: (patch: {
    recipientName?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    size?: string;
    comment?: string;
  }) => Promise<ParcelActionResult>;
  deleteParcelAction: () => Promise<ParcelActionResult>;
  createReturnAction: () => Promise<ParcelActionResult>;
  fetchLabelInfoAction: () => Promise<ParcelActionResult>;
  downloadDeliveryNoteAction: () => Promise<ParcelActionResult>;
};

function downloadBase64Pdf(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = filename;
  link.click();
}

export function FoxpostShipmentWorkbench({
  source,
  orderId,
  parcelManagerEnabled,
  foxpostParcelPoint,
  foxpostShipment,
  generateAction,
  refreshTrackingAction,
  updateParcelAction,
  deleteParcelAction,
  createReturnAction,
  fetchLabelInfoAction,
  downloadDeliveryNoteAction,
}: FoxpostShipmentWorkbenchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<ParcelActionResult | null>(null);
  const [tracks, setTracks] = useState<FoxpostTrack[]>([]);
  const [labelInfo, setLabelInfo] = useState<FoxpostLabelInfo | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    recipientName: "",
    recipientPhone: "",
    recipientEmail: "",
    size: "M",
    comment: "",
  });

  const orderSnapshot = { foxpostParcelPoint, foxpostShipment };
  const needsLabel = orderNeedsParcelLabel(orderSnapshot);
  const foxpostError = lastResult?.success ? undefined : lastResult?.error || foxpostShipment?.lastError;
  const successMessage = lastResult?.success ? "Művelet sikeres." : null;

  function runAction(action: () => Promise<ParcelActionResult>, onSuccess?: (result: ParcelActionResult) => void) {
    setLastResult(null);
    startTransition(async () => {
      const result = await action();
      setLastResult(result);
      if (result.success) {
        onSuccess?.(result);
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded border border-white/10 bg-black/40 p-4 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-widest admin-text-accent">Foxpost</p>

      <div className="space-y-2">
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
      </div>

      {parcelManagerEnabled && foxpostParcelPoint?.id ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => runAction(generateAction)}
            className="h-10 admin-action-outline rounded-none uppercase tracking-widest text-[10px] font-black"
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
            Foxpost csomag + címke
          </Button>

          {foxpostShipment?.clFoxId ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  runAction(refreshTrackingAction, (result) => {
                    const data = result.data as { tracks?: FoxpostTrack[] } | undefined;
                    if (data?.tracks) setTracks(data.tracks);
                  })
                }
                className="h-10 admin-action-outline rounded-none uppercase tracking-widest text-[10px] font-black"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tracking frissítés
              </Button>

              {foxpostShipment.labelUrl ? (
                <a href={foxpostShipment.labelUrl} target="_blank" rel="noreferrer">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 admin-action-outline rounded-none uppercase tracking-widest text-[10px] font-black"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Címke PDF
                  </Button>
                </a>
              ) : null}

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  runAction(downloadDeliveryNoteAction, (result) => {
                    const data = result.data as { pdfBase64?: string } | undefined;
                    if (data?.pdfBase64) {
                      downloadBase64Pdf(data.pdfBase64, `foxpost-delivery-note-${orderId}.pdf`);
                    }
                  })
                }
                className="h-10 admin-action-outline rounded-none uppercase tracking-widest text-[10px] font-black"
              >
                <FileText className="w-4 h-4 mr-2" />
                Fuvarlevél
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  runAction(fetchLabelInfoAction, (result) => {
                    setLabelInfo(result.data as FoxpostLabelInfo);
                  })
                }
                className="h-10 admin-action-outline rounded-none uppercase tracking-widest text-[10px] font-black"
              >
                <Info className="w-4 h-4 mr-2" />
                Címke info
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setShowUpdateForm((v) => !v);
                  setUpdateForm((prev) => ({
                    ...prev,
                    recipientName: prev.recipientName || "",
                    recipientPhone: prev.recipientPhone || "",
                    recipientEmail: prev.recipientEmail || "",
                  }));
                }}
                className="h-10 admin-action-outline rounded-none uppercase tracking-widest text-[10px] font-black"
              >
                Címzett szerkesztése
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  if (!window.confirm("Biztosan létrehozod a visszaküldési csomagot?")) return;
                  runAction(createReturnAction);
                }}
                className="h-10 admin-action-outline rounded-none uppercase tracking-widest text-[10px] font-black"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Visszaküldés
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  if (!window.confirm("Biztosan törlöd a Foxpost csomagot?")) return;
                  runAction(deleteParcelAction);
                }}
                className="h-10 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-none uppercase tracking-widest text-[10px] font-black"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Csomag törlése
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      {showUpdateForm && foxpostShipment?.clFoxId ? (
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-white/10 bg-black/30"
          onSubmit={(event) => {
            event.preventDefault();
            runAction(() => updateParcelAction(updateForm));
          }}
        >
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-neutral-500">Név</Label>
            <Input
              value={updateForm.recipientName}
              onChange={(e) => setUpdateForm((f) => ({ ...f, recipientName: e.target.value }))}
              className="h-10 rounded-none bg-black border-white/10"
            />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-neutral-500">Telefon</Label>
            <Input
              value={updateForm.recipientPhone}
              onChange={(e) => setUpdateForm((f) => ({ ...f, recipientPhone: e.target.value }))}
              className="h-10 rounded-none bg-black border-white/10"
            />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-neutral-500">Email</Label>
            <Input
              value={updateForm.recipientEmail}
              onChange={(e) => setUpdateForm((f) => ({ ...f, recipientEmail: e.target.value }))}
              className="h-10 rounded-none bg-black border-white/10"
            />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-neutral-500">Méret</Label>
            <Input
              value={updateForm.size}
              onChange={(e) => setUpdateForm((f) => ({ ...f, size: e.target.value }))}
              className="h-10 rounded-none bg-black border-white/10"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest text-neutral-500">Megjegyzés</Label>
            <Input
              value={updateForm.comment}
              onChange={(e) => setUpdateForm((f) => ({ ...f, comment: e.target.value }))}
              className="h-10 rounded-none bg-black border-white/10"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 rounded-none md:col-span-2 uppercase tracking-widest text-[10px] font-black"
          >
            Frissítés mentése
          </Button>
        </form>
      ) : null}

      {successMessage ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{successMessage}</p>
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
          {foxpostShipment.returnBarcode ? (
            <p>
              Visszaküldés: <span className="text-white">{foxpostShipment.returnBarcode}</span>
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
                {format(new Date(foxpostShipment.generatedAt), "yyyy. MMMM dd. HH:mm", { locale: hu })}
              </span>
            </p>
          ) : null}
        </div>
      ) : needsLabel ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Csomag/címke hiányzik</p>
      ) : null}

      {tracks.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tracking előzmények</p>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {tracks.map((track, index) => (
              <li key={`${track.trackId}-${index}`} className="text-[10px] text-neutral-400">
                <span className="text-white">{track.status || "—"}</span>
                {track.statusDate ? (
                  <span className="ml-2">
                    {format(new Date(track.statusDate), "yyyy.MM.dd HH:mm", { locale: hu })}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {labelInfo ? (
        <div className="space-y-1 pt-2 border-t border-white/10 text-[10px] text-neutral-400">
          <p className="font-black uppercase tracking-widest text-neutral-300">Címke információ</p>
          <p>Feladó: {labelInfo.senderName}</p>
          <p>Címzett: {labelInfo.recipientName}</p>
          <p>Email: {labelInfo.recipientEmail}</p>
          <p>Telefon: {labelInfo.recipientPhone}</p>
          <p>Automata: {labelInfo.apm}</p>
          <p>Send type: {labelInfo.sendType}</p>
          {labelInfo.cod ? <p>Utánvét: {labelInfo.cod} Ft</p> : null}
        </div>
      ) : null}

      {foxpostError ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Foxpost hiba: {foxpostError}</p>
      ) : null}

      {source === "sandbox" ? (
        <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
          Sandbox rendelés — csak teszt környezetben használd.
        </p>
      ) : null}
    </div>
  );
}
