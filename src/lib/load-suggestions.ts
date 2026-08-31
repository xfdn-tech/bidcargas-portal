import type {
  BodyTypeRecord,
  LoadTypeRecord,
  VehicleTypeRecord,
} from "@/lib/portal-types";

export function suggestedVehicleIds(
  loadType: LoadTypeRecord | undefined,
  vehicleTypes: VehicleTypeRecord[],
) {
  const kind = loadType?.anttCargoKind ?? "";
  return vehicleTypes
    .filter((item) => {
      const name = item.name.toLowerCase();
      if (kind.includes("granel") || kind === "neogranel") {
        return /bitrem|rodotrem|carreta|truck|bitruck/.test(name);
      }
      if (kind.includes("conteiner")) {
        return /carreta|bitrem|rodotrem/.test(name);
      }
      return item.axles >= 3;
    })
    .map((item) => item.id);
}

export function suggestedBodyTypeIds(
  loadType: LoadTypeRecord | undefined,
  bodyTypes: BodyTypeRecord[],
) {
  const kind = loadType?.anttCargoKind ?? "";
  return bodyTypes
    .filter((item) => {
      const name = item.name.toLowerCase();
      if (kind.includes("granel_solido") || kind === "neogranel") {
        return item.group === "open" || name.includes("graneleiro");
      }
      if (kind.includes("liquido") || kind.includes("pressur")) {
        return name.includes("tanque");
      }
      if (kind.includes("conteiner")) {
        return name.includes("container") || name.includes("conteiner");
      }
      if (kind.includes("frigor")) {
        return name.includes("frigor") || item.group === "closed";
      }
      return item.group === "closed";
    })
    .map((item) => item.id);
}

export function heavyVehicleIds(vehicleTypes: VehicleTypeRecord[]) {
  return vehicleTypes.filter((item) => item.axles >= 3).map((item) => item.id);
}

export function closedBodyTypeIds(bodyTypes: BodyTypeRecord[]) {
  return bodyTypes.filter((item) => item.group === "closed").map((item) => item.id);
}
