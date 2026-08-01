"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Database,
  ArrowRight,
  Loader2,
  Terminal,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Lock,
  Download,
} from "lucide-react";
import { API_URL } from "@/lib/config";
import ColumnMapper from "@/components/admin/bulk-import/ColumnMapper";
import ImportLogs from "@/components/admin/bulk-import/ImportLogs";

export default function BulkImportPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "history">("upload");
  const [importType, setImportType] = useState<"PRODUCTS" | "ORDERS">("PRODUCTS");
  const [importPlatform, setImportPlatform] = useState<"CUSTOM" | "SHOPIFY" | "WOOCOMMERCE">("CUSTOM");

  // File states
  const [file, setFile] = useState<File | null>(null);
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [parsingHeaders, setParsingHeaders] = useState(false);

  // Mapping state
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarningsConfirm, setShowWarningsConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Field Schemas
  const productFields = [
    { key: "name", label: "Product Name", required: true, description: "Name of the product" },
    { key: "price", label: "Price", required: true, description: "Regular price amount" },
    { key: "sku", label: "SKU", required: false, description: "Stock Keeping Unit code" },
    { key: "slug", label: "Slug", required: false, description: "Unique URL identifier" },
    { key: "stock", label: "Stock Quantity", required: false, description: "Initial inventory count" },
    { key: "comparePrice", label: "Compare Price", required: false, description: "Original strike-through price" },
    { key: "specialPrice", label: "Special Price", required: false, description: "Sale or promotional price" },
    { key: "description", label: "Description", required: false, description: "Long product details HTML/Text" },
    { key: "shortDescription", label: "Short Description", required: false, description: "Brief snippet summary" },
    { key: "featured", label: "Featured", required: false, description: "Boolean 'true' or 'false'" },
    { key: "brand", label: "Brand Name", required: false, description: "Brand will be auto-created if missing" },
    { key: "categories", label: "Categories (comma-separated)", required: false, description: "Category structures will be auto-created" },
    { key: "images", label: "Images (comma-separated URLs)", required: false, description: "Downloads and hosts files" },
    { key: "specifications", label: "Specifications (Key:Value,Key2:Value2)", required: false, description: "Additional details grid" },
    { key: "parentSku", label: "Parent SKU", required: false, description: "If a variant row, SKU of parent" },
    { key: "parentSlug", label: "Parent Slug", required: false, description: "If a variant row, Slug of parent" },
    { key: "variantAttributes", label: "Variant Attributes (Key:Value,Key2:Value2)", required: false, description: "Variant options (e.g. Size:M)" },
  ];

  const orderFields = [
    { key: "orderId", label: "Order ID / External ID", required: true, description: "Unique identifier of the order" },
    { key: "customerName", label: "Customer Name", required: false, description: "Billing customer name" },
    { key: "customerEmail", label: "Customer Email", required: false, description: "Used to match or create guest accounts" },
    { key: "customerPhone", label: "Customer Phone", required: false, description: "Billing phone contact" },
    { key: "deliveryAddress", label: "Delivery Address", required: false, description: "Full street shipping address" },
    { key: "deliveryCity", label: "City", required: false, description: "City (e.g. Dhaka)" },
    { key: "deliveryArea", label: "Area", required: false, description: "Area / neighborhood name" },
    { key: "deliveryState", label: "State", required: false, description: "State / Division" },
    { key: "paymentMethod", label: "Payment Method (COD, CARD, BKASH, etc.)", required: false, description: "Payment gateway code" },
    { key: "paymentStatus", label: "Payment Status (PAID/UNPAID)", required: false, description: "PAID or UNPAID" },
    { key: "total", label: "Grand Total Amount", required: true, description: "Total price paid" },
    { key: "subtotal", label: "Subtotal Amount", required: false, description: "Total before fees and discounts" },
    { key: "deliveryFee", label: "Delivery Fee", required: false, description: "Shipping cost amount" },
    { key: "discount", label: "Discount Total", required: false, description: "Coupon or loyalty deductions" },
    { key: "status", label: "Order Status (PENDING, PROCESSING, etc.)", required: false, description: "Current workflow state" },
    { key: "items", label: "Items (SKU1:Qty1|Price1, SKU2:Qty2)", required: true, description: "Ordered product SKU line item rows" },
  ];

  const currentFields = importType === "PRODUCTS" ? productFields : orderFields;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsingHeaders(true);
    setSheetHeaders([]);
    setPreviewRows([]);
    setMapping({});
    setWarnings([]);
    setShowWarningsConfirm(false);
    setImportStatus(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";

      const res = await fetch(`${API_URL}/api/bulk-import/preview-headers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setSheetHeaders(json.headers || []);
        setPreviewRows(json.previewRows || []);
      } else {
        alert(json.message || "Failed to parse file headers.");
        setFile(null);
      }
    } catch (err: any) {
      console.error(err);
      alert("An error occurred while loading headers.");
      setFile(null);
    } finally {
      setParsingHeaders(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        input.files = dataTransfer.files;
        // Trigger manual change listener
        const event = { target: input } as any;
        handleFileChange(event);
      }
    }
  };

  const executeImport = async () => {
    setImporting(true);
    setImportStatus(null);
    setShowWarningsConfirm(false);

    const formData = new FormData();
    formData.append("file", file!);
    formData.append("mapping", JSON.stringify(mapping));
    formData.append("importPlatform", importPlatform);

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";

      const endpoint =
        importType === "PRODUCTS"
          ? `${API_URL}/api/bulk-import/products`
          : `${API_URL}/api/bulk-import/orders`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setImportStatus({
          success: true,
          message: "Data spreadsheet is processing in the background! Redirecting to queue...",
        });
        
        // Auto redirect to queue tab to view logs in 2s
        setTimeout(() => {
          setActiveTab("history");
          // Clear file state to allow new uploads
          setFile(null);
          setSheetHeaders([]);
          setPreviewRows([]);
          setMapping({});
          setWarnings([]);
        }, 1800);
      } else {
        setImportStatus({
          success: false,
          message: json.message || "Bulk import failed to launch.",
        });
      }
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: err.message || "A network error occurred.",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleStartImport = async () => {
    if (!file) return;

    if (importPlatform === "CUSTOM") {
      // Check required mappings
      const missing = currentFields
        .filter((f) => f.required && !mapping[f.key])
        .map((f) => f.label);

      if (missing.length > 0) {
        alert(`Please map the following required fields: ${missing.join(", ")}`);
        return;
      }
    }

    if (showWarningsConfirm || importPlatform !== "CUSTOM") {
      await executeImport();
      return;
    }

    setImporting(true);
    setImportStatus(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mapping", JSON.stringify(mapping));
    formData.append("importType", importType);

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";

      const res = await fetch(`${API_URL}/api/bulk-import/validate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.warnings && json.warnings.length > 0) {
        setWarnings(json.warnings);
        setShowWarningsConfirm(true);
      } else {
        await executeImport();
      }
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: err.message || "A validation check error occurred.",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          Spreadsheet Data Importer
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base font-medium">
          Import and synchronize products, variants, brands, categories, and orders dynamically using CSV or Excel `.xlsx` spreadsheets.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden">
        {/* Header Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-850 p-2 gap-2 bg-gray-50/50 dark:bg-gray-950/40">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-5 py-3 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap outline-none ${
              activeTab === "upload"
                ? "bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200/50 dark:border-gray-800"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Upload size={16} /> Upload & Setup
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-3 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap outline-none ${
              activeTab === "history"
                ? "bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200/50 dark:border-gray-800"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Terminal size={16} /> Import Tasks History
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {activeTab === "upload" ? (
            <div className="space-y-8">
              {/* Step 1: Select Type */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-gray-850 dark:text-gray-200 flex items-center gap-2">
                  <Database size={16} className="text-emerald-600" />
                  1. What data are you importing?
                  {file && <Lock size={12} className="text-gray-400 ml-1" />}
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (!file) setImportType("PRODUCTS");
                    }}
                    disabled={!!file}
                    className={`px-6 py-4 rounded-2xl border text-left flex flex-col gap-1 transition-all w-full max-w-[280px] disabled:opacity-60 disabled:cursor-not-allowed ${
                      importType === "PRODUCTS"
                        ? "bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm">Products & Catalog</span>
                      {file && <Lock size={12} className="text-gray-400 opacity-60" />}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Import products, options, stock, specs, and variants.</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!file) setImportType("ORDERS");
                    }}
                    disabled={!!file}
                    className={`px-6 py-4 rounded-2xl border text-left flex flex-col gap-1 transition-all w-full max-w-[280px] disabled:opacity-60 disabled:cursor-not-allowed ${
                      importType === "ORDERS"
                        ? "bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm">Orders & Line Items</span>
                      {file && <Lock size={12} className="text-gray-400 opacity-60" />}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Import customers, purchase total, payment status, and items.</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Select Format */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-gray-850 dark:text-gray-200 flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  2. Select Format Source
                  {file && <Lock size={12} className="text-gray-400 ml-1" />}
                </h3>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => {
                      if (!file) setImportPlatform("CUSTOM");
                    }}
                    disabled={!!file}
                    className={`px-6 py-4 rounded-2xl border text-left flex flex-col gap-1 transition-all w-full max-w-[280px] disabled:opacity-60 disabled:cursor-not-allowed ${
                      importPlatform === "CUSTOM"
                        ? "bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm">Custom Spreadsheet</span>
                      {file && <Lock size={12} className="text-gray-400 opacity-60" />}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Map your own custom columns.</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!file) setImportPlatform("SHOPIFY");
                    }}
                    disabled={!!file}
                    className={`px-6 py-4 rounded-2xl border text-left flex flex-col gap-1 transition-all w-full max-w-[280px] disabled:opacity-60 disabled:cursor-not-allowed ${
                      importPlatform === "SHOPIFY"
                        ? "bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm">Shopify Export</span>
                      {file && <Lock size={12} className="text-gray-400 opacity-60" />}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">No mapping required. Parses Options & Variants automatically.</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!file) setImportPlatform("WOOCOMMERCE");
                    }}
                    disabled={!!file}
                    className={`px-6 py-4 rounded-2xl border text-left flex flex-col gap-1 transition-all w-full max-w-[280px] disabled:opacity-60 disabled:cursor-not-allowed ${
                      importPlatform === "WOOCOMMERCE"
                        ? "bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm">WooCommerce Export</span>
                      {file && <Lock size={12} className="text-gray-400 opacity-60" />}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">No mapping required. Native structure support.</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Upload Zone */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-850 dark:text-gray-200 flex items-center gap-2">
                    <Upload size={16} className="text-emerald-600" />
                    3. Choose Spreadsheet File
                  </h3>
                  {importPlatform === "CUSTOM" && (
                    <button
                      onClick={() => alert("Template download feature coming soon!")}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50 transition-all"
                    >
                      <Download size={14} />
                      Download {importType === "PRODUCTS" ? "Product" : "Order"} Template
                    </button>
                  )}
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center transition-all ${
                    file
                      ? "border-emerald-400/80 bg-emerald-50/10 dark:bg-emerald-950/5"
                      : "border-gray-200 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-800 bg-gray-50/30 dark:bg-gray-950/20"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {parsingHeaders ? (
                    <div className="py-4 space-y-2">
                      <Loader2 size={36} className="animate-spin text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Reading columns data...</p>
                    </div>
                  ) : file ? (
                    <div className="space-y-4">
                      <FileSpreadsheet size={40} className="text-emerald-600 mx-auto" />
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-white">{file.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">
                          {(file.size / 1024).toFixed(1)} KB • {sheetHeaders.length} Column Headers Found
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setSheetHeaders([]);
                          setPreviewRows([]);
                          setMapping({});
                          setImportStatus(null);
                        }}
                        className="text-xs font-bold text-rose-500 hover:text-rose-600 underline"
                      >
                        Reset and Choose Different File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload size={36} className="text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">
                          Drag & drop your file here, or{" "}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-emerald-600 hover:text-emerald-700 underline font-black"
                          >
                            browse files
                          </button>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                          Supports CSV, XLS, and XLSX sheets (Max size 25MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Column Mapping & Preview */}
              {file && sheetHeaders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 border-t border-gray-100 dark:border-gray-850 pt-8"
                >
                  {importPlatform === "CUSTOM" && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-gray-850 dark:text-gray-200 flex items-center gap-2">
                        <HelpCircle size={16} className="text-emerald-600" />
                        4. Map Spreadsheet Columns to System Fields
                      </h3>
                      <ColumnMapper
                        headers={sheetHeaders}
                        fields={currentFields}
                        mapping={mapping}
                        setMapping={setMapping}
                      />
                    </div>
                  )}

                  {/* Spreadsheet Preview Grid */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-gray-850 dark:text-gray-200">
                      📄 Spreadsheet Preview (First 5 Rows)
                    </h3>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-2xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-900/50 font-semibold border-b border-gray-200 dark:border-gray-800 text-gray-500">
                            {sheetHeaders.map((header) => (
                              <th key={header} className="px-4 py-3 whitespace-nowrap">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-gray-100 dark:border-gray-850">
                              {sheetHeaders.map((header) => (
                                <td key={header} className="px-4 py-2.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  {row[header]?.toString() || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="border-t border-gray-100 dark:border-gray-850 pt-6 flex flex-col items-end gap-3 w-full">
                    {warnings.length > 0 && showWarningsConfirm && (
                      <div className="w-full p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 space-y-2">
                        <h4 className="text-xs font-black flex items-center gap-1">
                          <AlertCircle size={14} /> Pre-Import Validation Warnings ({warnings.length}):
                        </h4>
                        <ul className="list-disc pl-5 text-[10px] space-y-1 max-h-[140px] overflow-y-auto font-medium">
                          {warnings.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold pt-1">
                          You can still import the valid rows by clicking "Force Import anyway" below. Invalid rows will be skipped and logged.
                        </p>
                      </div>
                    )}

                    {importStatus && (
                      <div
                        className={`w-full p-4 rounded-2xl flex items-center gap-3 border ${
                          importStatus.success
                            ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400"
                            : "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-400"
                        }`}
                      >
                        {importStatus.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="text-xs font-semibold">{importStatus.message}</span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {showWarningsConfirm && (
                        <button
                          onClick={() => {
                            setShowWarningsConfirm(false);
                            setWarnings([]);
                          }}
                          className="px-5 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-black rounded-2xl transition-all"
                        >
                          Cancel
                        </button>
                      )}
                      
                      <button
                        onClick={handleStartImport}
                        disabled={importing}
                        className={`px-6 py-3.5 text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${
                          showWarningsConfirm
                            ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 hover:shadow-amber-700/30"
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-700/30"
                        }`}
                      >
                        {importing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Processing...
                          </>
                        ) : showWarningsConfirm ? (
                          <>
                            Force Import anyway <ArrowRight size={14} />
                          </>
                        ) : (
                          <>
                            Start Spreadsheet Import <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <ImportLogs />
          )}
        </div>
      </div>
    </div>
  );
}
