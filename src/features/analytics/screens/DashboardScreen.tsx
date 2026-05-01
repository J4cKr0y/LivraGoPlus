// src/features/analytics/screens/DashboardScreen.tsx
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const DashboardCard = ({ title, value, subValue, trend }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    <View style={styles.trendRow}>
      <Text style={{ color: trend >= 0 ? 'green' : 'red' }}>
        {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
      </Text>
      <Text style={styles.subValue}> vs période précédente</Text>
    </View>
  </View>
);

export const DashboardScreen = () => {
  const stats = useQuery(api.stats.getPeriodStats, { userId: "user_123", period: "week" });
  const fuelPrice = 1.85; // À récupérer via notre action Convex fuel.ts

  if (!stats) return <ActivityIndicator />;

  const savedMoney = stats.currentKm * 0.1 * fuelPrice;
  const trend = stats.previousKm > 0 
    ? ((stats.currentKm - stats.previousKm) / stats.previousKm) * 100 
    : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tableau de Bord</Text>
      
      <View style={styles.grid}>
        <DashboardCard 
          title="Km Économisés" 
          value={`${stats.currentKm.toFixed(1)} km`} 
          trend={trend.toFixed(0)} 
        />
        <DashboardCard 
          title="Économie Essence" 
          value={`${savedMoney.toFixed(2)} €`} 
          trend={trend.toFixed(0)} 
        />
        <DashboardCard 
          title="Clients Livrés" 
          value={stats.customerCount} 
          trend={0} 
        />
      </View>
      
      {/* Petit rappel écologique pour le moral du chauffeur */}
      <View style={styles.ecoBanner}>
        <Text style={styles.ecoText}>
          🌿 Vous avez évité l'émission de {(stats.currentKm * 0.265).toFixed(1)}kg de CO2.
        </Text>
      </View>
    </ScrollView>
  );
};
