import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";

type GalleryItem = {
  id: number;
  src?: string;
  caption: string;
  date: string;
};

const tripPhotos: GalleryItem[] = [];

const conventionPhotos: GalleryItem[] = [];

function PlaceholderCard({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer group rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-muted flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
        {item.src ? (
          <img src={item.src} alt={item.caption} className="w-full h-full object-cover" />
        ) : (
          <div className="relative z-10 text-center px-4">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-muted-foreground text-xs font-medium">Photo coming soon</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-foreground leading-snug">{item.caption}</p>
        <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
      </div>
    </motion.div>
  );
}

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={e => e.stopPropagation()}
          className="bg-card rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
        >
          <div className="aspect-[4/3] bg-muted flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
            {item.src ? (
              <img src={item.src} alt={item.caption} className="w-full h-full object-cover" />
            ) : (
              <div className="relative z-10 text-center px-4">
                <div className="text-6xl mb-3">📸</div>
                <p className="text-muted-foreground text-sm font-medium">Photo coming soon</p>
              </div>
            )}
          </div>
          <div className="p-5 flex items-start justify-between">
            <div>
              <p className="font-bold text-foreground">{item.caption}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none ml-4 shrink-0">✕</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Gallery() {
  const [lightbox, setLightbox] = useState<{ section: "trips" | "convention"; item: GalleryItem } | null>(null);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-black text-foreground">Event Gallery</h1>
          <p className="text-muted-foreground mt-1">Real moments from Made-Kids trips and conventions.</p>
        </motion.div>

        {/* Section 1 — Quarterly Trips */}
        <section className="mb-14">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl shrink-0">🎢</div>
            <div>
              <h2 className="text-xl font-black text-foreground">Quarterly Kids Amusement Park Trips</h2>
              <p className="text-sm text-muted-foreground">Top improved kids each quarter earn a real trip. These are their moments.</p>
            </div>
          </motion.div>

          {tripPhotos.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
              <div className="text-5xl mb-3">📷</div>
              <p className="font-bold">No trip photos yet</p>
              <p className="text-sm mt-1">Photos from quarterly trips will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tripPhotos.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <PlaceholderCard item={item} onClick={() => setLightbox({ section: "trips", item })} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2 — Annual Convention */}
        <section>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl shrink-0">🏅</div>
            <div>
              <h2 className="text-xl font-black text-foreground">Annual Made-Kids Convention & Top Honor Award</h2>
              <p className="text-sm text-muted-foreground">The MKC celebrates excellence — the grandest stage for Made-Kids.</p>
            </div>
          </motion.div>

          {conventionPhotos.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
              <div className="text-5xl mb-3">📷</div>
              <p className="font-bold">No convention photos yet</p>
              <p className="text-sm mt-1">Photos from the annual convention will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {conventionPhotos.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <PlaceholderCard item={item} onClick={() => setLightbox({ section: "convention", item })} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

      </div>

      {lightbox && (
        <Lightbox item={lightbox.item} onClose={() => setLightbox(null)} />
      )}
    </Layout>
  );
}
