export const DOCK_POSTED = "https://www.dockposted.com";

export function fuelHref(input: {
  theater?: string | null;
  areaId?: string | null;
}): { href: string; label: string } {
  const area = (input.areaId ?? "").toLowerCase();
  const theater = (input.theater ?? "").toLowerCase();

  if (theater === "texas" || area === "galveston") {
    return {
      href: `${DOCK_POSTED}/run?corridor=galveston-bay`,
      label: "Galveston posted fuel",
    };
  }
  if (area === "islamorada" || area === "key-largo") {
    return {
      href: `${DOCK_POSTED}/run?corridor=upper-keys`,
      label: "Keys posted fuel",
    };
  }
  if (theater === "louisiana" || area === "venice") {
    return {
      href: `${DOCK_POSTED}/run?region=louisiana`,
      label: "Louisiana posted fuel",
    };
  }
  if (area === "boca-grande") {
    return {
      href: `${DOCK_POSTED}/run?region=west-florida`,
      label: "West Florida posted fuel",
    };
  }
  if (area === "jupiter") {
    return {
      href: `${DOCK_POSTED}/run?region=east-florida`,
      label: "East Florida posted fuel",
    };
  }
  return {
    href: DOCK_POSTED,
    label: "Dock Posted",
  };
}
