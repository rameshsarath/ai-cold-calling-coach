"use client";

import { useActionState } from "react";
import type { Scenario } from "@/features/scenarios/types";
import { updateScenario } from "@/features/scenarios/actions";

type Props = {
  scenario: Scenario;
  onCancel: () => void;
};

export function EditScenarioForm({ scenario, onCancel }: Props) {
  const [state, action, pending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await updateScenario(scenario.id, formData);
      if (result.success) {
        onCancel();
      }
      return result;
    },
    undefined
  );

  return (
    <form action={action} className="border rounded p-4 bg-white space-y-3">
      <h3 className="font-semibold text-lg">Edit Scenario</h3>

      <div>
        <label htmlFor="title" className="block text-sm font-medium">Title</label>
        <input id="title" name="title" type="text" required defaultValue={scenario.title} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={3} defaultValue={scenario.description ?? ""} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium">Industry</label>
          <input id="industry" name="industry" type="text" defaultValue={scenario.industry ?? ""} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="prospect_role" className="block text-sm font-medium">Prospect Role</label>
          <input id="prospect_role" name="prospect_role" type="text" defaultValue={scenario.prospect_role ?? ""} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label htmlFor="pain_points" className="block text-sm font-medium">Pain Points</label>
        <textarea id="pain_points" name="pain_points" rows={2} defaultValue={scenario.pain_points ?? ""} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label htmlFor="common_objections" className="block text-sm font-medium">Common Objections</label>
        <textarea id="common_objections" name="common_objections" rows={2} defaultValue={scenario.common_objections ?? ""} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label htmlFor="desired_outcome" className="block text-sm font-medium">Desired Outcome</label>
        <textarea id="desired_outcome" name="desired_outcome" rows={2} defaultValue={scenario.desired_outcome ?? ""} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium">Difficulty</label>
          <select id="difficulty" name="difficulty" defaultValue={scenario.difficulty ?? "beginner"} className="w-full border rounded px-3 py-2 text-sm">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label htmlFor="time_limit" className="block text-sm font-medium">Time Limit (min)</label>
          <input id="time_limit" name="time_limit" type="number" min={1} defaultValue={scenario.time_limit ?? 10} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium">Status</label>
        <select id="status" name="status" defaultValue={scenario.status} className="w-full border rounded px-3 py-2 text-sm">
          <option value="draft">Draft</option>
          <option value="testing">Testing</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {state && "error" in state && state.error && (
        <p className="text-red-600 text-sm">{state.error.message}</p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50">
          {pending ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="border rounded px-4 py-2 text-sm">Cancel</button>
      </div>
    </form>
  );
}
