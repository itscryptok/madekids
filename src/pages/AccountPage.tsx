import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useGetMySubscription, useGetChildren, useAddChild } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import Layout from "@/components/Layout";

export default function AccountPage() {
  const { user } = useAuth();
  const { data: subscription } = useGetMySubscription({ query: { retry: false } });
  const { data: children, refetch } = useGetChildren(user?.id ?? 0, { query: { enabled: !!user?.id } });
  const { mutate: addChild, isPending: addingChild } = useAddChild({
    mutation: { onSuccess: () => { refetch(); setShowAddChild(false); setChildName(""); setChildAge(""); } }
  });
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");

  const accountAge = user?.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-foreground">My Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your profile and family settings</p>
        </motion.div>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-secondary rounded-3xl p-6 mb-6 text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <span className="text-white font-black text-2xl">{user?.name?.[0] ?? "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-xl leading-tight">{user?.name}</p>
              {(user as any)?.username && (
                <p className="text-primary font-bold">@{(user as any).username}</p>
              )}
              <p className="text-white/60 text-sm truncate">{user?.email}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white/50 text-xs">Member for</p>
              <p className="text-white font-black">{accountAge}d</p>
            </div>
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="bg-card border border-card-border rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-foreground">Membership</h2>
            {!subscription && (
              <Link href="/subscribe">
                <span className="text-primary text-sm font-bold cursor-pointer hover:underline">Subscribe now →</span>
              </Link>
            )}
          </div>
          {subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground capitalize">{subscription.planId === "monthly" ? "Monthly — $5/mo" : "Annual — $50/yr"}</p>
                {subscription.currentPeriodEnd && (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${subscription.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {subscription.status}
              </span>
            </div>
          ) : (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">No active membership</p>
              <p className="text-xs text-muted-foreground">Start at $5/month to unlock daily content, recordings, and reward trips.</p>
            </div>
          )}
        </motion.div>

        {/* Account details */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-card border border-card-border rounded-2xl p-5 mb-6">
          <h2 className="font-black text-foreground mb-4">Account Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-semibold text-foreground">{user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Username</span>
              <span className="font-semibold text-foreground">{(user as any)?.username ? `@${(user as any).username}` : "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold text-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Joined</span>
              <span className="font-semibold text-foreground">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Children */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-foreground">Children</h2>
            <button onClick={() => setShowAddChild(!showAddChild)}
              className="text-primary text-sm font-bold hover:underline">
              + Add Child
            </button>
          </div>

          {showAddChild && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="bg-card border border-card-border rounded-2xl p-5 mb-4">
              <div className="space-y-3">
                <input type="text" value={childName} onChange={e => setChildName(e.target.value)}
                  placeholder="Child's name" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="number" value={childAge} onChange={e => setChildAge(e.target.value)}
                  placeholder="Age" min={1} max={18} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <div className="flex gap-2">
                  <button onClick={() => setShowAddChild(false)} className="flex-1 border border-border text-foreground py-2 rounded-xl font-semibold hover:border-primary/40 transition-colors">Cancel</button>
                  <button onClick={() => addChild({ userId: user?.id ?? 0, data: { name: childName, age: parseInt(childAge) } })}
                    disabled={addingChild || !childName || !childAge}
                    className="flex-1 bg-primary text-white py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {addingChild ? "Adding..." : "Add Child"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            {children?.length === 0 && !showAddChild && (
              <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
                <p className="text-muted-foreground text-sm">No children added yet. Add your child to start tracking their progress.</p>
              </div>
            )}
            {children?.map(child => (
              <div key={child.id} className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-black text-lg">{child.name[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{child.name}</p>
                  <p className="text-muted-foreground text-sm">Age {child.age}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-foreground">{child.totalPoints} pts</p>
                  <p className="text-muted-foreground text-xs">{child.currentStreak} day streak</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Parent Zone link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6">
          <Link href="/parent-zone">
            <div className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">🔐</div>
              <div className="flex-1">
                <p className="font-bold text-foreground">Parent Zone</p>
                <p className="text-muted-foreground text-xs">Review recordings, get tips — PIN protected</p>
              </div>
              <span className="text-muted-foreground">›</span>
            </div>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
