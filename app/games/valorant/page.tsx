"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ValorantExperience() {
  const [experience, setExperience] = useState("");
  const [role, setRole] = useState("");
  const [currentRank, setCurrentRank] = useState("");
  const [highestRank, setHighestRank] = useState("");
  const [competitive, setCompetitive] = useState("");
  const [achievements, setAchievements] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadValorant() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!active) return;

      if (authError || !authData.user) {
        window.location.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("gamer_profiles")
        .select("valorant")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Valorant load failed:", error.message);
        alert("Could not load your Valorant details. Please refresh and try again.");
        return;
      }

      const details = data?.valorant;

      if (details && typeof details === "object" && !Array.isArray(details)) {
        setExperience(typeof details.experience === "string" ? details.experience : "");
        setRole(typeof details.role === "string" ? details.role : "");
        setCurrentRank(typeof details.currentRank === "string" ? details.currentRank : "");
        setHighestRank(typeof details.highestRank === "string" ? details.highestRank : "");
        setCompetitive(typeof details.competitive === "string" ? details.competitive : "");
        setAchievements(typeof details.achievements === "string" ? details.achievements : "");
      }
    }

    void loadValorant();

    return () => {
      active = false;
    };
  }, []);

  async function handleSave() {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      window.location.replace("/login");
      return;
    }

    const data = {
      experience,
      role,
      currentRank,
      highestRank,
      competitive,
      achievements,
    };

    const { error } = await supabase
      .from("gamer_profiles")
      .upsert(
        {
          user_id: authData.user.id,
          valorant: data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Valorant save failed:", error.message);
      alert("Valorant details could not be saved: " + error.message);
      return;
    }

    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <p className="text-sm font-medium text-cyan-400">GamerRP</p>

          <h1 className="mt-2 text-4xl font-bold">
            Valorant Experience
          </h1>

          <p className="mt-3 text-slate-400">
            Add your competitive experience and achievements.
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">

          <div>
            <label className="mb-2 block text-sm font-medium">
              How long have you played Valorant?
            </label>

            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
            >
              <option value="">Select experience</option>
              <option>Less than 1 year</option>
              <option>1 - 2 years</option>
              <option>2 - 3 years</option>
              <option>3 - 5 years</option>
              <option>5+ years</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Main Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
            >
              <option value="">Select your role</option>
              <option>Duelist</option>
              <option>Controller</option>
              <option>Initiator</option>
              <option>Sentinel</option>
              <option>Flex</option>
              <option>IGL</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Current Rank
            </label>

            <select
              value={currentRank}
              onChange={(e) => setCurrentRank(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
            >
              <option value="">Select current rank</option>
              <option>Iron</option>
              <option>Bronze</option>
              <option>Silver</option>
              <option>Gold</option>
              <option>Platinum</option>
              <option>Diamond</option>
              <option>Ascendant</option>
              <option>Immortal</option>
              <option>Radiant</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Highest Rank Achieved
            </label>

            <select
              value={highestRank}
              onChange={(e) => setHighestRank(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
            >
              <option value="">Select highest rank</option>
              <option>Iron</option>
              <option>Bronze</option>
              <option>Silver</option>
              <option>Gold</option>
              <option>Platinum</option>
              <option>Diamond</option>
              <option>Ascendant</option>
              <option>Immortal</option>
              <option>Radiant</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Have you played competitively?
            </label>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCompetitive("Yes")}
                className={`flex-1 rounded-xl border px-4 py-3 ${
                  competitive === "Yes"
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-slate-900"
                }`}
              >
                Yes
              </button>

              <button
                type="button"
                onClick={() => setCompetitive("No")}
                className={`flex-1 rounded-xl border px-4 py-3 ${
                  competitive === "No"
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-slate-900"
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Achievements
            </label>

            <textarea
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="Example: Won 2 local tournaments, reached Immortal 3..."
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-cyan-400 py-3.5 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Save Valorant Experience
          </button>

          {saved && (
            <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-center text-green-300">
              Valorant experience saved successfully! 🎮
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
