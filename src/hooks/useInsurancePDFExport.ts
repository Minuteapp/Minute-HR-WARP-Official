import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

export const useInsurancePDFExport = () => {
  const exportAllInsurancesToPDF = (insuranceData: any, employeeName: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("Versicherungsübersicht", 20, 20);
    doc.setFontSize(12);
    doc.text(`Mitarbeiter: ${employeeName}`, 20, 30);
    doc.text(`Stand: ${format(new Date(), "dd.MM.yyyy")}`, 20, 38);
    
    let yPos = 55;
    
    // BAV-Sektion
    if (insuranceData.bav) {
      doc.setFontSize(16);
      doc.text("Betriebliche Altersvorsorge (BAV)", 20, yPos);
      doc.setFontSize(10);
      yPos += 10;
      doc.text(`Anbieter: ${insuranceData.bav.provider}`, 20, yPos);
      yPos += 7;
      doc.text(`Vertragsnummer: ${insuranceData.bav.contract_number}`, 20, yPos);
      yPos += 7;
      doc.text(`Arbeitgeber-Beitrag: ${insuranceData.bav.employer_contribution} € / Monat`, 20, yPos);
      yPos += 7;
      doc.text(`Arbeitnehmer-Beitrag: ${insuranceData.bav.employee_contribution} € / Monat`, 20, yPos);
      yPos += 7;
      doc.text(`Versicherungssumme: ${insuranceData.bav.insurance_sum.toLocaleString()} €`, 20, yPos);
      yPos += 15;
    }
    
    // Krankenversicherung
    if (insuranceData.health) {
      doc.setFontSize(16);
      doc.text("Krankenversicherung", 20, yPos);
      doc.setFontSize(10);
      yPos += 10;
      doc.text(`Anbieter: ${insuranceData.health.provider}`, 20, yPos);
      yPos += 7;
      doc.text(`Mitglieds-Nr.: ${insuranceData.health.member_number}`, 20, yPos);
      yPos += 7;
      doc.text(`Arbeitgeber-Beitrag: ${insuranceData.health.employer_contribution} € / Monat`, 20, yPos);
      yPos += 7;
      doc.text(`Arbeitnehmer-Beitrag: ${insuranceData.health.employee_contribution} € / Monat`, 20, yPos);
      yPos += 15;
    }
    
    // Berufsunfähigkeitsversicherung
    if (insuranceData.disability) {
      doc.setFontSize(16);
      doc.text("Berufsunfähigkeitsversicherung", 20, yPos);
      doc.setFontSize(10);
      yPos += 10;
      doc.text(`Anbieter: ${insuranceData.disability.provider}`, 20, yPos);
      yPos += 7;
      doc.text(`BU-Rente: ${insuranceData.disability.guaranteed_monthly_benefit} € / Monat`, 20, yPos);
      yPos += 7;
      doc.text(`Arbeitgeber-Beitrag: ${insuranceData.disability.employer_contribution} € / Monat`, 20, yPos);
      yPos += 15;
    }
    
    // Neue Seite für weitere Versicherungen
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Kostenübersicht-Tabelle
    const totalEmployer = 
      (insuranceData.bav?.employer_contribution || 0) +
      (insuranceData.health?.employer_contribution || 0) +
      (insuranceData.disability?.employer_contribution || 0);
    
    const totalEmployee = 
      (insuranceData.bav?.employee_contribution || 0) +
      (insuranceData.health?.employee_contribution || 0) +
      (insuranceData.health?.additional_contribution || 0);
    
    (doc as any).autoTable({
      startY: yPos,
      head: [["Versicherung", "AG-Beitrag", "AN-Beitrag", "Gesamt"]],
      body: [
        [
          "BAV",
          `${insuranceData.bav?.employer_contribution || 0} €`,
          `${insuranceData.bav?.employee_contribution || 0} €`,
          `${(insuranceData.bav?.employer_contribution || 0) + (insuranceData.bav?.employee_contribution || 0)} €`,
        ],
        [
          "Krankenversicherung",
          `${insuranceData.health?.employer_contribution || 0} €`,
          `${(insuranceData.health?.employee_contribution || 0) + (insuranceData.health?.additional_contribution || 0)} €`,
          `${(insuranceData.health?.employer_contribution || 0) + (insuranceData.health?.employee_contribution || 0) + (insuranceData.health?.additional_contribution || 0)} €`,
        ],
        [
          "BU-Versicherung",
          `${insuranceData.disability?.employer_contribution || 0} €`,
          `${insuranceData.disability?.employee_contribution || 0} €`,
          `${(insuranceData.disability?.employer_contribution || 0) + (insuranceData.disability?.employee_contribution || 0)} €`,
        ],
        [
          "GESAMT",
          `${totalEmployer.toFixed(2)} €`,
          `${totalEmployee.toFixed(2)} €`,
          `${(totalEmployer + totalEmployee).toFixed(2)} €`,
        ],
      ],
    });
    
    doc.save(`Versicherungen-${employeeName.replace(/\s/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportSingleInsuranceToPDF = (insurance: any, type: string, employeeName: string) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`${type} - Versicherungsnachweis`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Mitarbeiter: ${employeeName}`, 20, 30);
    doc.text(`Stand: ${format(new Date(), "dd.MM.yyyy")}`, 20, 38);
    
    doc.setFontSize(10);
    let yPos = 55;
    
    Object.entries(insurance).forEach(([key, value]) => {
      if (key !== "id" && key !== "employee_id" && key !== "created_at" && key !== "updated_at") {
        doc.text(`${key}: ${value}`, 20, yPos);
        yPos += 7;
      }
    });
    
    doc.save(`${type}-${employeeName.replace(/\s/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return { exportAllInsurancesToPDF, exportSingleInsuranceToPDF };
};
