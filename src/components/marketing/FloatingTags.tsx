import { motion } from "framer-motion";

const tags = [
  { text: "Zeiterfassung", x: "10%", y: "20%" },
  { text: "Urlaubsverwaltung", x: "75%", y: "15%" },
  { text: "Lohnabrechnung", x: "85%", y: "45%" },
  { text: "Recruiting", x: "5%", y: "60%" },
  { text: "Onboarding", x: "70%", y: "75%" },
  { text: "Analytics", x: "15%", y: "80%" },
];

export const FloatingTags = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {tags.map((tag, index) => (
        <motion.div
          key={tag.text}
          className="absolute bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-primary shadow-lg border border-primary/10"
          style={{ left: tag.x, top: tag.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: index * 0.1 + 0.5,
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          {tag.text}
        </motion.div>
      ))}
    </div>
  );
};
