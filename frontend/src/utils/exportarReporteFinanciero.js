import jsPDF from "jspdf";

const money = (value = 0) => {
  return `Q ${Number(value).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
  })}`;
};

const exportarReporteFinanciero = async ({
  monthlyData = [],
  categoryData = [],
  tendenciaAhorro = [],
  periodoProyeccion = 12,
}) => {

  const pdf = new jsPDF("p", "mm", "a4");

  // =========================
  // HELPERS
  // =========================

  const pageWidth = pdf.internal.pageSize.width;

  const addTitle = (text, y) => {

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(18);

    pdf.setTextColor(15, 23, 42);

    pdf.text(text, 14, y);

  };

  const addCard = ({
    x,
    y,
    w,
    h,
    title,
    value,
    color,
  }) => {

    pdf.setFillColor(...color);

    pdf.roundedRect(
      x,
      y,
      w,
      h,
      4,
      4,
      "F"
    );

    pdf.setTextColor(255, 255, 255);

    pdf.setFontSize(11);

    pdf.setFont("helvetica", "bold");

    pdf.text(title, x + 5, y + 10);

    pdf.setFontSize(18);

    pdf.text(value, x + 5, y + 22);

  };

  // =========================
  // DATOS
  // =========================

  const totalIngresos =
    monthlyData.reduce(
      (acc, item) =>
        acc + Number(item.ingresos || 0),
      0
    );

  const totalGastos =
    monthlyData.reduce(
      (acc, item) =>
        acc + Number(item.gastos || 0),
      0
    );

  const balance =
    totalIngresos - totalGastos;

  // ✅ AHORA USA DATOS REALES DE AHORRO

  const promedioAhorro =
    tendenciaAhorro.length > 0
      ? tendenciaAhorro.reduce(
        (acc, item) =>
          acc + Number(item.ahorro || 0),
        0
      ) / tendenciaAhorro.length
      : 0;

  // =========================
  // HEADER
  // =========================

  pdf.setFillColor(15, 23, 42);

  pdf.rect(
    0,
    0,
    pageWidth,
    35,
    "F"
  );

  pdf.setTextColor(255, 255, 255);

  pdf.setFontSize(24);

  pdf.setFont("helvetica", "bold");

  pdf.text(
    "Reporte Financiero - SaldoGT",
    14,
    20
  );

  pdf.setFontSize(10);

  pdf.setFont("helvetica", "normal");

  pdf.text(
    `Generado: ${new Date().toLocaleDateString("es-GT")}`,
    14,
    28
  );

  // =========================
  // RESUMEN
  // =========================

  addTitle("Resumen General", 50);

  addCard({
    x: 14,
    y: 58,
    w: 58,
    h: 30,
    title: "Ingresos",
    value: money(totalIngresos),
    color: [16, 185, 129],
  });

  addCard({
    x: 76,
    y: 58,
    w: 58,
    h: 30,
    title: "Gastos",
    value: money(totalGastos),
    color: [239, 68, 68],
  });

  addCard({
    x: 138,
    y: 58,
    w: 58,
    h: 30,
    title: "Balance",
    value: money(balance),
    color: [59, 130, 246],
  });

  // =========================
  // GASTOS
  // =========================

  addTitle("Distribución de Gastos", 110);

  let y = 120;

  if (categoryData.length === 0) {

    pdf.setFontSize(11);

    pdf.setTextColor(100);

    pdf.text(
      "No hay datos de gastos disponibles.",
      14,
      y
    );

  } else {

    categoryData.forEach((item, index) => {

      pdf.setFillColor(248, 250, 252);

      pdf.roundedRect(
        14,
        y,
        182,
        12,
        3,
        3,
        "F"
      );

      pdf.setTextColor(17, 24, 39);

      pdf.setFontSize(11);

      pdf.setFont("helvetica", "normal");

      pdf.text(
        item.name,
        20,
        y + 8
      );

      pdf.setFont("helvetica", "bold");

      pdf.text(
        money(item.value),
        160,
        y + 8
      );

      y += 16;

    });

  }

  // =========================
  // NUEVA PAGINA
  // =========================

  pdf.addPage();

  // =========================
  // HISTORIAL AHORRO
  // =========================

  addTitle("Historial de Ahorro", 20);

  pdf.setFont("helvetica", "normal");

  pdf.setFontSize(11);

  pdf.setTextColor(17, 24, 39);

  pdf.text(
    `Promedio mensual: ${money(promedioAhorro)}`,
    14,
    32
  );

  pdf.text(
    `Periodo proyectado: ${periodoProyeccion} meses`,
    14,
    40
  );

  // =========================
  // TABLA
  // =========================

  let tableY = 55;

  pdf.setFillColor(15, 23, 42);

  pdf.rect(
    14,
    tableY,
    182,
    10,
    "F"
  );

  pdf.setTextColor(255);

  pdf.setFont("helvetica", "bold");

  pdf.text(
    "Fecha",
    20,
    tableY + 7
  );

  pdf.text(
    "Ahorro",
    140,
    tableY + 7
  );

  tableY += 12;

  pdf.setTextColor(17, 24, 39);

  if (tendenciaAhorro.length === 0) {

    pdf.setFont("helvetica", "normal");

    pdf.text(
      "No hay historial de ahorro disponible.",
      20,
      tableY
    );

  } else {

    tendenciaAhorro.forEach((item, index) => {

      pdf.setFillColor(
        index % 2 === 0
          ? 248
          : 255
      );

      pdf.rect(
        14,
        tableY - 5,
        182,
        10,
        "F"
      );

      const fechaFormateada =
        new Date(item.fecha)
          .toLocaleDateString("es-GT");

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        fechaFormateada,
        20,
        tableY + 2
      );

      pdf.text(
        money(item.ahorro),
        140,
        tableY + 2
      );

      tableY += 10;

    });

  }

  // =========================
  // RECOMENDACIONES
  // =========================

  tableY += 15;

  addTitle(
    "Recomendaciones",
    tableY
  );

  tableY += 12;

  const recomendaciones = [];

  if (balance > 0) {
    recomendaciones.push(
      "Mantienes un balance financiero positivo."
    );
  }

  if (totalGastos > totalIngresos * 0.7) {
    recomendaciones.push(
      "Tus gastos representan gran parte de tus ingresos."
    );
  }

  if (promedioAhorro > 0) {
    recomendaciones.push(
      "Mantienes constancia en tus ahorros."
    );
  }

  if (recomendaciones.length === 0) {
    recomendaciones.push(
      "Aún no hay suficientes datos financieros para generar recomendaciones."
    );
  }

  recomendaciones.forEach((rec) => {

    pdf.setFillColor(
      240,
      253,
      244
    );

    pdf.roundedRect(
      14,
      tableY - 5,
      182,
      12,
      3,
      3,
      "F"
    );

    pdf.setTextColor(
      22,
      101,
      52
    );

    pdf.setFontSize(10);

    pdf.text(
      `• ${rec}`,
      18,
      tableY + 2
    );

    tableY += 16;

  });

  // =========================
  // FOOTER
  // =========================

  pdf.setFontSize(9);

  pdf.setTextColor(120);

  pdf.text(
    "Generado automáticamente por SaldoGT",
    14,
    285
  );

  // =========================
  // DESCARGAR
  // =========================

  pdf.save(
    "reporte-financiero.pdf"
  );

};

export default exportarReporteFinanciero;