import { useState } from "react";
import { motion } from "framer-motion";
import { useGetMySubscription, useGetChildren, useAddChild } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import Layout from "@/components/Layout";

export default function Settings() {
  const { user } = useAuth();
  const { data: subscription } = useGetMySubscription({ query: { retry: false } as any });
  const { data: children, refetch } = useGetChildren(user?.id ?? 0, { query: { enabled: !!user?.id } as any });
  const { mutate: addChild, isPending: addingChild } = useAddChild({
    mutation: { onSuccess: () => { refetch(); setShowAddChild(false); setChildName(""); setChildAge(""); } }
  });
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-foreground mb-8">Settings</h1>
        </motion.div>

        {/* Account */}
        <div className="space-y-4 mb-8">
          <h2 className="font-black text-foreground text-lg">Account</h2>
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-black text-lg">{user?.name?.[0] ?? "U"}</span>
              </div>
              <div>
                <p className="font-bold text-foreground">{user?.name}</p>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="space-y-4 mb-8">
          <h2 className="font-black text-foreground text-lg">Subscription</h2>
          <div className="bg-card border border-card-border rounded-2xl p-5">
            {subscription ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground capitalize">{subscription.planId} Plan</p>
                  <p className="text-muted-foreground text-sm capitalize">Status: {subscription.status}</p>
                  {subscription.currentPeriodEnd && (
                    <p className="text-muted-foreground text-xs mt-1">
                      Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${subscription.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {subscription.status}
                </span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No active subscription found.</p>
            )}
          </div>
        </div>

        {/* Children */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-foreground text-lg">Children</h2>
            <button onClick={() => setShowAddChild(!showAddChild)}
              className="text-primary text-sm font-bold hover:underline">
              + Add Child
            </button>
          </div>

          {showAddChild && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="bg-card border border-card-border rounded-2xl p-5">
              <div className="space-y-3">
                <input type="text" value={childName} onChange={e => setChildName(e.target.value)}
                  placeholder="Child's name" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="number" value={childAge} onChange={e => setChildAge(e.target.value)}
                  placeholder="Age" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <div className="flex gap-2">
                  <button onClick={() => setShowAddChild(false)} className="flex-1 border border-border text-foreground py-2 rounded-xl font-semibold hover:border-primary/40 transition-colors">Cancel</button>
                  <button onClick={() => addChild({ userId: user?.id ?? 0, data: { name: childName, age: parseInt(childAge) } })}
                    disabled={addingChild || !childName || !childAge}
                    className="flex-1 bg-primary text-white py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {addingChild ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {children?.map(child => (
            <div key={child.id} className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">{child.name[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{child.name}</p>
                <p className="text-muted-foreground text-sm">Age {child.age} · {child.totalPoints} pts · {child.currentStreak} day streak</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
