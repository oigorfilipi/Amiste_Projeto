import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 0, fontFamily: "Helvetica", backgroundColor: "#fff" },

  // Header
  header: { padding: 30, borderBottomWidth: 2, borderBottomColor: "#A82020" },
  brandTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textTransform: "uppercase",
  },
  brandSub: {
    fontSize: 10,
    color: "#A82020",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Corpo
  body: { padding: 30, flex: 1 },

  // Hero (Imagem + Título)
  heroContainer: { flexDirection: "row", marginBottom: 20, height: 200 },
  heroImageContainer: {
    width: "45%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  heroImage: { width: "90%", height: "90%", objectFit: "contain" },

  heroContent: { width: "55%", paddingLeft: 20, justifyContent: "center" },
  machineTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  machineSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 10,
    color: "#444",
    lineHeight: 1.5,
    textAlign: "justify",
  },

  // Specs
  specsContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  specsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#A82020",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  specRow: {
    flexDirection: "row",
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 2,
  },
  specLabel: { fontSize: 9, width: 80, fontWeight: "bold", color: "#475569" },
  specValue: { fontSize: 9, color: "#1e293b", flex: 1 },

  // Footer Financeiro (O estilo Dark que você gostou)
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },

  clientBox: { justifyContent: "center" },
  labelSmall: {
    color: "#A82020",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  clientName: { color: "white", fontSize: 14, fontWeight: "bold" },
  negotiationTag: { color: "#9ca3af", fontSize: 10, marginTop: 2 },

  priceBox: { alignItems: "flex-end" },
  priceLabel: {
    color: "#6b7280",
    fontSize: 9,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  totalValue: { color: "#4ade80", fontSize: 28, fontWeight: "bold" }, // Verde Neon
  installments: { color: "white", fontSize: 10, marginTop: 2 },
});

const formatMoney = (val) =>
  val
    ? `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
    : "R$ 0,00";

export function PortfolioPDF({ data }) {
  if (!data || !data.machine_data)
    return (
      <Document>
        <Page>
          <Text>Carregando...</Text>
        </Page>
      </Document>
    );
  const m = data.machine_data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Clean */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>AMISTE CAFÉ</Text>
          <Text style={styles.brandSub}>Proposta Comercial</Text>
        </View>

        <View style={styles.body}>
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <View style={styles.heroImageContainer}>
              {m.photo_url ? (
                <Image src={m.photo_url} style={styles.heroImage} />
              ) : (
                <Text>Sem Imagem</Text>
              )}
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.machineTitle}>{m.name}</Text>
              <Text style={styles.machineSubtitle}>
                {m.brand} | {m.model}
              </Text>
              <Text style={styles.description}>{data.description}</Text>
            </View>
          </View>

          {/* Specs Técnicas */}
          <View style={styles.specsContainer}>
            <Text style={styles.specsTitle}>Especificações Técnicas</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Categoria:</Text>
              <Text style={styles.specValue}>{m.type}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Voltagem:</Text>
              <Text style={styles.specValue}>{m.voltage}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Dimensões:</Text>
              <Text style={styles.specValue}>{m.dimensions || "-"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Reservatórios:</Text>
              <Text style={styles.specValue}>{m.reservoirs || "-"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Hídrica:</Text>
              <Text style={styles.specValue}>{m.water_system}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Cor:</Text>
              <Text style={styles.specValue}>{m.color}</Text>
            </View>
          </View>
        </View>

        {/* Footer Dark */}
        <View style={styles.footer}>
          <View style={styles.clientBox}>
            <Text style={styles.labelSmall}>Proposta preparada para</Text>
            <Text style={styles.clientName}>
              {data.customer_name || "Cliente"}
            </Text>
            <Text style={styles.negotiationTag}>
              Modalidade: {data.negotiation_type}
            </Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Investimento Total</Text>
            <Text style={styles.totalValue}>
              {formatMoney(data.total_value)}
            </Text>
            {data.installments > 1 && (
              <Text style={styles.installments}>
                {data.installments}x de {formatMoney(data.installment_value)}
              </Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
