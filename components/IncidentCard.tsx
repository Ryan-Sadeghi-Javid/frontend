// components/IncidentCard.tsx
type Incident = {
  incidentId: string;
  createdAt: string;
  status: string;
  incidentBlock: {
    primaryHarmType: string;
    country?: string;
  };
};

export default function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <div className="border p-4 rounded-xl shadow bg-white">
      <h2 className="text-lg font-semibold">{incident.incidentBlock.primaryHarmType}</h2>
      <p><strong>Country:</strong> {incident.incidentBlock.country || "N/A"}</p>
      <p><strong>Status:</strong> {incident.status}</p>
      <p><strong>Submitted:</strong> {new Date(incident.createdAt).toLocaleString()}</p>
    </div>
  );
}