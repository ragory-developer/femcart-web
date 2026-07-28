"use client";

import SearchableDropdown from "@/components/ui/SearchableDropdown";
import { API_URL } from "@/lib/config";
import { showToast } from "@/lib/toast";
import {
  AlertCircle,
  Building2,
  Check,
  Filter,
  Globe,
  Loader2,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface State {
  id: string;
  name: string;
  status: string;
  _count?: { cities: number };
}

interface City {
  id: string;
  name: string;
  stateId: string;
  status: string;
  deliveryCharge?: number;
  state?: { id: string; name: string };
  _count?: { areas: number };
}

interface Area {
  id: string;
  name: string;
  cityId: string;
  status: string;
  deliveryCharge?: number;
  city?: { id: string; name: string; state?: { id: string; name: string } };
}

type Tab = "states" | "cities" | "areas";

function getToken() {
  return (
    localStorage.getItem("femcart_access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

export default function AdminLocationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("states");
  const [mounted, setMounted] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Filter state for Cities tab
  const [cityFilterStateId, setCityFilterStateId] = useState("");

  // Filter state for Areas tab
  const [areaFilterStateId, setAreaFilterStateId] = useState("");
  const [areaFilterCityId, setAreaFilterCityId] = useState("");
  const [areasLoaded, setAreasLoaded] = useState(false);

  // Modal state
  const [modal, setModal] = useState<{
    type: "state" | "city" | "area" | null;
    mode: "add" | "edit";
    data?: any;
  }>({ type: null, mode: "add" });

  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --- Fetch Functions ---
  const fetchStates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/locations/states`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setStates(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/locations/cities`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setCities(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAreas = useCallback(async (cityId?: string, stateId?: string) => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/locations/areas`;
      const params = new URLSearchParams();
      if (cityId) params.set("cityId", cityId);
      else if (stateId) params.set("stateId", stateId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setAreas(data.data);
        setAreasLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (activeTab === "states") fetchStates();
    else if (activeTab === "cities") {
      fetchStates();
      fetchCities();
    } else if (activeTab === "areas") {
      fetchStates();
      fetchCities();
      fetchAreas();
    }
  }, [activeTab]);

  // When area filters change, re-fetch
  useEffect(() => {
    if (activeTab !== "areas") return;
    fetchAreas(areaFilterCityId || undefined, areaFilterStateId || undefined);
  }, [areaFilterCityId, areaFilterStateId, activeTab]);

  // Cities available in area city filter (filtered by selected state)
  const areaCitiesForFilter = areaFilterStateId
    ? cities.filter((c) => c.stateId === areaFilterStateId)
    : cities;

  // --- Modal Handlers ---
  const openModal = (
    type: "state" | "city" | "area",
    mode: "add" | "edit",
    data?: any,
  ) => {
    setError("");
    setModal({ type, mode, data });
    if (mode === "edit" && data) {
      setFormData({
        name: data.name,
        status: data.status,
        stateId: data.stateId || data.city?.state?.id || "",
        cityId: data.cityId || "",
        deliveryCharge: data.deliveryCharge ?? "",
      });
    } else {
      setFormData({
        name: "",
        status: "active",
        stateId: "",
        cityId: "",
        deliveryCharge: "",
      });
    }
  };

  const closeModal = () => {
    setModal({ type: null, mode: "add" });
    setFormData({});
    setError("");
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setError("Name is required.");
      return;
    }
    if (modal.type === "city" && !formData.stateId) {
      setError("Please select a state.");
      return;
    }
    if (modal.type === "area" && !formData.cityId) {
      setError("Please select a city.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const url =
        modal.mode === "edit"
          ? `${API_URL}/api/locations/${modal.type}s/${modal.data.id}`
          : `${API_URL}/api/locations/${modal.type}s`;
      const method = modal.mode === "edit" ? "PUT" : "POST";

      const body: any = {
        name: formData.name,
        status: formData.status || "active",
      };
      if (modal.type === "city") {
        body.stateId = formData.stateId;
        body.deliveryCharge = formData.deliveryCharge;
      }
      if (modal.type === "area") {
        body.cityId = formData.cityId;
        body.deliveryCharge = formData.deliveryCharge;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to save");

      if (modal.type === "state") await fetchStates();
      else if (modal.type === "city") await fetchCities();
      else if (modal.type === "area") {
        await fetchAreas(
          areaFilterCityId || undefined,
          areaFilterStateId || undefined,
        );
      }

      closeModal();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: "state" | "city" | "area", id: string) => {
    if (
      !confirm(
        `Delete this ${type}?${type === "state" ? " This will also delete all its cities and areas." : type === "city" ? " This will also delete all its areas." : ""}`,
      )
    )
      return;
    try {
      const res = await fetch(`${API_URL}/api/locations/${type}s/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        if (type === "state") fetchStates();
        else if (type === "city") fetchCities();
        else
          fetchAreas(
            areaFilterCityId || undefined,
            areaFilterStateId || undefined,
          );
      }
    } catch {
      showToast.error("Failed to delete.");
    }
  };

  // --- Filtered lists ---
  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredCities = cities
    .filter((c) => !cityFilterStateId || c.stateId === cityFilterStateId)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.state?.name.toLowerCase().includes(search.toLowerCase()),
    );

  const filteredAreas = areas.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city?.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city?.state?.name.toLowerCase().includes(search.toLowerCase()),
  );

  const modalCities = cities.filter((c) => c.stateId === formData.stateId);

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    {
      key: "states",
      label: "States / Divisions",
      icon: Globe,
      count: states.length,
    },
    {
      key: "cities",
      label: "Cities / Districts",
      icon: Building2,
      count: cities.length,
    },
    {
      key: "areas",
      label: "Areas / Upazilas",
      icon: Navigation,
      count: areas.length,
    },
  ];

  const selectClass =
    "w-full px-3 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 appearance-none transition-colors";

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <MapPin className="text-emerald-500" size={28} />
          Locations
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Manage divisions, districts, and areas for delivery zones and
          analytics.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearch("");
                setCityFilterStateId("");
                setAreaFilterStateId("");
                setAreaFilterCityId("");
              }}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.key
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {tab.key === "cities"
                  ? cities.length
                  : tab.key === "states"
                    ? states.length
                    : areas.length}
              </span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
              )}
            </button>
          ))}
          <div className="flex-1" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Cities tab — filter by Division */}
          {activeTab === "cities" && (
            <SearchableDropdown
              value={cityFilterStateId}
              onChange={(v) => setCityFilterStateId(v)}
              options={states.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="All Divisions"
              searchPlaceholder="Search division..."
              icon={<Globe size={14} />}
              className="w-52"
            />
          )}

          {/* Areas tab — filter by Division + City */}
          {activeTab === "areas" && (
            <>
              <SearchableDropdown
                value={areaFilterStateId}
                onChange={(v) => {
                  setAreaFilterStateId(v);
                  setAreaFilterCityId("");
                }}
                options={states.map((s) => ({ value: s.id, label: s.name }))}
                placeholder="Filter by Division"
                searchPlaceholder="Search division..."
                icon={<Globe size={14} />}
                className="w-52"
              />
              <SearchableDropdown
                value={areaFilterCityId}
                onChange={(v) => setAreaFilterCityId(v)}
                options={areaCitiesForFilter.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder={
                  areaFilterStateId ? "Filter by City" : "Select Division first"
                }
                searchPlaceholder="Search city..."
                icon={<Building2 size={14} />}
                disabled={!areaFilterStateId}
                className="w-52"
              />
            </>
          )}

          <div className="flex-1" />

          <button
            onClick={() =>
              openModal(
                activeTab === "states"
                  ? "state"
                  : activeTab === "cities"
                    ? "city"
                    : "area",
                "add",
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shrink-0"
          >
            <Plus size={15} />
            Add{" "}
            {activeTab === "states"
              ? "Division"
              : activeTab === "cities"
                ? "City"
                : "Area"}
          </button>
        </div>

        {/* Active filters badge */}
        {activeTab === "cities" && cityFilterStateId && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300">
            <Filter size={13} />
            Showing cities in:{" "}
            <strong>
              {states.find((s) => s.id === cityFilterStateId)?.name}
            </strong>
            <button
              onClick={() => setCityFilterStateId("")}
              className="ml-auto text-emerald-500 hover:text-emerald-700"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {activeTab === "areas" && (areaFilterStateId || areaFilterCityId) && (
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800 text-sm text-purple-700 dark:text-purple-300">
            <Filter size={13} />
            {areaFilterCityId ? (
              <>
                Showing areas in city:{" "}
                <strong>
                  {cities.find((c) => c.id === areaFilterCityId)?.name}
                </strong>
              </>
            ) : (
              <>
                Showing areas in division:{" "}
                <strong>
                  {states.find((s) => s.id === areaFilterStateId)?.name}
                </strong>
              </>
            )}
            &nbsp;— {filteredAreas.length} results
            <button
              onClick={() => {
                setAreaFilterStateId("");
                setAreaFilterCityId("");
              }}
              className="ml-auto text-purple-500 hover:text-purple-700"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 size={28} className="animate-spin mr-2" />
              Loading...
            </div>
          ) : (
            <>
              {/* States Table */}
              {activeTab === "states" && (
                <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm bg-white dark:bg-gray-800">
                  <table className="w-full text-left border-collapse min-w-[800px] text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-left">
                          Division Name
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                          Cities
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                          Status
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStates.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-12 text-center text-gray-400"
                          >
                            No divisions found
                          </td>
                        </tr>
                      ) : (
                        filteredStates.map((state) => (
                          <tr
                            key={state.id}
                            className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
                          >
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <Globe
                                  size={14}
                                  className="text-emerald-500 shrink-0"
                                />
                                {state.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                              <button
                                onClick={() => {
                                  setActiveTab("cities");
                                  setCityFilterStateId(state.id);
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                              >
                                {state._count?.cities ?? 0}
                              </button>
                            </td>
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  state.status === "active"
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                    : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                                }`}
                              >
                                {state.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 pr-2">
                              <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    openModal("state", "edit", state)
                                  }
                                  className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete("state", state.id)
                                  }
                                  className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cities Table */}
              {activeTab === "cities" && (
                <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm bg-white dark:bg-gray-800">
                  <table className="w-full text-left border-collapse min-w-[800px] text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-left">
                          City / District
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-left">
                          Division
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                          Areas
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                          Delivery Charge
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                          Status
                        </th>
                        <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCities.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-12 text-center text-gray-400"
                          >
                            No cities found
                          </td>
                        </tr>
                      ) : (
                        filteredCities.map((city) => (
                          <tr
                            key={city.id}
                            className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
                          >
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <Building2
                                  size={14}
                                  className="text-blue-500 shrink-0"
                                />
                                {city.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                              <button
                                onClick={() =>
                                  setCityFilterStateId(city.stateId)
                                }
                                className="text-xs px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                              >
                                {city.state?.name || "—"}
                              </button>
                            </td>
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center text-gray-500 dark:text-gray-400">
                              <button
                                onClick={() => {
                                  setActiveTab("areas");
                                  setAreaFilterCityId(city.id);
                                  setAreaFilterStateId(city.stateId);
                                }}
                                className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                              >
                                {city._count?.areas ?? 0}
                              </button>
                            </td>
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center font-medium text-gray-900 dark:text-white">
                              Tk {city.deliveryCharge ?? 0}
                            </td>
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  city.status === "active"
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                    : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                                }`}
                              >
                                {city.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 pr-2">
                              <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    openModal("city", "edit", city)
                                  }
                                  className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete("city", city.id)}
                                  className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Areas Tab */}
              {activeTab === "areas" && (
                <>
                  {true && (
                    <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm bg-white dark:bg-gray-800">
                      <table className="w-full text-left border-collapse min-w-[800px] text-sm">
                        <thead>
                          <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-left">
                              Area / Upazila
                            </th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-left">
                              City / District
                            </th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-left">
                              Division
                            </th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                              Delivery Charge
                            </th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                              Status
                            </th>
                            <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAreas.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="py-12 text-center text-gray-400"
                              >
                                No areas found
                              </td>
                            </tr>
                          ) : (
                            filteredAreas.map((area) => (
                              <tr
                                key={area.id}
                                className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
                              >
                                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 font-medium text-gray-900 dark:text-white">
                                  <div className="flex items-center gap-2">
                                    <Navigation
                                      size={14}
                                      className="text-purple-500 shrink-0"
                                    />
                                    {area.name}
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-gray-500 dark:text-gray-400">
                                  {area.city?.name || "—"}
                                </td>
                                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-gray-500 dark:text-gray-400">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                                    {area.city?.state?.name || "—"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center font-medium text-gray-900 dark:text-white">
                                  Tk {area.deliveryCharge ?? 0}
                                </td>
                                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                      area.status === "active"
                                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                        : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                                    }`}
                                  >
                                    {area.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 pr-2">
                                  <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() =>
                                        openModal("area", "edit", area)
                                      }
                                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDelete("area", area.id)
                                      }
                                      className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {modal.mode === "add" ? "Add" : "Edit"}{" "}
                {modal.type === "state"
                  ? "Division"
                  : modal.type === "city"
                    ? "City"
                    : "Area"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded-xl text-sm">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              {modal.type === "city" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Division <span className="text-pink-500">*</span>
                  </label>
                  <SearchableDropdown
                    value={formData.stateId || ""}
                    onChange={(v) => setFormData({ ...formData, stateId: v })}
                    options={states.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    placeholder="Select a division..."
                    searchPlaceholder="Search division..."
                  />
                </div>
              )}

              {modal.type === "area" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Division (filter cities)
                    </label>
                    <SearchableDropdown
                      value={formData.stateId || ""}
                      onChange={(v) =>
                        setFormData({ ...formData, stateId: v, cityId: "" })
                      }
                      options={states.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                      placeholder="All divisions..."
                      searchPlaceholder="Search division..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      City <span className="text-pink-500">*</span>
                    </label>
                    <SearchableDropdown
                      value={formData.cityId || ""}
                      onChange={(v) => setFormData({ ...formData, cityId: v })}
                      options={(formData.stateId ? modalCities : cities).map(
                        (c) => ({ value: c.id, label: c.name }),
                      )}
                      placeholder="Select a city..."
                      searchPlaceholder="Search city..."
                      disabled={false}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {modal.type === "state"
                    ? "Division"
                    : modal.type === "city"
                      ? "City"
                      : "Area"}{" "}
                  Name <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={`Enter name...`}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>

              {/* Delivery Charge (Only for City/Area) */}
              {(modal.type === "city" || modal.type === "area") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Delivery Charge (?)
                  </label>
                  <input
                    type="number"
                    value={formData.deliveryCharge || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryCharge: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Status
                </label>
                <div className="flex gap-3">
                  {["active", "inactive"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormData({ ...formData, status: s })}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        formData.status === s
                          ? s === "active"
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "border-pink-400 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={15} />{" "}
                    {modal.mode === "add" ? "Add" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
