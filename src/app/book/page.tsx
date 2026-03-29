import { BookingWizard } from "@/components/booking/BookingWizard";

export const metadata = {
  title: `Agendar – ${process.env.NEXT_PUBLIC_BARBERSHOP_NAME || "Barbearia"}`,
};

export default function BookPage() {
  const barbershopName = process.env.NEXT_PUBLIC_BARBERSHOP_NAME || "Barbearia";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">✂️</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">{barbershopName}</h1>
            <p className="text-xs text-gray-400">Agendamento Online</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <BookingWizard />
        </div>
      </main>

      <footer className="text-center pb-8">
        <p className="text-xs text-gray-400">
          Notificações via WhatsApp e Email
        </p>
      </footer>
    </div>
  );
}
