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
  header: {
    padding: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#A82020",
  },
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

  // Hero (Imagem + Título) - Mudei para flex-col para evitar empurrar texto
  heroContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },

  // Imagem MAIOR (Aumentei width de 45% para 50% e altura fixa maior)
  heroImageContainer: {
    width: "50%",
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 20,
  },
  heroImage: { width: "100%", height: "100%", objectFit: "contain" },

  heroContent: { width: "50%", justifyContent: "flex-start" }, // Garante que começa do topo
  machineTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  machineSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    textTransform: "uppercase",
  },

  // Descrição com wrap para não quebrar layout
  description: {
    fontSize: 11,
    color: "#444",
    lineHeight: 1.6,
    textAlign: "justify",
  },

  // Specs
  specsContainer: {
    marginTop: 20,
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

  // Footer VERMELHO (#A82020)
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "#A82020", // <--- MUDANÇA DE COR
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },

  clientBox: { justifyContent: "center" },
  labelSmall: {
    color: "#ffcccc",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  clientName: { color: "white", fontSize: 16, fontWeight: "bold" },
  negotiationTag: { color: "#fca5a5", fontSize: 10, marginTop: 2 },

  priceBox: { alignItems: "flex-end" },
  priceLabel: {
    color: "#ffcccc",
    fontSize: 9,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  totalValue: { color: "#ffffff", fontSize: 32, fontWeight: "bold" }, // Branco no fundo vermelho
  installments: { color: "#ffe4e6", fontSize: 11, marginTop: 2 },
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
        {/* Header */}
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

        {/* Footer Vermelho */}
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
