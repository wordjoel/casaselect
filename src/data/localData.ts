import { Property, Revenue, Expense, Booking, Asset, Maintenance, SystemAlert, Supplier, Document } from "../types";

// ─────────────────────────────────────────────
//  DADOS LOCAIS — Espelho dos dados do servidor
//  Usados como fallback quando a API não responde
// ─────────────────────────────────────────────

export const LOCAL_PROPERTIES: Property[] = [
  { id: "casa-lilian", name: "Casa Lilian", location: "São Sebastião, SP", description: "Mansão espetacular com vista para o mar, piscina de borda infinita e área gourmet integrada de altíssimo padrão.", image: "/assets/casa-lilian.png", stars: 4.9, rooms: 5, sizeSqM: 450 },
  { id: "casa-nova", name: "Casa Nova", location: "Trancoso, BA", description: "Arquitetura contemporânea com decoração minimalista, decks integrados e cercada por natureza exuberante.", image: "/assets/casa-nova.png", stars: 4.8, rooms: 4, sizeSqM: 380 },
  { id: "casa-mayla", name: "Casa Mayla", location: "Ipojuca, PE (Porto de Galinhas)", description: "Bangalô pé na areia com acesso direto às piscinas naturais, 4 suítes luxuosas e serviço de praia completo.", image: "/assets/casa-mayla.png", stars: 4.95, rooms: 6, sizeSqM: 520 },
  { id: "casa-caio", name: "Casa Caio", location: "Campos do Jordão, SP", description: "Chale de alto luxo na montanha com lareira central de pedra, adega climatizada e jacuzzi externa aquecida.", image: "/assets/casa-caio.png", stars: 4.75, rooms: 3, sizeSqM: 220 },
  { id: "predinho", name: "Predinho", location: "Leblon, Rio de Janeiro, RJ", description: "Edifício boutique a uma quadra da praia, contendo 3 apartamentos integrados para locação corporativa premium.", image: "/assets/predinho.png", stars: 4.9, rooms: 9, sizeSqM: 600 },
  { id: "casa-vintage", name: "Casa Vintage", location: "Ubatuba, SP", description: "Casarão histórico restaurado com móveis de design dos anos 60 e 70, com SPA privativo e horta orgânica.", image: "/assets/casa-vintage.png", stars: 4.8, rooms: 4, sizeSqM: 310 },
  { id: "casa-amado", name: "Casa Amado", location: "Ilhéus, BA", description: "Ambiente inspirado na literatura de Jorge Amado. Casarão amplo no topo da colina com vista deslumbrante e pomar.", image: "/assets/casa-amado.png", stars: 4.85, rooms: 5, sizeSqM: 410 },
  { id: "casa-49", name: "Casa 49", location: "Granja Viana, SP", description: "Arquitetura moderna e iluminação que exalta cada detalhe. Fachada imponente em condomínio de alto padrão.", image: "/assets/casa-49.png", stars: 5.0, rooms: 5, sizeSqM: 650 },
  { id: "casa-512", name: "Casa 512", location: "Granja Viana — Brasil", description: "A mansão mais luxuosa da Granja Viana", image: "/assets/casa-512.jpg", stars: 5.0, rooms: 4, bathrooms: 7, guests: 12, pricePerNight: 3000, sizeSqM: 800 },
  { id: "casa-select-garden", name: "Casa Select Garden", location: "Interior — Brasil", description: "Refúgio elegante com jardim, varanda e decoração contemporânea.", image: "/assets/casa-select-garden.jpg", stars: 5.0, rooms: 4, bathrooms: 5, guests: 10, pricePerNight: 980, sizeSqM: 450 },
  { id: "casa-select-coast", name: "Casa Select Coast", location: "Praia — Brasil", description: "Casa de praia com vista, piscina e acesso facilitado ao mar.", image: "/assets/casa-select-coast.jpg", stars: 4.9, rooms: 5, bathrooms: 6, guests: 12, pricePerNight: 1450, sizeSqM: 500 },
];

