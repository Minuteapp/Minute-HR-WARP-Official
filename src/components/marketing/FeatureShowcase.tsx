import { motion } from "framer-motion";
import { Clock, Calendar, CreditCard, Users, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Zeiterfassung",
    description: "Mobile Stempeluhr mit GPS, Projektzeiterfassung und automatische Überstundenberechnung.",
  },
  {
    icon: Calendar,
    title: "Urlaubsverwaltung",
    description: "Digitale Urlaubsanträge, Team-Kalender und automatische Vertretungsplanung.",
  },
  {
    icon: CreditCard,
    title: "Lohnabrechnung",
    description: "Automatisierte Gehaltsberechnung, DATEV-Export und digitale Lohnabrechnungen.",
  },
  {
    icon: Users,
    title: "Mitarbeiterverwaltung",
    description: "Digitale Personalakte, Organigramm und zentrale Stammdatenverwaltung.",
  },
  {
    icon: BarChart3,
    title: "HR Analytics",
    description: "Echtzeit-Dashboards, individuelle Reports und datenbasierte Entscheidungen.",
  },
  {
    icon: Shield,
    title: "DSGVO-konform",
    description: "Höchste Sicherheitsstandards, deutsche Server und vollständige Compliance.",
  },
];

export const FeatureShowcase = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Alles, was modernes HR braucht
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Eine Plattform für alle HR-Prozesse – von der Zeiterfassung bis zur Lohnabrechnung.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
