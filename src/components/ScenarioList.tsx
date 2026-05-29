"use client";

import { useState } from "react";
import type { Scenario } from "@/features/scenarios/types";
import { ScenarioTable } from "./ScenarioTable";
import { ScenarioForm } from "./ScenarioForm";
import { EditScenarioForm } from "./EditScenarioForm";

type Props = {
  scenarios: Scenario[];
};

export function ScenarioList({ scenarios }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);

  return (
    <div className="space-y-6">
      {!showAddForm && !editingScenario && (
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
        >
          + Create Scenario
        </button>
      )}

      {showAddForm && (
        <ScenarioForm onCancel={() => setShowAddForm(false)} />
      )}

      {editingScenario && (
        <EditScenarioForm
          scenario={editingScenario}
          onCancel={() => setEditingScenario(null)}
        />
      )}

      <ScenarioTable
        scenarios={scenarios}
        onEdit={(s) => setEditingScenario(s)}
      />
    </div>
  );
}
