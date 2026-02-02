import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Link,
  Font,
} from "@react-pdf/renderer";

// Registrando fontes padrão (opcional, mas garante consistência)
Font.register({
  family: "Helvetica-Bold",
  src: "https://fonts.gstatic.com/s/helveticaneue/5.13.0/HelveticaNeue-Bold.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    backgroundColor: "#F9FAFB", // Fundo levemente cinza (papel premium)
  },

  // --- HEADER ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "#A82020", // Amiste Primary
  },
  brandColumn: {
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 8,
    color: "#A82020",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginTop: 2,
    letterSpacing: 2,
  },
  dateText: {
    fontSize: 8,
    color: "#9CA3AF",
  },

  // --- CORPO ---
  body: {
    padding: 40,
    flex: 1,
  },

  // Hero (Imagem + Info)
  heroSection: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 20,
  },
  imageContainer: {
    width: "45%",
    height: 250,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  infoContainer: {
    width: "55%",
    paddingLeft: 20,
    justifyContent: "center",
  },
  categoryBadge: {
    backgroundColor: "#FEF2F2",
    color: "#A82020",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    textTransform: "uppercase",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 1,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 15,
    fontFamily: "Helvetica-Bold",
  },
  description: {
    fontSize: 10,
    color: "#4B5563",
    lineHeight: 1.6,
    textAlign: "left",
    marginBottom: 15,
  },

  // Card de Vídeo
  videoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF", // Azul bem claro
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  videoTextGroup: {
    flexDirection: "column",
    marginLeft: 0,
  },
  videoLabel: {
    fontSize: 7,
    color: "#1D4ED8",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  videoLink: {
    fontSize: 9,
    color: "#2563EB",
    textDecoration: "none",
    fontFamily: "Helvetica-Bold",
  },

  // --- SPECS EM GRID ---
  separatorLine: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  specsHeader: {
    fontSize: 10,
    color: "#A82020",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 15,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specItem: {
    width: "50%", // 2 Colunas
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  specLabel: {
    width: "35%",
    fontSize: 8,
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  specValue: {
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica-Bold",
  },

  // --- OBSERVAÇÕES ---
  obsBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FFFBEB", // Fundo amarelado suave
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 6,
  },
  obsTitle: {
    fontSize: 8,
    color: "#B45309",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 5,
  },
  obsText: {
    fontSize: 9,
    color: "#78350F",
    lineHeight: 1.4,
  },

  // --- FOOTER (Estilo Ficha Técnica) ---
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#A82020",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  footerLeft: {
    flexDirection: "column",
  },
  footerLabel: {
    color: "#FECACA", // Vermelho claro
    fontSize: 8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  clientName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  footerRight: {
    alignItems: "flex-end",
  },
  priceValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
  },
  installmentsText: {
    color: "#FEE2E2",
    fontSize: 10,
    marginTop: 2,
  },
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
          <Text>Carregando dados...</Text>
        </Page>
      </Document>
    );

  const m = data.machine_data;
  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandColumn}>
            <Text style={styles.brandTitle}>AMISTE CAFÉ</Text>
            <Text style={styles.brandSub}>Soluções em Café Corporativo</Text>
          </View>
          <Text style={styles.dateText}>{today}</Text>
        </View>

        {/* CORPO */}
        <View style={styles.body}>
          {/* HERO SECTION */}
          <View style={styles.heroSection}>
            <View style={styles.imageContainer}>
              {m.photo_url ? (
                <Image src={m.photo_url} style={styles.image} />
              ) : (
                <Text style={{ fontSize: 10, color: "#999" }}>Sem Foto</Text>
              )}
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.categoryBadge}>
                {data.negotiation_type || "Proposta"}
              </Text>
              <Text style={styles.title}>{m.name}</Text>
              <Text style={styles.subtitle}>
                {m.brand} • {m.model}
              </Text>

              <Text style={styles.description}>{data.description}</Text>

              {/* VIDEO LINK */}
              {data.video_url && (
                <View style={styles.videoCard}>
                  <View style={styles.videoTextGroup}>
                    <Text style={styles.videoLabel}>Vídeo de Apresentação</Text>
                    <Link src={data.video_url} style={styles.videoLink}>
                      {data.video_url}
                    </Link>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* DIVISOR */}
          <View style={styles.separatorLine} />

          {/* SPECS GRID */}
          <Text style={styles.specsHeader}>Especificações Técnicas</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Categoria</Text>
              <Text style={styles.specValue}>{m.type}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Dimensões</Text>
              <Text style={styles.specValue}>{m.dimensions || "-"}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Voltagem</Text>
              <Text style={styles.specValue}>{m.voltage}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Reservatórios</Text>
              <Text style={styles.specValue}>{m.reservoir_count || 0}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Cor</Text>
              <Text style={styles.specValue}>{m.color}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Hídrica</Text>
              <Text style={styles.specValue}>{m.water_system}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Vaporizador</Text>
              <Text style={styles.specValue}>{m.has_steamer || "Não"}</Text>
            </View>

            {/* NOVO: Campo Esgoto */}
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Esgoto</Text>
              <Text style={styles.specValue}>
                {m.has_sewage ? "Sim" : "Não"}
              </Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Amperagem</Text>
              <Text style={styles.specValue}>{m.amperage || "10A"}</Text>
            </View>
          </View>

          {/* NOVO: Campo Observações */}
          {data.obs && (
            <View style={styles.obsBox}>
              <Text style={styles.obsTitle}>Observações Importantes</Text>
              <Text style={styles.obsText}>{data.obs}</Text>
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLabel}>Proposta preparada para</Text>
            <Text style={styles.clientName}>
              {data.customer_name || "Cliente"}
            </Text>
          </View>

          <View style={styles.footerRight}>
            <Text style={styles.footerLabel}>Investimento Total</Text>
            <Text style={styles.priceValue}>
              {formatMoney(data.total_value)}
            </Text>
            {data.installments > 1 && (
              <Text style={styles.installmentsText}>
                {data.installments}x de {formatMoney(data.installment_value)}
              </Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