export const LOCAL_REVENUES: Revenue[] = [
  { id: "rev-lilian-1", propertyId: "casa-lilian", origin: "Airbnb" as any, value: 12500, taxes: 1250, date: "2026-05-10", description: "Reserva de 5 diárias - Pacote de Outono" },
  { id: "rev-lilian-2", propertyId: "casa-lilian", origin: "Booking" as any, value: 5952.90, taxes: 595.29, date: "2026-05-22", description: "Estadia de fim de semana - Casal Premium" },
  { id: "rev-nova-1", propertyId: "casa-nova", origin: "Contrato" as any, value: 15390.50, taxes: 769.52, date: "2026-05-15", description: "Contrato mensal - Locatário Corporativo" },
  { id: "rev-mayla-1", propertyId: "casa-mayla", origin: "Airbnb" as any, value: 22381.80, taxes: 2238.18, date: "2026-05-18", description: "Reserva internacional 10 dias - Família Americana" },
  { id: "rev-caio-1", propertyId: "casa-caio", origin: "Temporada" as any, value: 14202.10, taxes: 1136.17, date: "2026-05-20", description: "Feriado prolongado - Locação de temporada direta" },
  { id: "rev-predinho-1", propertyId: "predinho", origin: "Contrato" as any, value: 20115.30, taxes: 1005.76, date: "2026-05-25", description: "Aluguel Mensal da Suíte Tripla Corporativa" },
  { id: "rev-vintage-1", propertyId: "casa-vintage", origin: "Airbnb" as any, value: 16420.20, taxes: 1642.02, date: "2026-05-12", description: "Gravação de Comercial de Marca de Moda (Booking)" },
  { id: "rev-amado-1", propertyId: "casa-amado", origin: "Locação Direta" as any, value: 19578.09, taxes: 0, date: "2026-05-08", description: "Casamento intimista - Fim de semana completo" },
  { id: "rev-512-1", propertyId: "casa-512", origin: "Airbnb" as any, value: 5010.96, taxes: 239.04, date: "2026-04-22", description: "Reserva Airbnb - Ycaro Tavares" },
  { id: "rev-512-2", propertyId: "casa-512", origin: "Airbnb" as any, value: 11214.99, taxes: 0, date: "2026-04-27", description: "Reserva Airbnb - Caio Henrique" },
  { id: "rev-512-3", propertyId: "casa-512", origin: "Airbnb" as any, value: 5965.42, taxes: 0, date: "2026-05-03", description: "Reserva Airbnb - Elza Falcao" },
];

export const LOCAL_EXPENSES: Expense[] = [
  { id: "exp-lilian-1", propertyId: "casa-lilian", category: "Piscina" as any, supplier: "AcquaClean Pools", date: "2026-05-05", value: 450, receipt: "Recibo #5021", paymentMethod: "Pix", description: "Manutenção mensal e tratamento químico da piscina" },
  { id: "exp-lilian-2", propertyId: "casa-lilian", category: "Limpeza" as any, supplier: "Dona Maria Zeladoria", date: "2026-05-11", value: 1200, receipt: "Recibo Dedutivo", paymentMethod: "Pix", description: "Taxação de limpeza profunda pré-reserva" },
  { id: "exp-lilian-3", propertyId: "casa-lilian", category: "Manutenção" as any, supplier: "ClimaMax Refrigeração", date: "2026-05-20", value: 6571.50, receipt: "NF-e #8092", paymentMethod: "Cartão de Crédito", description: "Instalação de ar condicionado inverter na Suíte Master" },
  { id: "exp-nova-1", propertyId: "casa-nova", category: "Funcionários" as any, supplier: "Antônio Jardineiro", date: "2026-05-03", value: 1500, receipt: "Recibo assinado", paymentMethod: "Pix", description: "Serviços de jardinagem e paisagismo mensais" },
  { id: "exp-nova-2", propertyId: "casa-nova", category: "Energia" as any, supplier: "Coelba S/A", date: "2026-05-28", value: 6090.30, receipt: "Fatura Eletrônica", paymentMethod: "Boleto bancário", description: "Conta de luz - Alta temporada" },
  { id: "exp-mayla-1", propertyId: "casa-mayla", category: "Impostos" as any, supplier: "Prefeitura de Ipojuca", date: "2026-05-10", value: 9411.10, receipt: "Guia DAM quitada", paymentMethod: "Boleto bancário", description: "Parcela IPTU 2026 - Imóvel Orla" },
  { id: "exp-caio-1", propertyId: "casa-caio", category: "Internet" as any, supplier: "Algar Telecom", date: "2026-05-02", value: 199.90, receipt: "Fatura quitada", paymentMethod: "Débito Automático", description: "Fibra óptica residencial de alta velocidade" },
  { id: "exp-caio-2", propertyId: "casa-caio", category: "Manutenção" as any, supplier: "Lenhador Campos", date: "2026-05-18", value: 7892.10, receipt: "Comprovante Pix", paymentMethod: "Pix", description: "Carga de lenha ecológica e reparos na lareira" },
  { id: "exp-predinho-1", propertyId: "predinho", category: "Taxas" as any, supplier: "Administradora Leblon", date: "2026-05-05", value: 9064.50, receipt: "Demonstrativo Condominial", paymentMethod: "Boleto bancário", description: "Cota condominial integrada do predinho" },
  { id: "exp-vintage-1", propertyId: "casa-vintage", category: "Utensílios" as any, supplier: "Antiquário Rio", date: "2026-05-15", value: 8210.20, receipt: "NF Compra #212", paymentMethod: "Pix", description: "Lustre retro anos 60 e jogos de pratos finos" },
  { id: "exp-amado-1", propertyId: "casa-amado", category: "Água" as any, supplier: "Embasa S/A", date: "2026-05-12", value: 1432.89, receipt: "Guia paga", paymentMethod: "Pix", description: "Contas de água e saneamento - Consumo integral" },
  { id: "exp-512-1", propertyId: "casa-512", category: "Limpeza" as any, supplier: "Rosilene Ribeiro do Nascimento", date: "2026-04-19", value: 50.00, receipt: "Comprovante NuBank", paymentMethod: "Pix", description: "Serviço de limpeza / taxa de faxina" },
];

