import {
  createFoxpostReturn,
  deleteFoxpostParcel,
  downloadFoxpostDeliveryNote,
  fetchFoxpostLabelInfo,
  generateFoxpostShipment,
  refreshFoxpostTracking,
  updateFoxpostParcel,
  type FoxpostShipmentSource,
} from "@/actions/foxpost-shipment";
import { FoxpostShipmentWorkbench } from "@/components/admin/foxpost/FoxpostShipmentWorkbench";
import type { FoxpostParcelPoint, FoxpostShipment } from "@/lib/foxpost";

type FoxpostShipmentPanelProps = {
  source: FoxpostShipmentSource;
  orderId: string;
  parcelManagerEnabled: boolean;
  foxpostParcelPoint?: FoxpostParcelPoint | null;
  foxpostShipment?: FoxpostShipment | null;
};

export function FoxpostShipmentPanel({
  source,
  orderId,
  parcelManagerEnabled,
  foxpostParcelPoint,
  foxpostShipment,
}: FoxpostShipmentPanelProps) {
  return (
    <FoxpostShipmentWorkbench
      source={source}
      orderId={orderId}
      parcelManagerEnabled={parcelManagerEnabled}
      foxpostParcelPoint={foxpostParcelPoint}
      foxpostShipment={foxpostShipment}
      generateAction={async () => generateFoxpostShipment({ source, id: orderId })}
      refreshTrackingAction={async () => refreshFoxpostTracking({ source, id: orderId })}
      updateParcelAction={async (patch) => updateFoxpostParcel({ source, id: orderId, patch })}
      deleteParcelAction={async () => deleteFoxpostParcel({ source, id: orderId })}
      createReturnAction={async () => createFoxpostReturn({ source, id: orderId })}
      fetchLabelInfoAction={async () => fetchFoxpostLabelInfo({ source, id: orderId })}
      downloadDeliveryNoteAction={async () => downloadFoxpostDeliveryNote({ source, id: orderId })}
    />
  );
}
