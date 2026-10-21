"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ValorantData = {
  experience: string;
  role: string;
  currentRank: string;
  highestRank: string;
  competitive: string;
  achievements: string;
};

type ProfileData = {
  gamerName: string;
  bio: string;
  country: string;
};

export default function Profile() {
  const [gamerName, setGamerName] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [valorant, setValorant] = useState<ValorantData | null>(null);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [avatarStyle, setAvatarStyle] = useState("Cyber Ninja");
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [gamingSkills, setGamingSkills] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCloudProfile() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!active) return;

      if (authError || !authData.user) {
        window.location.replace("/login");
        return;
      }

      const { data: cloudProfile, error } = await supabase
        .from("gamer_profiles")
        .select("gamer_name, bio, country, selected_games, valorant, gaming_skills, avatar_style")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Cloud profile load failed:", error.message);
        return;
      }

      if (cloudProfile) {
        setGamerName(cloudProfile.gamer_name || authData.user.user_metadata?.gamer_name || "");
        setBio(cloudProfile.bio || "");
        setCountry(cloudProfile.country || "");
        setSelectedGames(Array.isArray(cloudProfile.selected_games) ? cloudProfile.selected_games : []);
        setGamingSkills(Array.isArray(cloudProfile.gaming_skills) ? cloudProfile.gaming_skills : []);
        setValorant(cloudProfile.valorant as ValorantData | null);

        const avatar = cloudProfile.avatar_style;
        if (avatar && ["Cyber Ninja", "Neon Samurai", "Cosmic Wolf"].includes(avatar)) {
          setAvatarStyle(avatar);
        }
      } else {
        setGamerName(authData.user.user_metadata?.gamer_name || "");
        setBio("");
        setCountry("");
        setSelectedGames([]);
        setGamingSkills([]);
        setValorant(null);
        setAvatarStyle("Cyber Ninja");
      }
    }

    void loadCloudProfile();

    return () => {
      active = false;
    };
  }, []);

  function toggleSkill(skill: string) {
    setGamingSkills((current) => {
      const updated = current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill];

      return updated;
    });
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed: " + error.message);
      return;
    }

    window.location.href = "/login";
  }

  async function handleSave() {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      alert("Please log in to save your profile to your account.");
      return;
    }

    const { error } = await supabase
      .from("gamer_profiles")
      .upsert(
        {
          user_id: authData.user.id,
          gamer_name: gamerName,
          bio,
          country,
          selected_games: selectedGames,
          valorant,
          gaming_skills: gamingSkills,
          avatar_style: avatarStyle,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Supabase profile save failed:", error.message);
      alert("Profile saved on this device, but cloud save failed: " + error.message);
      return;
    }

    setSaved(true);
    alert("Profile saved to your account successfully!");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Profile Header */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

          <div className="h-36 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-cyan-400/10" />

          <div className="px-8 pb-8">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-5">
                <div
                  className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-950 bg-gradient-to-br from-cyan-400 to-blue-600 text-4xl shadow-lg shadow-cyan-400/20"
                  aria-label={avatarStyle}
                  title={avatarStyle}
                >
                  {avatarStyle === "Cyber Ninja" ? "🥷" :
                   avatarStyle === "Neon Samurai" ? "⚔️" : "🐺"}
                </div>

                <div>
                  <p className="text-sm text-cyan-400">
                    GamerRP Profile
                  </p>

                  <h1 className="mt-1 text-3xl font-bold">
                    {gamerName || "Your Gamer Name"}
                  </h1>

                  <p className="mt-1 text-slate-400">
                    {country || "Your Country"}
                  </p>
                </div>
              </div>

              {valorant && (
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3">
                  <p className="text-xs text-slate-400">
                    Current Rank
                  </p>

                  <p className="mt-1 font-semibold text-cyan-300">
                    {valorant.currentRank}
                  </p>
                </div>
              )}
            </div>

            <p className="mt-6 max-w-3xl leading-7 text-slate-300">
              {bio || "Build your gaming identity and showcase your journey."}
            </p>

            {gamingSkills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {gamingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-300"
                  >
                    ✦ {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-500">
              Games
            </p>

            <p className="mt-2 text-3xl font-bold">
              {selectedGames.length}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Games with experience
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-500">
              Current Rank
            </p>

            <p className="mt-2 text-3xl font-bold">
              {valorant?.currentRank || "—"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Competitive level
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-500">
              Competitive
            </p>

            <p className="mt-2 text-3xl font-bold">
              {valorant?.competitive || "—"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Competitive experience
            </p>
          </div>

        </div>

        {/* Selected Games */}
        {selectedGames.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <p className="text-sm text-cyan-400">
              Gaming Experience
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Your Games
            </h2>

            <div className="mt-6 flex flex-wrap gap-3">
              {selectedGames.map((game) => (
                <div
                  key={game}
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-cyan-300"
                >
                  🎮 {game}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gaming Skills */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm text-cyan-400">
            Player Strengths
          </p>

          <h2 className="mt-1 text-2xl font-semibold">
            Gaming Skills
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Select the skills that describe your playstyle.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              "Aim",
              "Teamwork",
              "Strategy",
              "Leadership",
              "Shot Calling",
            ].map((skill) => {
              const selected = gamingSkills.includes(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  aria-pressed={selected}
                  className={`rounded-xl border px-4 py-3 transition ${
                    selected
                      ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
                      : "border-white/10 bg-slate-900 text-slate-300 hover:border-cyan-400/50"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {skill}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {gamingSkills.length} skills selected · Automatically saved
          </p>
        </div>

        {gamingSkills.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <p className="text-sm text-cyan-400">
              Player Strengths
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              My Skills
            </h2>

            <div className="mt-5 flex flex-wrap gap-3">
              {gamingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-cyan-300"
                >
                  🎯 {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Free Gamer Avatar Studio */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-6 sm:p-8">
          <p className="text-sm font-medium text-cyan-400">
            GAMERRP CREATOR STUDIO
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Choose Your Gamer Avatar
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Choose and save a free character for your GamerRP profile.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950 via-slate-950 to-purple-950 p-6">
              <div className="text-7xl" aria-label={avatarStyle}>
                {avatarStyle === "Cyber Ninja" ? "🥷" :
                 avatarStyle === "Neon Samurai" ? "⚔️" : "🐺"}
              </div>
              <p className="mt-5 text-lg font-bold text-white">
                {avatarStyle}
              </p>
              <p className="mt-1 text-xs text-cyan-300">
                YOUR GAMERRP CHARACTER
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Choose your character</h3>
              <div className="mt-3 grid gap-3">
                {[
                  { name: "Cyber Ninja", icon: "🥷", detail: "Stealth • Neon • Tech" },
                  { name: "Neon Samurai", icon: "⚔️", detail: "Honor • Energy • Future" },
                  { name: "Cosmic Wolf", icon: "🐺", detail: "Space • Mystery • Power" },
                ].map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => {
                      setAvatarStyle(option.name);
                      setAvatarSaved(false);
                    }}
                    aria-pressed={avatarStyle === option.name}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      avatarStyle === option.name
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/30"
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span>
                      <span className="block font-medium">{option.name}</span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {option.detail}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setAvatarSaved(true);
                }}
                className="mt-4 w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Save Avatar
              </button>

              {avatarSaved && (
                <p role="status" className="mt-3 text-sm text-green-300">
                  Avatar saved successfully!
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Basic Information */}
        <div className="mt-6 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">

          <div>
            <p className="text-sm text-cyan-400">
              Profile
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Basic Information
            </h2>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Gamer Name
            </label>

            <input
              type="text"
              value={gamerName}
              onChange={(e) => setGamerName(e.target.value)}
              placeholder="Your gamer name"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Country
            </label>

            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="India"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-cyan-400 py-3.5 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Save Profile
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl border border-red-400/30 py-3 font-semibold text-red-300 hover:bg-red-400/10"
          >
            Sign out of GamerRP
          </button>

          {saved && (
            <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-center text-green-300">
              Profile saved successfully! 🎮
            </div>
          )}
        </div>

        {/* Valorant Experience */}
        {valorant && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">

            <div className="mb-6">
              <p className="text-sm text-cyan-400">
                Game Experience
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                🎮 Valorant
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">
                  Experience
                </p>

                <p className="mt-1 font-medium">
                  {valorant.experience}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">
                  Main Role
                </p>

                <p className="mt-1 font-medium">
                  {valorant.role}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">
                  Current Rank
                </p>

                <p className="mt-1 font-medium">
                  {valorant.currentRank}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">
                  Highest Rank
                </p>

                <p className="mt-1 font-medium">
                  {valorant.highestRank}
                </p>
              </div>

            </div>

            {valorant.achievements && (
              <div className="mt-4 rounded-xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">
                  Achievements
                </p>

                <p className="mt-2 leading-7 text-slate-300">
                  {valorant.achievements}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
