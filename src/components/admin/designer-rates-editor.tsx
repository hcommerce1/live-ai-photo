"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface DesignerRatesEditorProps {
  designerId: string;
  customRatePerGraphic: number | null;
  customRatePerRevision: number | null;
  globalRatePerGraphic: number;
  globalRatePerRevision: number;
}

export function DesignerRatesEditor({
  designerId,
  customRatePerGraphic,
  customRatePerRevision,
  globalRatePerGraphic,
  globalRatePerRevision,
}: DesignerRatesEditorProps) {
  const [useCustomRates, setUseCustomRates] = useState(
    customRatePerGraphic !== null || customRatePerRevision !== null
  );
  const [ratePerGraphic, setRatePerGraphic] = useState(
    customRatePerGraphic ?? globalRatePerGraphic
  );
  const [ratePerRevision, setRatePerRevision] = useState(
    customRatePerRevision ?? globalRatePerRevision
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const parseCurrency = (value: string) => {
    return Math.round(parseFloat(value || "0") * 100);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/designers/${designerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customRatePerGraphic: useCustomRates ? ratePerGraphic : null,
          customRatePerRevision: useCustomRates ? ratePerRevision : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save rates");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Nie udało się zapisać stawek");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCustomRates = (checked: boolean) => {
    setUseCustomRates(checked);
    if (!checked) {
      setRatePerGraphic(globalRatePerGraphic);
      setRatePerRevision(globalRatePerRevision);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle for custom rates */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <Label htmlFor="useCustomRates" className="text-base font-medium">
            Używaj indywidualnych stawek
          </Label>
          <p className="text-sm text-gray-600">
            {useCustomRates
              ? "Ten grafik ma własne stawki"
              : "Używane są globalne stawki z ustawień"}
          </p>
        </div>
        <Switch
          id="useCustomRates"
          checked={useCustomRates}
          onCheckedChange={handleToggleCustomRates}
        />
      </div>

      {/* Rate inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ratePerGraphic">Stawka za grafikę (PLN)</Label>
          <Input
            id="ratePerGraphic"
            type="number"
            step="0.01"
            min="0"
            value={formatCurrency(ratePerGraphic)}
            onChange={(e) => setRatePerGraphic(parseCurrency(e.target.value))}
            disabled={!useCustomRates}
            className={!useCustomRates ? "bg-gray-100" : ""}
          />
          {!useCustomRates && (
            <p className="text-xs text-gray-500">
              Globalna: {formatCurrency(globalRatePerGraphic)} PLN
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ratePerRevision">Stawka za poprawkę (PLN)</Label>
          <Input
            id="ratePerRevision"
            type="number"
            step="0.01"
            min="0"
            value={formatCurrency(ratePerRevision)}
            onChange={(e) => setRatePerRevision(parseCurrency(e.target.value))}
            disabled={!useCustomRates}
            className={!useCustomRates ? "bg-gray-100" : ""}
          />
          {!useCustomRates && (
            <p className="text-xs text-gray-500">
              Globalna: {formatCurrency(globalRatePerRevision)} PLN
            </p>
          )}
        </div>
      </div>

      {/* Comparison with global rates */}
      {useCustomRates && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Porównanie z globalnymi stawkami:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>
              Za grafikę: {formatCurrency(ratePerGraphic)} PLN vs{" "}
              {formatCurrency(globalRatePerGraphic)} PLN (globalna)
              {ratePerGraphic > globalRatePerGraphic && (
                <span className="text-green-600 ml-2">
                  (+{formatCurrency(ratePerGraphic - globalRatePerGraphic)} PLN)
                </span>
              )}
              {ratePerGraphic < globalRatePerGraphic && (
                <span className="text-red-600 ml-2">
                  ({formatCurrency(ratePerGraphic - globalRatePerGraphic)} PLN)
                </span>
              )}
            </li>
            <li>
              Za poprawkę: {formatCurrency(ratePerRevision)} PLN vs{" "}
              {formatCurrency(globalRatePerRevision)} PLN (globalna)
              {ratePerRevision > globalRatePerRevision && (
                <span className="text-green-600 ml-2">
                  (+{formatCurrency(ratePerRevision - globalRatePerRevision)} PLN)
                </span>
              )}
              {ratePerRevision < globalRatePerRevision && (
                <span className="text-red-600 ml-2">
                  ({formatCurrency(ratePerRevision - globalRatePerRevision)} PLN)
                </span>
              )}
            </li>
          </ul>
        </div>
      )}

      {/* Save button and status */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            "Zapisz stawki"
          )}
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Zapisano!</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
