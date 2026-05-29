"use client";

import { useActionState } from "react";
import { addScenario } from "@/features/scenarios/actions";

type Props = {
  onCancel: () => void;
};

export function ScenarioForm({ onCancel }: Props) {
  const [state, action, pending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await addScenario(formData);
      if (result.success) {
        onCancel();
      }
      return result;
    },
    undefined
  );

  return (
    <form action={action} className="border rounded p-4 bg-white space-y-3">
      <h3 className="font-semibold text-lg">Create Scenario</h3>

      <div>
        <label htmlFor="title" className="block text-sm font-medium">Title</label>
        <input id="title" name="title" type="text" required className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={3} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium">Industry</label>
          <input id="industry" name="industry" type="text" className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="prospect_role" className="block text-sm font-medium">Prospect Role</label>
          <input id="prospect_role" name="prospect_role" type="text" className="w-full border rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="prospect_name" className="block text-sm font-medium">Prospect Name</label>
          <input id="prospect_name" name="prospect_name" type="text" className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium">Company Name</label>
          <input id="company_name" name="company_name" type="text" className="w-full border rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label htmlFor="prospect_personality" className="block text-sm font-medium">Prospect Personality</label>
        <select id="prospect_personality" name="prospect_personality" className="w-full border rounded px-3 py-2 text-sm">
          <option value="">Select personality...</option>
          <option value="Friendly">Friendly</option>
          <option value="Busy">Busy</option>
          <option value="Skeptical">Skeptical</option>
          <option value="Aggressive">Aggressive</option>
          <option value="Technical">Technical</option>
          <option value="Gatekeeper">Gatekeeper</option>
          <option value="Decision Maker">Decision Maker</option>
          <option value="Curious">Curious</option>
        </select>
      </div>

      <div>
        <label htmlFor="pain_points" className="block text-sm font-medium">Pain Points</label>
        <textarea id="pain_points" name="pain_points" rows={2} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label htmlFor="common_objections" className="block text-sm font-medium">Common Objections</label>
        <textarea id="common_objections" name="common_objections" rows={2} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label htmlFor="desired_outcome" className="block text-sm font-medium">Desired Outcome</label>
        <textarea id="desired_outcome" name="desired_outcome" rows={2} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium">Difficulty</label>
          <select id="difficulty" name="difficulty" className="w-full border rounded px-3 py-2 text-sm">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label htmlFor="time_limit" className="block text-sm font-medium">Time Limit (min)</label>
          <input id="time_limit" name="time_limit" type="number" min={1} defaultValue={10} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
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
