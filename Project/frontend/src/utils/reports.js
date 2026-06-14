import api from '../services/api';

// Fetches a vehicle's PDF report and triggers a browser download.
export const downloadVehicleReport = async (vehicleId, vehicleName = 'vehicle') => {
  const res = await api.get(`/reports/vehicle/${vehicleId}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${vehicleName}-report.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};