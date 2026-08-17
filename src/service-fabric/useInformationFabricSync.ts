import { useEffect } from "react";
import type { CommandSystem, TacticalNode, TacticalTrack } from "../types";
import { stormFireInformationFabric } from "./informationFabricBridge";

/**
 * Keeps the canonical Information Fabric synchronized with the React-owned
 * operational state. This hook is intentionally side-effect-only: it does not
 * replace or own COP state.
 */
export function useInformationFabricSync(
  tracks: TacticalTrack[],
  nodes: TacticalNode[],
  systems: CommandSystem[],
): void {
  useEffect(() => {
    tracks.forEach((track) => stormFireInformationFabric.ingestTrack(track));
  }, [tracks]);

  useEffect(() => {
    nodes.forEach((node) => stormFireInformationFabric.ingestNode(node));
  }, [nodes]);

  useEffect(() => {
    systems.forEach((system) => stormFireInformationFabric.ingestCommandSystem(system));
  }, [systems]);
}
