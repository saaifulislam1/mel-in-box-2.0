// src/app/(user)/profile/page.tsx

"use client";

import { useAuth } from "@/app/AuthProvider";
import useUserGuard from "@/hooks/useUserGuard";
import Link from "next/link";
import {
  Activity,
  CalendarClock,
  Gamepad2,
  LayoutDashboard,
  Mail,
  PlayCircle,
  Settings,
  Shield,
  Star,
  Trophy,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { deleteGameProgress, getGameSummary } from "@/lib/gameProgressService";
import {
  deleteUserStats,
  getUserStats,
  type UserStats,
} from "@/lib/userStatsService";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UserProfilePage() {
  useUserGuard();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [statsMessage, setStatsMessage] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof getGameSummary>
  > | null>(null);
  const [userStats, setUserStatsState] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "achievements" | "activity" | "settings"
  >("overview");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const displayName = user?.displayName || "";
  const initialFirst = displayName.split(" ")[0] || "";
  const initialLast = displayName.split(" ").slice(1).join(" ");

  useEffect(() => {
    let mounted = true;
    const loadPoints = async () => {
      if (!user) return;
      try {
        setStatsLoading(true);
        setStatsMessage(null);
        const [gameSummary, stats] = await Promise.all([
          getGameSummary(user.uid),
          getUserStats(user.uid),
        ]);
        if (!mounted) return;
        setSummary(gameSummary);
        setUserStatsState(stats);
      } catch (err) {
        console.error("Failed to load profile stats", err);
        if (!mounted) return;
        setStatsMessage("Could not load stats. Please try again.");
      } finally {
        if (mounted) setStatsLoading(false);
      }
    };
    loadPoints();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const fn = firstName.trim() || initialFirst;
    const ln = lastName.trim() || initialLast;
    const newName = [fn, ln].filter(Boolean).join(" ").trim();
    if (!newName) {
      setProfileMessage("Please provide at least a first name.");
      return;
    }
    setSaving(true);
    setProfileMessage(null);
    try {
      await updateProfile(user, { displayName: newName });
      setProfileMessage("Profile updated.");
    } catch (err) {
      console.error("Profile update failed", err);
      setProfileMessage("Could not update profile right now.");
    } finally {
      setSaving(false);
    }
  };

  const totalPoints = summary?.totalPoints ?? 0;
  const totalLevelsCompleted = summary?.totalLevelsCompleted ?? 0;
  const totalGamesPlayed = summary?.totalGamesPlayed ?? 0;
  const storiesWatched = userStats?.storiesWatched ?? 0;
  const isPasswordUser = Boolean(
    user?.providerData?.some((provider) => provider.providerId === "password")
  );

  const achievements = useMemo(
    () => [
      {
        id: "first-game",
        title: "First Game!",
        description: "Play your first game.",
        achieved: totalGamesPlayed >= 1,
      },
      {
        id: "game-explorer",
        title: "Game Explorer",
        description: "Play 3 different games.",
        achieved: totalGamesPlayed >= 3,
        progress: `${Math.min(totalGamesPlayed, 3)}/3`,
      },
      {
        id: "level-solver",
        title: "Level Solver",
        description: "Complete 10 levels.",
        achieved: totalLevelsCompleted >= 10,
        progress: `${Math.min(totalLevelsCompleted, 10)}/10`,
      },
      {
        id: "story-fan",
        title: "Story Time Fan",
        description: "Watch 5 story videos.",
        achieved: storiesWatched >= 5,
        progress: `${Math.min(storiesWatched, 5)}/5`,
      },
      {
        id: "point-collector",
        title: "Point Collector",
        description: "Earn 500 total points.",
        achieved: totalPoints >= 500,
        progress: `${Math.min(totalPoints, 500)}/500`,
      },
      {
        id: "star-player",
        title: "Star Player",
        description: "Earn 1,000 total points.",
        achieved: totalPoints >= 1000,
        progress: `${Math.min(totalPoints, 1000)}/1000`,
      },
    ],
    [storiesWatched, totalGamesPlayed, totalLevelsCompleted, totalPoints]
  );

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    if (!user) return;
    if (!isPasswordUser) {
      setPasswordMessage(
        "Password updates are available for email/password accounts."
      );
      return;
    }
    if (!currentPassword || !newPassword) {
      setPasswordMessage("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    if (!user.email) {
      setPasswordMessage("Email not available for this account.");
      return;
    }
    setPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to update password", err);
      setPasswordMessage("Could not update password. Try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setDeleteMessage(null);
    if (!user) return;
    if (deleteConfirm.trim().toUpperCase() !== "DELETE") {
      setDeleteMessage("Type DELETE to confirm.");
      return;
    }
    if (!isPasswordUser) {
      setDeleteMessage(
        "Please re-login with your provider to delete this account."
      );
      return;
    }
    if (!deletePassword) {
      setDeleteMessage("Enter your password to confirm deletion.");
      return;
    }
    if (!user.email) {
      setDeleteMessage("Email not available for this account.");
      return;
    }
    setDeleteSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        deletePassword
      );
      await reauthenticateWithCredential(user, credential);
      await Promise.allSettled([
        deleteGameProgress(user.uid),
        deleteUserStats(user.uid),
        deleteDoc(doc(db, "spellingProgress", user.uid)),
      ]);
      await deleteUser(user);
      setDeleteMessage("Account deleted.");
    } catch (err) {
      console.error("Failed to delete account", err);
      setDeleteMessage("Could not delete account. Try again.");
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <main className="bg-gradient-to-br  from-indigo-50 via-slate-50  to-white min-h-screen px-4 sm:mx-0 pb-16 pt-20 ">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-lg">
              {user?.displayName?.[0] || "U"}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">Game points</p>
                <p className="font-semibold">
                  {summary ? summary.totalPoints : "—"}
                </p>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {user?.displayName || user?.email || "Profile"}
              </h1>
              <p className="text-sm text-slate-500">Manage your account</p>
            </div>
          </div>
        </div>

        <section className="rounded-3xl bg-white shadow-lg border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-5 h-5 text-indigo-500" />
            <p className="font-semibold">Profile</p>
          </div>

          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700"
          >
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
              <span className="text-xs text-slate-500">First name</span>
              <input
                defaultValue={initialFirst}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="First name"
              />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
              <span className="text-xs text-slate-500">Last name</span>
              <input
                defaultValue={initialLast}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="Last name"
              />
            </label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-semibold">{user?.email || "Not provided"}</p>
              </div>
            </div>
            {/* <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">UID</p>
                <p className="font-semibold break-all">
                  {user?.uid || "Unknown"}
                </p>
              </div>
            </div> */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">Last login</p>
                <p className="font-semibold">
                  {user?.metadata?.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">Joined</p>
                <p className="font-semibold">
                  {user?.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </form>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
          {profileMessage && (
            <div className="text-sm text-slate-700 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
              {profileMessage}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white shadow-lg border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-slate-700">
              <LayoutDashboard className="w-5 h-5 text-indigo-500" />
              <p className="font-semibold">My Progress</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "overview", label: "Overview", icon: LayoutDashboard },
                { id: "achievements", label: "Achievements", icon: Trophy },
                { id: "activity", label: "Activity", icon: Activity },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as "overview" | "achievements" | "activity" | "settings"
                      )
                    }
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {statsMessage && (
            <div className="text-sm text-slate-700 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
              {statsMessage}
            </div>
          )}

          {statsLoading ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Loading your stats...
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between text-indigo-600">
                      <Gamepad2 className="w-5 h-5" />
                      <span className="text-xs font-semibold">Games played</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">
                      {totalGamesPlayed}
                    </p>
                    <p className="text-xs text-slate-600">
                      Unique games completed.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between text-emerald-600">
                      <PlayCircle className="w-5 h-5" />
                      <span className="text-xs font-semibold">
                        Stories watched
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">
                      {storiesWatched}
                    </p>
                    <p className="text-xs text-slate-600">
                      Story Time videos opened.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between text-amber-600">
                      <Star className="w-5 h-5" />
                      <span className="text-xs font-semibold">Total points</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">
                      {totalPoints}
                    </p>
                    <p className="text-xs text-slate-600">
                      Points earned across games.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "achievements" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`rounded-2xl border px-4 py-4 space-y-2 ${
                        achievement.achieved
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy
                            className={`w-5 h-5 ${
                              achievement.achieved
                                ? "text-emerald-500"
                                : "text-slate-400"
                            }`}
                          />
                          <p className="font-semibold text-slate-800">
                            {achievement.title}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            achievement.achieved
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {achievement.achieved ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {achievement.description}
                      </p>
                      {achievement.progress && (
                        <p className="text-xs text-slate-500">
                          Progress: {achievement.progress}
                        </p>
                      )}
                      {achievement.achieved && (
                        <p className="text-xs text-emerald-600 font-semibold">
                          Congratulations!
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  Activity tracking is coming soon. Tell us what you want to see
                  here.
                </div>
              )}

              {activeTab === "settings" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Shield className="w-4 h-4 text-indigo-500" />
                      <p className="font-semibold">Change password</p>
                    </div>
                    {!isPasswordUser && (
                      <p className="text-sm text-slate-500">
                        Password updates are available for email/password
                        accounts.
                      </p>
                    )}
                    <form className="space-y-3" onSubmit={handlePasswordChange}>
                      <label className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm space-y-1 block">
                        <span className="text-xs text-slate-500">
                          Current password
                        </span>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(event) =>
                            setCurrentPassword(event.target.value)
                          }
                          className="w-full bg-transparent focus:outline-none"
                          placeholder="Enter current password"
                          disabled={!isPasswordUser}
                        />
                      </label>
                      <label className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm space-y-1 block">
                        <span className="text-xs text-slate-500">
                          New password
                        </span>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          className="w-full bg-transparent focus:outline-none"
                          placeholder="Create a new password"
                          disabled={!isPasswordUser}
                        />
                      </label>
                      <label className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm space-y-1 block">
                        <span className="text-xs text-slate-500">
                          Confirm new password
                        </span>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          className="w-full bg-transparent focus:outline-none"
                          placeholder="Re-enter new password"
                          disabled={!isPasswordUser}
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={passwordSaving || !isPasswordUser}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                      >
                        {passwordSaving ? "Updating..." : "Update password"}
                      </button>
                    </form>
                    {passwordMessage && (
                      <p className="text-sm text-slate-600">
                        {passwordMessage}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-700">
                      <Settings className="w-4 h-4" />
                      <p className="font-semibold">Delete account</p>
                    </div>
                    <p className="text-sm text-rose-700">
                      This permanently deletes your account and progress.
                    </p>
                    <form className="space-y-3" onSubmit={handleDeleteAccount}>
                      <label className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm space-y-1 block">
                        <span className="text-xs text-rose-500">
                          Type DELETE to confirm
                        </span>
                        <input
                          value={deleteConfirm}
                          onChange={(event) =>
                            setDeleteConfirm(event.target.value)
                          }
                          className="w-full bg-transparent focus:outline-none"
                          placeholder="DELETE"
                        />
                      </label>
                      <label className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm space-y-1 block">
                        <span className="text-xs text-rose-500">
                          Password
                        </span>
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(event) =>
                            setDeletePassword(event.target.value)
                          }
                          className="w-full bg-transparent focus:outline-none"
                          placeholder="Enter your password"
                          disabled={!isPasswordUser}
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={deleteSaving}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                      >
                        {deleteSaving ? "Deleting..." : "Delete account"}
                      </button>
                    </form>
                    {deleteMessage && (
                      <p className="text-sm text-rose-700">{deleteMessage}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="rounded-3xl bg-white shadow-lg border border-slate-200 p-5 space-y-3">
          <p className="text-sm text-slate-700">
            Need changes? Reach out to support to update your account details.
          </p>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition"
          >
            Go to My bookings
          </Link>
        </section>
      </div>
    </main>
  );
}
