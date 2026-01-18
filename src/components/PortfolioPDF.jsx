import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Estilos
const styles = StyleSheet.create({
  page: { padding: 0, fontFamily: "Helvetica" },
  header: {
    backgroundColor: "#A82020",
    height: 80,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: { color: "white", fontSize: 24, fontWeight: "bold" },
  subHeader: { color: "#ffcccc", fontSize: 10 },

  body: { padding: 40 },

  heroSection: { flexDirection: "row", marginBottom: 30, gap: 20 },
  heroImage: {
    width: 200,
    height: 200,
    objectFit: "contain",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  heroContent: { flex: 1 },

  machineTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  machineSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 10,
    color: "#555",
    lineHeight: 1.5,
    textAlign: "justify",
  },

  specsBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  specsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#A82020",
  },
  specRow: {
    flexDirection: "row",
    marginBottom: 5,
    borderBottom: "1pt solid #ddd",
    paddingBottom: 2,
  },
  specLabel: { fontSize: 9, width: 100, fontWeight: "bold", color: "#444" },
  specValue: { fontSize: 9, color: "#333" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "#222",
    padding: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceBox: { alignItems: "flex-end" },
  priceLabel: { color: "#aaa", fontSize: 10, marginBottom: 4 },
  priceValue: { color: "#4ade80", fontSize: 32, fontWeight: "bold" },
  installments: { color: "white", fontSize: 12 },

  clientBox: { justifyContent: "center" },
  clientLabel: {
    color: "#A82020",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  clientName: { color: "white", fontSize: 16 },
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
        {/* TOPO VERMELHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerText}>AMISTE CAFÉ</Text>
            <Text style={styles.subHeader}>Proposta Comercial</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* HERO: FOTO E TEXTO */}
          <View style={styles.heroSection}>
            {m.photo_url ? (
              <Image src={m.photo_url} style={styles.heroImage} />
            ) : (
              <View
                style={[
                  styles.heroImage,
                  { justifyContent: "center", alignItems: "center" },
                ]}
              >
                <Text>Sem Foto</Text>
              </View>
            )}
            <View style={styles.heroContent}>
              <Text style={styles.machineTitle}>{m.name}</Text>
              <Text style={styles.machineSubtitle}>
                {m.brand} | {m.model}
              </Text>
              <Text style={styles.description}>
                {data.description ||
                  "Equipamento de alta performance, ideal para seu estabelecimento. Design moderno e extração perfeita de café expresso e bebidas quentes."}
              </Text>
            </View>
          </View>

          {/* TABELA TÉCNICA */}
          <View style={styles.specsBox}>
            <Text style={styles.specsTitle}>Especificações Técnicas</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Tipo:</Text>
              <Text style={styles.specValue}>{m.type}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Voltagem:</Text>
              <Text style={styles.specValue}>{m.voltage}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Reservatórios:</Text>
              <Text style={styles.specValue}>{m.reservoirs || "-"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Dimensões:</Text>
              <Text style={styles.specValue}>{m.dimensions || "-"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Cor:</Text>
              <Text style={styles.specValue}>{m.color}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Hídrica:</Text>
              <Text style={styles.specValue}>{m.water_system}</Text>
            </View>
          </View>
        </View>

        {/* RODAPÉ FINANCEIRO (PRETO) */}
        <View style={styles.footer}>
          <View style={styles.clientBox}>
            <Text style={styles.clientLabel}>Proposta para:</Text>
            <Text style={styles.clientName}>
              {data.customer_name || "Cliente"}
            </Text>
            <Text style={{ color: "#ccc", fontSize: 10, marginTop: 5 }}>
              Modalidade: {data.negotiation_type}
            </Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Investimento Total</Text>
            <Text style={styles.priceValue}>
              {formatMoney(data.total_value)}
            </Text>
            {data.installments > 1 && (
              <Text style={styles.installments}>
                ou {data.installments}x de {formatMoney(data.installment_value)}
              </Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