export const LOCAL_BOOKINGS: Booking[] = [
  { id: "bk-lilian-1", propertyId: "casa-lilian", guestName: "Amanda Albuquerque", origin: "Airbnb" as any, checkIn: "2026-05-18", checkOut: "2026-05-22", value: 12500, commission: 1250, status: "Concluída" as any, notes: "Hóspede frequente, solicitou enxoval premium extra." },
  { id: "bk-lilian-2", propertyId: "casa-lilian", guestName: "Roberto Silveira", origin: "Booking" as any, checkIn: "2026-06-12", checkOut: "2026-06-15", value: 5952.90, commission: 595.29, status: "Confirmada" as any, notes: "Aluguel romântico de casal." },
  { id: "bk-nova-1", propertyId: "casa-nova", guestName: "XP Investimentos Corp", origin: "Contrato" as any, checkIn: "2026-05-01", checkOut: "2026-05-31", value: 15390.50, commission: 769.52, status: "Concluída" as any, notes: "Locação executiva corporativa." },
  { id: "bk-mayla-1", propertyId: "casa-mayla", guestName: "John Smith & Family", origin: "Airbnb" as any, checkIn: "2026-05-17", checkOut: "2026-05-27", value: 22381.80, commission: 2238.18, status: "Concluída" as any, notes: "Hóspedes americanos, pediram chef local." },
  { id: "bk-mayla-2", propertyId: "casa-mayla", guestName: "Mariana Godoy", origin: "Booking" as any, checkIn: "2026-06-20", checkOut: "2026-06-25", value: 11200, commission: 1120, status: "Confirmada" as any, notes: "Casal com cachorro de pequeno porte." },
  { id: "bk-caio-1", propertyId: "casa-caio", guestName: "Felipe Bronze", origin: "Temporada" as any, checkIn: "2026-05-19", checkOut: "2026-05-24", value: 14202.10, commission: 1136.17, status: "Concluída" as any, notes: "Dono de restaurante famoso. Pediu adega abastecida." },
  { id: "bk-predinho-1", propertyId: "predinho", guestName: "Banco Itaú S.A.", origin: "Contrato" as any, checkIn: "2026-05-01", checkOut: "2026-05-31", value: 20115.30, commission: 1005.76, status: "Concluída" as any, notes: "Suíte executiva anual." },
  { id: "bk-vintage-1", propertyId: "casa-vintage", guestName: "Estúdio Vogue Brasil", origin: "Airbnb" as any, checkIn: "2026-05-16", checkOut: "2026-05-20", value: 16420.20, commission: 1642.02, status: "Concluída" as any, notes: "Locação para ensaio fotográfico editorial." },
  { id: "bk-512-1", propertyId: "casa-512", guestName: "Ycaro Tavares", origin: "Airbnb" as any, checkIn: "2026-04-20", checkOut: "2026-04-22", value: 5010.96, commission: 239.04, status: "Concluída" as any, notes: "Reserva de 2 noites." },
  { id: "bk-512-2", propertyId: "casa-512", guestName: "Caio Henrique", origin: "Airbnb" as any, checkIn: "2026-04-23", checkOut: "2026-04-27", value: 11214.99, commission: 0, status: "Concluída" as any, notes: "Reserva de 4 noites. 9 hóspedes e 2 bebês." },
  { id: "bk-512-3", propertyId: "casa-512", guestName: "Elza Falcao", origin: "Airbnb" as any, checkIn: "2026-05-01", checkOut: "2026-05-03", value: 5965.42, commission: 0, status: "Concluída" as any, notes: "Reserva de 2 noites. 8 hóspedes." },
];

