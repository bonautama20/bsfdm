import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const BiopondContext = createContext(null);

export const localISODate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const addDays = (iso, days) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return localISODate(dt);
};

export function BiopondProvider({ children }) {
  const { session } = useAuth();
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    const data = await api.get("/racks");
    setRacks(data);
    return data;
  };

  // Keyed on the logged-in user's id, not just "on mount" — this app is a
  // single-page SPA, so logging out and into a different account (e.g. an
  // admin testing as the operator they just created) never unmounts this
  // provider. Without this, whatever org's data was fetched for the FIRST
  // session in the tab would keep showing for every account after it, even
  // though the server's own data is correctly tenant-isolated (see a real
  // report of this: a fresh operator's harvest form showing another
  // session's occupied bioponds). Logging out clears the cache instead of
  // leaving it visible for whoever logs in next.
  useEffect(() => {
    if (!session?.user?.id) {
      setRacks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh().catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [session?.user?.id]);

  const allBioponds = useMemo(
    () => racks.flatMap((r) => r.bioponds.map((b) => ({ ...b, rackId: r.id, rackName: r.name }))),
    [racks]
  );

  const totals = useMemo(() => {
    const total = allBioponds.length;
    const occupied = allBioponds.filter((b) => b.status === "Occupied").length;
    return { total, occupied, available: total - occupied, utilization: total ? +((occupied / total) * 100).toFixed(1) : 0 };
  }, [allBioponds]);

  const findBiopond = (rackId, biopondId) => racks.find((r) => r.id === rackId)?.bioponds.find((b) => b.id === biopondId);

  const addRack = async (name, count) => {
    const rack = await api.post("/racks", { name, count });
    setRacks((prev) => [...prev, rack]);
  };

  const renameRack = async (rackId, name) => {
    await api.patch(`/racks/${rackId}`, { name });
    setRacks((prev) => prev.map((r) => (r.id === rackId ? { ...r, name } : r)));
  };

  const deleteRack = async (rackId) => {
    await api.delete(`/racks/${rackId}`);
    setRacks((prev) => prev.filter((r) => r.id !== rackId));
  };

  const addBiopondToRack = async (rackId) => {
    const biopond = await api.post(`/racks/${rackId}/bioponds`, {});
    setRacks((prev) => prev.map((r) => (r.id !== rackId ? r : { ...r, bioponds: [...r.bioponds, biopond] })));
  };

  const deleteBiopond = async (rackId, biopondId) => {
    await api.delete(`/racks/bioponds/${biopondId}`);
    setRacks((prev) => prev.map((r) =>
      r.id !== rackId ? r : { ...r, bioponds: r.bioponds.filter((b) => b.id !== biopondId) }
    ));
  };

  const startProduction = async (rackId, biopondId, data) => {
    const updated = await api.post(`/racks/bioponds/${biopondId}/start-production`, data);
    setRacks((prev) => prev.map((r) =>
      r.id !== rackId ? r : { ...r, bioponds: r.bioponds.map((b) => (b.id !== biopondId ? b : updated)) }
    ));
  };

  const releaseBiopond = async (rackId, biopondId) => {
    const updated = await api.post(`/racks/bioponds/${biopondId}/release`, {});
    setRacks((prev) => prev.map((r) =>
      r.id !== rackId ? r : { ...r, bioponds: r.bioponds.map((b) => (b.id !== biopondId ? b : updated)) }
    ));
  };

  const value = {
    racks, loading, error, allBioponds, totals, findBiopond,
    addRack, renameRack, deleteRack, addBiopondToRack, deleteBiopond,
    startProduction, releaseBiopond,
  };

  return <BiopondContext.Provider value={value}>{children}</BiopondContext.Provider>;
}

export function useBiopond() {
  const ctx = useContext(BiopondContext);
  if (!ctx) throw new Error("useBiopond must be used within BiopondProvider");
  return ctx;
}
