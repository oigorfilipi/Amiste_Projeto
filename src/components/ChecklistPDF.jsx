import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Estilos do PDF (Parece CSS, mas é limitado)
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#A82020" },
  section: {
    marginBottom: 10,
    padding: 10,
    border: "1pt solid #eee",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
    backgroundColor: "#f9f9f9",
    padding: 4,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { fontWeight: "bold", width: 100, color: "#666" },
  value: { flex: 1 },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: { margin: "auto", marginTop: 5, fontSize: 9 },
  signatureBox: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
    textAlign: "center",
    fontSize: 8,
  },
});

// Funções Auxiliares
const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("pt-BR") : "-";
const formatBool = (val) =>
  val === true ? "Sim" : val === false ? "Não" : val;

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
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AMISTE CAFÉ</Text>
            <Text style={{ fontSize: 8, color: "#666" }}>
              Sistema de Gestão Integrado
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              Checklist #{data.id}
            </Text>
            <Text>{formatDate(data.created_at)}</Text>
          </View>
        </View>

        {/* 1. DADOS DO CLIENTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. Dados da Instalação ({data.install_type})
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente/Evento:</Text>
            <Text style={styles.value}>
              {data.client_name || data.event_name}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data Instalação:</Text>
            <Text style={styles.value}>{formatDate(data.install_date)}</Text>
            {data.install_type === "Evento" && (
              <>
                <Text style={styles.label}>Retirada:</Text>
                <Text style={styles.value}>
                  {formatDate(data.pickup_date)} ({data.event_days} dias)
                </Text>
              </>
            )}
          </View>
        </View>

        {/* 2. DADOS DA MÁQUINA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Equipamento ({data.quantity} un)
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Modelo:</Text>
            <Text style={styles.value}>{data.machine_name}</Text>
          </View>

          {/* Configs Técnicas */}
          <View
            style={{
              flexDirection: "row",
              marginTop: 5,
              marginBottom: 10,
              backgroundColor: "#f0f0f0",
              padding: 5,
            }}
          >
            <Text style={{ width: "25%" }}>Hídrica: {data.tech_water}</Text>
            <Text style={{ width: "25%" }}>Esgoto: {data.tech_sewage}</Text>
            <Text style={{ width: "25%" }}>Vapor: {data.tech_steam}</Text>
            <Text style={{ width: "25%" }}>Pgto: {data.tech_payment}</Text>
          </View>

          {/* Tabela de Séries */}
          <View>
            <Text style={{ fontSize: 8, marginBottom: 2, color: "#666" }}>
              Identificação das Unidades:
            </Text>
            {data.machine_units?.map((u, i) => (
              <Text key={i} style={{ fontSize: 9, marginBottom: 2 }}>
                {i + 1}. Voltagem: {u.voltage} | Série: {u.serial || "N/A"} |
                Patr: {u.patrimony || "N/A"}
              </Text>
            ))}
          </View>
        </View>

        {/* 3. ITENS E PREPARATIVOS */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* Coluna Esquerda */}
          <View style={{ flex: 1, border: "1pt solid #eee", padding: 5 }}>
            <Text style={{ fontWeight: "bold", fontSize: 10, marginBottom: 4 }}>
              Aparatos & Acessórios
            </Text>
            <Text style={{ fontSize: 9, color: "#444", lineHeight: 1.5 }}>
              {/* Junta as chaves dos objetos tools e accessories */}
              {[
                ...Object.keys(data.tools_list || {}).filter(
                  (k) => data.tools_list[k] === true,
                ),
                ...Object.keys(data.accessories_list || {}),
              ]
                .map((k) => k.replace(/([A-Z])/g, " $1"))
                .join(", ")}
            </Text>
          </View>
          {/* Coluna Direita */}
          <View style={{ flex: 1, border: "1pt solid #eee", padding: 5 }}>
            <Text style={{ fontWeight: "bold", fontSize: 10, marginBottom: 4 }}>
              Bebidas & Insumos
            </Text>
            <Text style={{ fontSize: 9, color: "#444", lineHeight: 1.5 }}>
              {[
                ...Object.keys(data.drinks_list?.standard || {}),
                ...(data.drinks_list?.custom || []).map((d) => d.name),
                ...Object.keys(data.supplies_list || {}),
              ].join(", ")}
            </Text>
          </View>
        </View>

        {/* 4. VALIDAÇÃO E OBS */}
        <View style={{ marginTop: 10, border: "1pt solid #eee", padding: 5 }}>
          <Text style={{ fontWeight: "bold", fontSize: 10 }}>
            Observações / Validação Local
          </Text>
          <Text style={{ fontSize: 9, marginTop: 2 }}>
            Local: Tomada {data.local_validation?.localSocket} | Água:{" "}
            {data.local_validation?.localWater}
          </Text>
          <Text style={{ fontSize: 9, marginTop: 2, fontStyle: "italic" }}>
            Obs Venda: {data.sales_obs || "Nenhuma."}
          </Text>
          <Text style={{ fontSize: 9, marginTop: 2 }}>
            Contrato Nº: {data.contract_num}
          </Text>
        </View>

        {/* 5. ASSINATURAS */}
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine}>
            <Text>Técnico Responsável</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>Cliente ({data.client_name || data.event_name})</Text>
          </View>
        </View>

        {/* Rodapé */}
        <Text
          style={{
            position: "absolute",
            bottom: 30,
            left: 30,
            right: 30,
            fontSize: 8,
            textAlign: "center",
            color: "#999",
          }}
        >
          Gerado pelo Sistema Amiste em {new Date().toLocaleString("pt-BR")}
        </Text>
      </Page>
    </Document>
  );
}
