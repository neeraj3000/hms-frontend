// components/EmergencyActions.tsx
import { Plus } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

export type SelectedMedicineType = {
  medicineId: number | "";
  quantity: number;
  searchText?: string;
  selectedText?: string;
  suggestions?: Array<{ id: number; name: string; quantity: number }>;
};

interface Props {
  selectedMedicines: SelectedMedicineType[];
  setSelectedMedicines: React.Dispatch<
    React.SetStateAction<SelectedMedicineType[]>
  >;
  labTests: string[];
  setLabTests: React.Dispatch<React.SetStateAction<string[]>>;
}

const EmergencyActions: React.FC<Props> = ({
  selectedMedicines,
  setSelectedMedicines,
  labTests,
  setLabTests,
}) => {
  const [availableMedicines, setAvailableMedicines] = useState<any[]>([]);
  const searchTimeouts = useRef<Record<number, number>>({});
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
    number | null
  >(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    // initial fetch (optional)
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMountedRef.current) setAvailableMedicines(data.data);
        }
      } catch (err) {
        // ignore, local fallback used
      }
    })();

    return () => {
      isMountedRef.current = false;
      Object.values(searchTimeouts.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  const addMedicine = useCallback(() => {
    setSelectedMedicines((prev) => [
      ...prev,
      {
        medicineId: "",
        quantity: 1,
        searchText: "",
        selectedText: "",
        suggestions: [],
      },
    ]);
    setActiveSuggestionIndex(selectedMedicines.length);
  }, [selectedMedicines.length, setSelectedMedicines]);

  const removeMedicine = useCallback(
    (index: number) => {
      if (searchTimeouts.current[index]) {
        clearTimeout(searchTimeouts.current[index]);
        delete searchTimeouts.current[index];
      }
      setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
    },
    [setSelectedMedicines]
  );

  const updateMedicine = useCallback(
    (index: number, field: keyof SelectedMedicineType, value: any) => {
      setSelectedMedicines((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    [setSelectedMedicines]
  );

  const handleSearchChange = useCallback(
    (index: number, text: string) => {
      updateMedicine(index, "searchText", text);
      updateMedicine(index, "suggestions", []);
      if (searchTimeouts.current[index])
        clearTimeout(searchTimeouts.current[index]);
      if (!text || text.length < 2) return;

      searchTimeouts.current[index] = window.setTimeout(async () => {
        try {
          const res = await fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/medicines?search=${encodeURIComponent(text)}`
          );
          if (res.ok) {
            const data = await res.json();
            updateMedicine(index, "suggestions", data.data);
          } else {
            // fallback to local filter
            const local = availableMedicines.filter((m) =>
              m.name.toLowerCase().includes(text.toLowerCase())
            );
            updateMedicine(index, "suggestions", local);
          }
        } catch (err) {
          const local = availableMedicines.filter((m) =>
            m.name.toLowerCase().includes(text.toLowerCase())
          );
          updateMedicine(index, "suggestions", local);
        }
      }, 300) as unknown as number;
    },
    [availableMedicines, updateMedicine]
  );

  const handleSelectMedicine = useCallback(
    (index: number, med: any) => {
      const label = `${med.name} (Stock: ${med.quantity})`;
      updateMedicine(index, "medicineId", med.id);
      updateMedicine(index, "selectedText", label);
      updateMedicine(index, "searchText", label);
      updateMedicine(index, "suggestions", []);
      setActiveSuggestionIndex(null);
    },
    [updateMedicine]
  );

  const addLabTest = useCallback(() => {
    setLabTests((prev) => [...prev, ""]);
  }, [setLabTests]);

  const updateLabTest = useCallback(
    (index: number, value: string) => {
      setLabTests((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    [setLabTests]
  );

  const removeLabTest = useCallback(
    (index: number) => {
      setLabTests((prev) => prev.filter((_, i) => i !== index));
    },
    [setLabTests]
  );

  return (
    <div className="border-t border-gray-200 pt-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Emergency Actions</h3>

      {/* Medicines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Prescribe Medicines (Nurse)</h4>
          <button
            onClick={addMedicine}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>

        {selectedMedicines.length === 0 ? (
          <p className="text-gray-500">No medicines added yet.</p>
        ) : (
          <div className="space-y-3">
            {selectedMedicines.map((m, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-3 relative"
              >
                <div className="flex gap-4 items-end">
                  <div className="flex-1 relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Medicine
                    </label>
                    <input
                      type="text"
                      value={m.searchText ?? m.selectedText ?? ""}
                      onChange={(e) => handleSearchChange(idx, e.target.value)}
                      onFocus={() => setActiveSuggestionIndex(idx)}
                      placeholder="Search medicine..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {activeSuggestionIndex === idx &&
                      m.suggestions &&
                      m.suggestions.length > 0 && (
                        <ul className="absolute z-40 bg-white w-full border border-gray-300 mt-1 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                          {m.suggestions!.map((s) => (
                            <li
                              key={s.id}
                              onClick={() => handleSelectMedicine(idx, s)}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {s.name} (Stock: {s.quantity})
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>

                  <div className="w-28">
                    <label className="block text-sm font-medium text-gray-700">
                      Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={m.quantity}
                      onChange={(e) =>
                        updateMedicine(idx, "quantity", Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lab tests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Request Lab Tests</h4>
          <button
            onClick={addLabTest}
            className="flex items-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lab Test</span>
          </button>
        </div>

        {labTests.length === 0 ? (
          <p className="text-gray-500">No lab tests requested.</p>
        ) : (
          <div className="space-y-2">
            {labTests.map((t, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={t}
                  onChange={(e) => updateLabTest(i, e.target.value)}
                  placeholder="Enter test name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeLabTest(i)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyActions;
