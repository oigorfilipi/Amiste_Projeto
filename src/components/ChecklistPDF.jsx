import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Registrando fonte para garantir negrito real
Font.register({
  family: "Helvetica-Bold",
  src: "https://fonts.gstatic.com/s/helveticaneue/5.13.0/HelveticaNeue-Bold.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
    color: "#1F2937",
  },

  // --- HEADER ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: "#A82020",
  },
  brandTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#111",
    textTransform: "uppercase",
  },
  brandSub: {
    fontSize: 8,
    color: "#A82020",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 2,
  },
  metaBox: {
    alignItems: "flex-end",
  },
  metaTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1F2937",
  },
  metaDate: {
    fontSize: 9,
    color: "#6B7280",
  },

  // --- CORPO ---
  body: {
    padding: 30,
  },

  // Seções
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#A82020",
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111",
    textTransform: "uppercase",
  },

  // Grids de Informação
  row: {
    flexDirection: "row",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  col2: { width: "50%" },
  col3: { width: "33.33%" },
  col4: { width: "25%" },

  label: {
    fontSize: 8,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  value: {
    fontSize: 10,
    color: "#111",
  },

  // Cards de Status (Sim/Não)
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  statusCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 6,
    width: "23%",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 7,
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  statusValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },

  // Tabela de Unidades
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 4,
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 4,
  },
  th: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#4B5563" },
  td: { fontSize: 9, color: "#1F2937" },

  // Listas (Bebidas/Insumos)
  listBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 8,
    minHeight: 40,
  },
  listText: {
    fontSize: 8,
    color: "#374151",
    lineHeight: 1.5,
  },

  // Assinaturas
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  signatureBox: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 8,
    alignItems: "center",
  },
  signatureText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  signatureSub: {
    fontSize: 8,
    color: "#6B7280",
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
  },
});

// --- HELPERS PARA TRATAR DADOS ---

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("pt-BR") : "-";

// Formata lista de insumos complexa (Standard + Custom)
const formatSupplies = (data) => {
  const items = [];

  // 1. Standard (Categorias)
  if (data.supplies_list?.standard) {
    const std = data.supplies_list.standard;
    Object.keys(std).forEach((category) => {
      Object.keys(std[category]).forEach((itemKey) => {
        const item = std[category][itemKey];
        if (item.active) {
          items.push(`${itemKey}${item.qty ? ` (${item.qty})` : ""}`);
        }
      });
    });
  }

  // 2. Custom
  if (data.supplies_list?.custom && Array.isArray(data.supplies_list.custom)) {
    data.supplies_list.custom.forEach((item) => items.push(item));
  }

  return items.length > 0 ? items.join(", ") : "Nenhum selecionado.";
};

// Formata lista de bebidas
const formatDrinks = (data) => {
  const items = [];
  if (data.drinks_list?.standard) {
    Object.entries(data.drinks_list.standard).forEach(([name, ml]) => {
      items.push(`${name} ${ml ? `(${ml}ml)` : ""}`);
    });
  }
  return items.length > 0 ? items.join(", ") : "Nenhuma selecionada.";
};

// Formata lista de ferramentas
const formatTools = (data) => {
  const items = [];
  const tools = data.tools_list || {};
  const accs = data.accessories_list?.standard || {};

  // Ferramentas booleanas
  Object.keys(tools).forEach((key) => {
    if (key !== "gallonQty" && tools[key] === true) {
      items.push(
        key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
      );
    }
  });
  // Galão
  if (tools.gallonQty) items.push(`Galão (${tools.gallonQty})`);

  // Acessórios com qtd
  Object.entries(accs).forEach(([name, qty]) => {
    items.push(`${name}${qty && qty !== "1" ? ` (${qty})` : ""}`);
  });

  return items.length > 0 ? items.join(", ") : "Nenhum item.";
};