export const LOCAL_ASSETS: Asset[] = [
  { id: "ast-lilian-1", propertyId: "casa-lilian", name: "Ar-Condicionado Multi-Split 24K BTU", category: "Ar-condicionado" as any, value: 6571.50, purchaseDate: "2026-05-20", warrantyUntil: "2029-05-20", lifeSpanYears: 10, location: "Suíte Master", invoiceNumber: "NF-e #8092" },
  { id: "ast-lilian-2", propertyId: "casa-lilian", name: "Geladeira French Door Samsung Bespoke", category: "Eletrodomésticos" as any, value: 14999.00, purchaseDate: "2025-11-10", warrantyUntil: "2027-11-10", lifeSpanYears: 12, location: "Cozinha Gourmet", invoiceNumber: "NF-e #1234" },
  { id: "ast-nova-1", propertyId: "casa-nova", name: "Sofá Modular de Linho Orgânico", category: "Móveis" as any, value: 12500.00, purchaseDate: "2025-08-01", warrantyUntil: "2026-08-01", lifeSpanYears: 8, location: "Living Central" },
  { id: "ast-mayla-1", propertyId: "casa-mayla", name: "Prancha de Stand Up Paddle Carbono", category: "Equipamentos" as any, value: 5400.00, purchaseDate: "2026-01-15", warrantyUntil: "2027-01-15", lifeSpanYears: 5, location: "Depósito de Praia" },
];

export const LOCAL_MAINTENANCES: Maintenance[] = [
  { id: "maint-1", propertyId: "casa-mayla", title: "Limpeza da piscina", type: "Preventiva" as any, status: "Em Andamento" as any, date: "2026-06-08", cost: 450, notes: "Higienização e aspiração semanal e balanceamento de cloro." },
  { id: "maint-2", propertyId: "casa-lilian", title: "Ar condicionado", type: "Preventiva" as any, status: "Agendada" as any, date: "2026-06-10", cost: 800, notes: "Higienização interna e recarga de gás para a temporada de inverno." },
  { id: "maint-3", propertyId: "predinho", title: "Dedetização", type: "Preventiva" as any, status: "Agendada" as any, date: "2026-06-22", cost: 1200, notes: "Dedetização semestral obrigatória em todas as suítes." },
  { id: "maint-4", propertyId: "casa-vintage", title: "Pintura externa", type: "Corretiva" as any, status: "Agendada" as any, date: "2026-06-25", cost: 3200, notes: "Reparos decorativos na fachada lateral afetada pela umidade da praia." },
];

export const LOCAL_ALERTS: SystemAlert[] = [
  { id: "alert-1", propertyId: "casa-mayla", type: "warning", title: "Manutenção de Piscina Pendente", message: "A desinfecção periódica da Casa Mayla expira em 2 dias.", date: "2026-06-06" },
  { id: "alert-2", propertyId: "casa-lilian", type: "info", title: "Ar-Condicionado Próximo", message: "Revisão agendada para 10/06 para garantir a climatização ideal.", date: "2026-06-05" },
];

export const LOCAL_SUPPLIERS: Supplier[] = [
  { id: "sup-1", name: "AcquaClean Pools", specialty: "Piscineiro Técnico Especializado", contactName: "João Piscineiro", phone: "(11) 98012-9021", email: "joao@acquaclean.com" },
  { id: "sup-2", name: "Dona Maria Zeladoria", specialty: "Limpeza Profunda de Aluguel de Temporada", contactName: "Maria Helena", phone: "(12) 99824-1102", email: "maria@zeladoria.com" },
  { id: "sup-3", name: "ClimaMax Refrigeração", specialty: "Ar-Condicionados e Climatização Preventiva", contactName: "Carlos Silveira", phone: "(24) 98801-4412", email: "carlos@climamax.com" },
];

export const LOCAL_DOCUMENTS: Document[] = [
  { id: "doc-1", name: "Regulamento_Interno_Villa_Lilian.pdf", type: "Regulamento", description: "Manual de Conduta de Lazer", date: "2026-06-01", fileSize: "1.2 MB" },
  { id: "doc-2", name: "Contrato_Boutique_Itaú_XP_Corporate.pdf", type: "Contrato", description: "Acordo de Aluguel Anual", date: "2026-05-15", fileSize: "2.4 MB" },
];
