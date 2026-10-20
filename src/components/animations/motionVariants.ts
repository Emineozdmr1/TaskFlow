import type { Variants } from "framer-motion";

// Kart listesini sırayla tetikleyen kapsayıcı (container)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

// Tekil kart animasyonu (aşağıdan hafifçe belirme + hover mikro ölçekleme)
export const cardVariant: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Hover / Tap mikro etkileşimleri
export const interactiveCardProps = {
  whileHover: { y: -3, transition: { duration: 0.15 } },
  whileTap: { scale: 0.98 },
};