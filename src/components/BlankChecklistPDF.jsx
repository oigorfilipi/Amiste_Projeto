import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Registrando fonte
Font.register({
  family: "Helvetica-Bold",
  src: "https://fonts.gstatic.com/s/helveticaneue/5.13.0/HelveticaNeue-Bold.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1F2937",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#A82020",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  subTitle: {
    fontSize: 8,
    color: "#A82020",
    textTransform: "uppercase",
    letterSpacing: 2,
  },

  // Caixas de Input Manual
  section: { marginBottom: 15 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#F3F4F6",
    padding: 4,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#A82020",
  },

  inputRow: { flexDirection: "row", marginBottom: 8, gap: 10 },
  inputGroup: { flex: 1 },
  label: {
    fontSize: 7,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  inputBox: {
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    height: 18,
    backgroundColor: "#F9FAFB",
  },

  // Linhas de Observação
  obsLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    height: 24,
    marginBottom: 4,
  },

  // Checkboxes Manuais
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  square: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 5,
  },

  // Tabela Vazia
  table: { marginTop: 5, borderWidth: 1, borderColor: "#E5E7EB" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    height: 20,
    alignItems: "center",
  },
  tableHeader: { backgroundColor: "#F3F4F6", fontFamily: "Helvetica-Bold" },
  col1: {
    width: "10%",
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#E5E7EB",
  },
  col: {
    flex: 1,
    paddingLeft: 4,
    borderRightWidth: 1,
    borderColor: "#E5E7EB",
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
  },
});

export function BlankChecklistPDF({ type, machineData, quantity }) {
  // Gera linhas vazias para a tabela
  const rows = Array.from({ length: Math.max(quantity, 3) }, (_, i) => i + 1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Ordem de Serviço Manual</Text>
            <Text style={styles.subTitle}>
              Amiste Café • Checklist de Instalação
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9 }}>Data: ____/____/_______</Text>
            <Text style={{ fontSize: 9, marginTop: 4 }}>
              Técnico: _______________________
            </Text>
          </View>
        </View>

        {/* 1. DADOS DO CLIENTE/EVENTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. Dados da Instalação ({type})
          </Text>

          {type === "Cliente" ? (
            <>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={styles.label}>Razão Social / Nome Fantasia</Text>
                  <View style={styles.inputBox} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CNPJ / CPF</Text>
                  <View style={styles.inputBox} />
                </View>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Endereço Completo</Text>
                  <View style={styles.inputBox} />
                </View>
                <View style={[styles.inputGroup, { flex: 0.5 }]}>
                  <Text style={styles.label}>Nº Contrato</Text>
                  <View style={styles.inputBox} />
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={styles.label}>Nome do Evento</Text>
                  <View style={styles.inputBox} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Local do Evento</Text>
                  <View style={styles.inputBox} />
                </View>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Responsável no Local</Text>
                  <View style={styles.inputBox} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Data Retirada</Text>
                  <View style={styles.inputBox} />
                </View>
                <View style={[styles.inputGroup, { flex: 0.5 }]}>
                  <Text style={styles.label}>Dias</Text>
                  <View style={styles.inputBox} />
                </View>
              </View>
            </>
          )}
        </View>

        {/* 2. EQUIPAMENTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Equipamento e Identificação
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modelo da Máquina</Text>
              {/* Se a máquina foi pré-selecionada, preenche, senão deixa linha */}
              {machineData ? (
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Helvetica-Bold",
                    marginTop: 4,
                  }}
                >
                  {machineData.name}
                </Text>
              ) : (
                <View style={styles.inputBox} />
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Voltagem</Text>
              {machineData ? (
                <Text style={{ fontSize: 10 }}>{machineData.voltage}</Text>
              ) : (
                <View style={styles.inputBox} />
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Potência/Amperagem</Text>
              {machineData ? (
                <Text style={{ fontSize: 10 }}>{machineData.amperage}</Text>
              ) : (
                <View style={styles.inputBox} />
              )}
            </View>
          </View>

          {/* Tabela de Números de Série */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.col1}>#</Text>
              <Text style={styles.col}>Nº Série</Text>
              <Text style={styles.col}>Patrimônio</Text>
              <Text style={styles.col}>Leitura Contador (Tiragem)</Text>
            </View>
            {rows.map((r) => (
              <View key={r} style={styles.tableRow}>
                <Text style={styles.col1}>{r}</Text>
                <Text style={styles.col}></Text>
                <Text style={styles.col}></Text>
                <Text style={styles.col}></Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. CHECKLIST TÉCNICO (Checkboxes) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Validação Técnica no Local</Text>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <View style={{ width: "45%" }}>
              <Text style={[styles.label, { marginBottom: 5 }]}>CONEXÕES:</Text>
              <View style={styles.checkboxRow}>
                <View style={styles.square} />
                <Text>Rede Hídrica Conectada</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.square} />
                <Text>Esgoto Conectado</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.square} />
                <Text>Uso de Bomba/Galão</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.square} />
                <Text>Tomada Compatível (10A/20A)</Text>
              </View>
            </View>
            <View style={{ width: "45%" }}>
              <Text style={[styles.label, { marginBottom: 5 }]}>TESTES:</Text>
              <View style={styles.checkboxRow}>
                <View style={styles.square} />
                <Text>Máquina Nivelada</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.square} />
                <Text>Temperatura da Água OK</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.square} />
                <Text>Moagem/Extração Regulada</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.square} />
                <Text>Vazamentos Inexistentes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. INSUMOS E ACESSÓRIOS ENTREGUES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. Insumos e Acessórios Entregues
          </Text>
          <View style={styles.inputRow}>
            <View
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#eee",
                height: 80,
                padding: 4,
              }}
            >
              <Text style={{ color: "#ccc", fontSize: 8 }}>
                Liste aqui (Café, Copos, Açúcar, Mexedor, Pitcher, Tapete...)
              </Text>
            </View>
          </View>
        </View>

        {/* 5. OBSERVAÇÕES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Observações Gerais</Text>
          <View style={styles.obsLine} />
          <View style={styles.obsLine} />
          <View style={styles.obsLine} />
        </View>

        {/* ASSINATURAS */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 40,
          }}
        >
          <View
            style={{
              width: "40%",
              borderTopWidth: 1,
              alignItems: "center",
              paddingTop: 5,
            }}
          >
            <Text>Técnico Responsável</Text>
          </View>
          <View
            style={{
              width: "40%",
              borderTopWidth: 1,
              alignItems: "center",
              paddingTop: 5,
            }}
          >
            <Text>Cliente / Responsável</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Formulário para preenchimento manual • Amiste Café
        </Text>
      </Page>
    </Document>
  );
}
