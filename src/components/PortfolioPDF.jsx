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

// Registrando fontes padrão
Font.register({
  family: "Helvetica-Bold",
  src: "https://fonts.gstatic.com/s/helveticaneue/5.13.0/HelveticaNeue-Bold.ttf",
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 120,
    paddingHorizontal: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#F9FAFB",
    position: "relative",
  },

  // --- HEADER ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#A82020",
    paddingBottom: 10,
  },
  brandColumn: {
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 7,
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
    flex: 1,
  },

  // Hero (Imagem + Info)
  heroSection: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 15,
    height: 200,
  },
  imageContainer: {
    width: "40%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  infoContainer: {
    width: "60%",
    paddingLeft: 10,
    justifyContent: "flex-start",
  },
  categoryBadge: {
    backgroundColor: "#FEF2F2",
    color: "#A82020",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 7,
    textTransform: "uppercase",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 1,
  },
  subtitle: {
    fontSize: 9,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
  },
  description: {
    fontSize: 9,
    color: "#4B5563",
    lineHeight: 1.4,
    textAlign: "left",
    marginBottom: 10,
  },

  // Card de Vídeo
  videoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 4,
    padding: 6,
    marginTop: "auto",
  },
  videoTextGroup: {
    flexDirection: "column",
    marginLeft: 0,
  },
  videoLabel: {
    fontSize: 6,
    color: "#1D4ED8",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  videoLink: {
    fontSize: 8,
    color: "#2563EB",
    textDecoration: "none",
    fontFamily: "Helvetica-Bold",
  },

  // --- SPECS EM GRID ---
  separatorLine: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15,
  },
  specsHeader: {
    fontSize: 9,
    color: "#A82020",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  specItem: {
    width: "50%",
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 2,
    paddingRight: 15,
  },
  specLabel: {
    width: "40%",
    fontSize: 7,
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  specValue: {
    width: "60%",
    fontSize: 8,
    color: "#111827",
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },

  // --- OBSERVAÇÕES ---
  obsBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 4,
    marginBottom: 20,
  },
  obsTitle: {
    fontSize: 7,
    color: "#B45309",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 4,
  },
  obsText: {
    fontSize: 8,
    color: "#78350F",
    lineHeight: 1.3,
  },

  // --- FOOTER (Estilo Ficha Técnica) ---
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#A82020",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  footerLeft: {
    flexDirection: "column",
  },
  footerLabel: {
    color: "#FECACA",
    fontSize: 7,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  clientName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  footerRight: {
    alignItems: "flex-end",
  },
  priceValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  installmentsText: {
    color: "#FEE2E2",
    fontSize: 9,
    marginTop: 1,
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
              {/* Prioriza imagem Base64, depois URL, depois Texto */}
              {data.machine_image_base64 ? (
                <Image src={data.machine_image_base64} style={styles.image} />
              ) : m.photo_url ? (
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
            {[
              { l: "Tipo", v: m.type },
              { l: "Voltagem", v: m.voltage },
              { l: "Cor", v: m.color },
              { l: "Ambiente", v: m.environment_recommendation },
              { l: "Peso", v: m.weight },
              { l: "Dimensões", v: m.dimensions || "-" },
            ]
              // LOGICA CONDICIONAL: Abastecimento (Esconde para Coado E Moedor)
              .concat(
                m.type !== "Coado" && m.type !== "Moedor"
                  ? [{ l: "Abastecimento", v: m.water_system }]
                  : [],
              )
              // LOGICA CONDICIONAL: Tanque de água
              .concat(
                m.type !== "Coado" &&
                  m.type !== "Moedor" &&
                  m.water_system === "Reservatório"
                  ? [{ l: "Tanque Água", v: m.water_tank_size }]
                  : [],
              )
              // LOGICA CONDICIONAL: Reservatórios
              .concat(
                m.reservoir_count > 0 && m.type !== "Moedor"
                  ? [
                      { l: "Reservatórios", v: m.reservoir_count },
                      {
                        l: "Capacidade Extra",
                        v: m.extra_reservoir_capacity,
                      },
                    ]
                  : [],
              )
              // MOEDOR: Mostra Capacidade Cúpula
              .concat(
                m.type === "Moedor"
                  ? [
                      {
                        l: "Capacidade Cúpula",
                        v: m.extra_reservoir_capacity,
                      },
                    ]
                  : [],
              )
              .concat(
                m.type === "Profissional"
                  ? [
                      { l: "Grupos", v: m.extraction_cups },
                      { l: "Bicos Vapor", v: m.extraction_nozzles },
                    ]
                  : [],
              )
              .concat(
                m.type === "Multibebidas"
                  ? [
                      {
                        l: "Combinações",
                        v: m.drink_combinations,
                      },
                      { l: "Autonomia", v: m.dose_autonomy },
                    ]
                  : [],
              )
              .concat(
                m.type === "Snacks" || m.type === "Vending"
                  ? [
                      { l: "Bandejas", v: m.tray_count },
                      { l: "Seleções", v: m.selection_count },
                    ]
                  : [],
              )
              .concat(
                m.type === "Café em Grãos"
                  ? [
                      {
                        l: "Simultâneo",
                        v: m.simultaneous_dispenser ? "Sim" : "Não",
                      },
                      {
                        l: "Cap. Borras",
                        v: m.dregs_capacity,
                      },
                    ]
                  : [],
              )
              .concat(
                m.type === "Coado"
                  ? [
                      { l: "Capacidade", v: m.cups_capacity },
                      { l: "Filtro", v: m.filter_type },
                    ]
                  : [],
              )
              .concat([
                // LOGICA CONDICIONAL: Esgoto
                ...(m.type !== "Coado" && m.type !== "Moedor"
                  ? [{ l: "Esgoto", v: m.has_sewage ? "Sim" : "Não" }]
                  : []),
                { l: "Amperagem", v: m.amperage || "10A" },
              ])
              .map((item, i) =>
                item.v ? (
                  <View key={i} style={styles.specItem}>
                    <Text style={styles.specLabel}>{item.l}</Text>
                    <Text style={styles.specValue}>{item.v}</Text>
                  </View>
                ) : null,
              )}
          </View>

          {/* OBSERVAÇÕES */}
          {data.obs && (
            <View style={styles.obsBox} wrap={false}>
              <Text style={styles.obsTitle}>Observações Importantes</Text>
              <Text style={styles.obsText}>{data.obs}</Text>
            </View>
          )}
        </View>

        {/* FOOTER - Fixo no final */}
        <View style={styles.footer} fixed>
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
