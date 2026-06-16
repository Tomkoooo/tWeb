"use client";

import { FoxpostShipmentWorkbench } from "@/components/admin/foxpost/FoxpostShipmentWorkbench";
import type { FoxpostParcelPoint, FoxpostShipment } from "@/lib/foxpost";
import type { FoxpostShipmentSource } from "@/actions/foxpost-shipment";

type FoxpostShipmentPanelProps = {
  source: FoxpostShipmentSource;
  orderId: string;
  parcelManagerEnabled: boolean;
  foxpostParcelPoint?: FoxpostParcelPoint | null;
  foxpostShipment?: FoxpostShipment | null;
  onUpdated?: () => void;
};

export function FoxpostShipmentPanel(props: FoxpostShipmentPanelProps) {
  return <FoxpostShipmentWorkbench {...props} />;
}
