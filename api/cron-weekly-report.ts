import express from "express";

const router = express.Router();

router.get("/api/cron-weekly-report", async (req, res) => {
  // Simulando a rotina de envio semanal
  const authHeader = req.headers.authorization;
  
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized cron execution" });
  }

  const reportData = {
    date: new Date().toISOString(),
    revenues: "R$ 342.500",
    expenses: "R$ 45.200",
    occupancy: "89.5%",
    insights: [
      "Meta da Débora (Locação) atingida em 110%",
      "Manutenção da piscina (Beco/Pamela) agendada com economia de 15%"
    ]
  };

  console.log("Executando Automação Semanal do CEO Cockpit...");
  console.log("Enviando e-mail gerado pela IA para o Henrique e Verônica...");

  res.status(200).json({ success: true, report: reportData, message: "Weekly report sent successfully via email/whatsapp" });
});

export default router;
