import { prisma } from "@/lib/prisma";
import { ServiceManager } from "@/components/admin/ServiceManager";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Serviços</h1>
      <ServiceManager initialServices={services} />
    </div>
  );
}
