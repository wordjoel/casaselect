const fs = require('fs');
let initialData = fs.readFileSync('api/initialData.ts', 'utf8');
initialData = initialData.replace(/export /g, '').replace(/import .* from .*;/g, '');

let apiIndex = fs.readFileSync('server.ts', 'utf8'); // use server.ts as base to avoid encoding corruption issues in api/index.ts
// remove app.listen and the closing brace of startServer
apiIndex = apiIndex.replace(/app\.listen\([\s\S]*\}\);\s*\}/, '');
// remove startServer call at the end of the file
apiIndex = apiIndex.replace(/startServer\(\);?\s*$/, '');

// Remove existing imports
apiIndex = apiIndex.replace(/import \{[^}]*?\} from ["']\.\/api\/initialData["'];?/g, '');
apiIndex = apiIndex.replace(/import \{[^}]*?\} from ["']\.\/src\/types["'];?/g, '');

// Add the enums needed
const enums = `
enum PropertyOrigin { AIRBNB = 'Airbnb', BOOKING = 'Booking', CONTRATO = 'Contrato', TEMPORADA = 'Temporada', LOCACAO_DIRETA = 'Locação Direta', OUTROS = 'Outros' }
enum ExpenseCategory { MANUTENCAO = 'Manutenção', PISCINA = 'Piscina', LIMPEZA = 'Limpeza', FUNCIONARIOS = 'Funcionários', INTERNET = 'Internet', AGUA = 'Água', ENERGIA = 'Energia', JARDINAGEM = 'Jardinagem', ALIMENTACAO = 'Alimentação', MOVEIS = 'Móveis', UTENSILIOS = 'Utensílios', ELETRONICOS = 'Eletrônicos', COMISSOES = 'Comissões', TAXAS = 'Taxas', IMPOSTOS = 'Impostos', OUTROS = 'Outros' }
enum BookingStatus { CONFIRMADA = 'Confirmada', PENDENTE = 'Pendente', CONCLUIDA = 'Concluída', CANCELADA = 'Cancelada' }
enum AssetCategory { MOVEIS = 'Móveis', ELETRONICOS = 'Eletrônicos', ELETRODOMESTICOS = 'Eletrodomésticos', EQUIPAMENTOS = 'Equipamentos', PISCINA = 'Piscina', JARDIM = 'Jardim', AR_CONDICIONADO = 'Ar-condicionado' }
enum MaintenanceType { PREVENTIVA = 'Preventiva', CORRETIVA = 'Corretiva', EMERGENCIAL = 'Emergencial' }
enum MaintenanceStatus { AGENDADA = 'Agendada', EM_ANDAMENTO = 'Em Andamento', CONCLUIDA = 'Concluída' }

// Types
interface Property { id: string; name: string; location: string; description: string; image?: string; stars?: number; rooms?: number; bathrooms?: number; guests?: number; pricePerNight?: number; sizeSqM?: number; }
interface User { id: string; name: string; username: string; password?: string; role: 'admin' | 'user'; }
interface Revenue { id: string; propertyId: string; origin: PropertyOrigin; value: number; taxes: number; date: string; description: string; attachment?: string; }
interface Expense { id: string; propertyId: string; category: ExpenseCategory; supplier: string; date: string; value: number; receipt?: string; paymentMethod: string; description: string; }
interface Booking { id: string; propertyId: string; guestName: string; origin: PropertyOrigin; checkIn: string; checkOut: string; value: number; commission: number; status: BookingStatus; phone?: string; documents?: string[]; notes?: string; guestsCount?: number; selectedServices?: string[]; isRecurrent?: boolean; daysCount?: number; airbnbUrl?: string; }
interface Asset { id: string; propertyId: string; name: string; category: AssetCategory; value: number; purchaseDate: string; warrantyUntil?: string; lifeSpanYears?: number; location?: string; photoUrl?: string; invoiceNumber?: string; }
interface Maintenance { id: string; propertyId: string; title: string; type: MaintenanceType; status: MaintenanceStatus; date: string; cost: number; notes?: string; }
interface SystemAlert { id: string; propertyId?: string; type: "warning" | "info" | "success" | "danger"; title: string; message: string; date: string; }
interface Message { role: "user" | "model"; text: string; timestamp: string; }
interface Supplier { id: string; name: string; specialty: string; contactName: string; phone: string; email?: string; }
interface Document { id: string; name: string; type: string; description: string; date: string; fileSize?: string; fileUrl?: string; }
`;

const newApiIndex = apiIndex.replace('let properties: Property[]', enums + '\n\n' + initialData + '\n\nlet properties: Property[]');
// export app instead of startServer()
const finalApiIndex = newApiIndex.replace('async function startServer() {', '')
    .replace('const app = express();', 'const app = express();\nexport default app;\n');

fs.writeFileSync('api/index.ts', finalApiIndex);