export function ChecklistPDF({ data }) {
  if (!data)
    return (
      <Document>
        <Page>
          <Text>Sem dados</Text>
        </Page>
      </Document>
    );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>AMISTE CAFÉ</Text>
            <Text style={styles.brandSub}>Ordem de Serviço / Instalação</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaTitle}>Checklist #{data.id}</Text>
            <Text style={styles.metaDate}>
              Emitido em: {formatDate(data.created_at)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* 1. DADOS GERAIS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                1. Dados da Instalação ({data.install_type})
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.col2}>
                <Text style={styles.label}>Cliente / Evento</Text>
                <Text style={styles.value}>
                  {data.client_name || data.event_name}
                </Text>
              </View>
              <View style={styles.col2}>
                <Text style={styles.label}>Data Instalação</Text>
                <Text style={styles.value}>
                  {formatDate(data.install_date)}
                </Text>
              </View>
            </View>
            {data.install_type === "Evento" && (
              <View style={styles.row}>
                <View style={styles.col2}>
                  <Text style={styles.label}>Dias de Evento</Text>
                  <Text style={styles.value}>{data.event_days} dias</Text>
                </View>
                <View style={styles.col2}>
                  <Text style={styles.label}>Data Retirada</Text>
                  <Text style={styles.value}>
                    {formatDate(data.pickup_date)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* 2. EQUIPAMENTO */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                2. Equipamento ({data.quantity} un)
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.col2}>
                <Text style={styles.label}>Modelo da Máquina</Text>
                <Text style={styles.value}>{data.machine_name}</Text>
              </View>
            </View>

            {/* Grid de Status Técnico */}
            <View style={styles.statusRow}>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Rede Hídrica</Text>
                <Text style={styles.statusValue}>{data.tech_water}</Text>
              </View>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Esgoto</Text>
                <Text style={styles.statusValue}>{data.tech_sewage}</Text>
              </View>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Vapor</Text>
                <Text style={styles.statusValue}>{data.tech_steam}</Text>
              </View>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Pagamento</Text>
                <Text style={styles.statusValue}>{data.tech_payment}</Text>
              </View>
            </View>

            {/* Tabela de Unidades */}
            <View style={{ marginTop: 10 }}>
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  marginBottom: 2,
                }}
              >
                IDENTIFICAÇÃO DAS UNIDADES:
              </Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { width: "10%" }]}>#</Text>
                <Text style={[styles.th, { width: "30%" }]}>Voltagem</Text>
                <Text style={[styles.th, { width: "30%" }]}>Nº Série</Text>
                <Text style={[styles.th, { width: "30%" }]}>Patrimônio</Text>
              </View>
              {data.machine_units?.map((u, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.td, { width: "10%" }]}>{i + 1}</Text>
                  <Text style={[styles.td, { width: "30%" }]}>{u.voltage}</Text>
                  <Text style={[styles.td, { width: "30%" }]}>
                    {u.serial || "-"}
                  </Text>
                  <Text style={[styles.td, { width: "30%" }]}>
                    {u.patrimony || "-"}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 3. INSUMOS E FERRAMENTAS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>3. Preparação e Insumos</Text>
            </View>

            <View style={styles.row}>
              {/* Coluna 1: Ferramentas */}
              <View style={[styles.col2, { paddingRight: 5 }]}>
                <Text style={styles.label}>Aparatos & Acessórios</Text>
                <View style={styles.listBox}>
                  <Text style={styles.listText}>{formatTools(data)}</Text>
                </View>
              </View>

              {/* Coluna 2: Insumos */}
              <View style={[styles.col2, { paddingLeft: 5 }]}>
                <Text style={styles.label}>Bebidas & Insumos Habilitados</Text>
                <View style={styles.listBox}>
                  <Text style={styles.listText}>
                    <Text style={{ fontFamily: "Helvetica-Bold" }}>
                      Bebidas:{" "}
                    </Text>
                    {formatDrinks(data)}
                    {"\n\n"}
                    <Text style={{ fontFamily: "Helvetica-Bold" }}>
                      Insumos:{" "}
                    </Text>
                    {formatSupplies(data)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 4. VALIDAÇÃO LOCAL */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                4. Validação do Local e Observações
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.col3}>
                <Text style={styles.label}>Tomada Local</Text>
                <Text style={styles.value}>
                  {data.local_validation?.localSocket || "N/A"}
                </Text>
              </View>
              <View style={styles.col3}>
                <Text style={styles.label}>Ponto de Água</Text>
                <Text style={styles.value}>
                  {data.local_validation?.localWater || "N/A"}
                </Text>
              </View>
              <View style={styles.col3}>
                <Text style={styles.label}>Treinamento</Text>
                <Text style={styles.value}>
                  {data.local_validation?.trainedPeople || "0"} pessoas
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Observações de Venda</Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#eee",
                  padding: 6,
                  minHeight: 30,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 9 }}>
                  {data.sales_obs || "Nenhuma observação registrada."}
                </Text>
              </View>
            </View>
          </View>

          {/* 5. ASSINATURAS */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureText}>Técnico Responsável</Text>
              <Text style={styles.signatureSub}>Amiste Café</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureText}>
                {data.client_name || "Cliente Responsável"}
              </Text>
              <Text style={styles.signatureSub}>Assinatura do Cliente</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Documento gerado eletronicamente pelo Sistema Amiste •{" "}
          {new Date().getFullYear()}
        </Text>
      </Page>
    </Document>
  );
}
