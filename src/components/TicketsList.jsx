import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode"; // Importar la librería qrcode
import QRScanner from "./QRScanner"; // Importar el componente QRScanner

function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [showScanner, setShowScanner] = useState(false); // Estado para mostrar/ocultar el escáner
  const templateUrl = "/plantillaQr.png"; 
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Función para obtener los tickets desde el backend
  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_tickets`);
      
      if (!response.ok) {
        throw new Error("Error al obtener los tickets");
      }
      const data = await response.json();
      setTickets(data); // Actualiza el estado con los tickets obtenidos
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Función para manejar el escaneo de un QR
  const handleScan = async (qrCodeData) => {
    setShowScanner(false); // Ocultar el escáner después de escanear
    console.log("Código QR escaneado:", qrCodeData);

    // Llamar al backend para validar el ticket
    try {
      const response = await fetch(`${API_BASE_URL}/scan_ticket/${qrCodeData}`);
      const data = await response.json();
      if (response.ok) {
        alert(`Ticket validado: ${data.message}`);
        // Actualizar la lista de tickets
        fetchTickets();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al validar el ticket:", error);
      alert("Error al validar el ticket. Inténtalo de nuevo.");
    }
  };

  // Función para generar y descargar el PDF de un ticket
const downloadTicketPDF = async (ticket) => {
  console.log("Descargando PDF para el ticket:", ticket); // Depuración
  console.log("Valor del QR:", ticket.qr_code); // Depuración

  if (!ticket.qr_code) {
    console.error("El valor del QR es undefined. Verifica el backend."); // Depuración
    return;
  }

  // Crear un nuevo PDF
  const doc = new jsPDF("p", "px", [595, 842]); // Tamaño A4 en píxeles (595x842)

  // Cargar la plantilla JPG (asegúrate de que la imagen esté optimizada)
  const template = new Image();
  template.src = "/plantillaQr.jpg"; // Ruta a la plantilla en la carpeta public

  template.onload = () => {
    console.log("Plantilla cargada correctamente"); // Depuración

    // Agregar la plantilla como fondo del PDF (reducir el tamaño si es necesario)
    doc.addImage(template, "JPEG", 0, 0, 595, 842); // Ajustar al tamaño A4

    // Generar el código QR en el PDF
    const qrSize = 150; // Tamaño del QR (reducido para optimizar)
    const qrX = (595 - qrSize) / 2; // Centrar el QR horizontalmente
    const qrY = 600; // Posición Y del QR (ajusta según sea necesario)

    // Crear un canvas temporal para el código QR (fuera del DOM)
    const qrCodeCanvas = document.createElement("canvas");
    qrCodeCanvas.width = qrSize;
    qrCodeCanvas.height = qrSize;

    // Renderizar el código QR en el canvas usando la librería qrcode
    QRCode.toCanvas(qrCodeCanvas, ticket.qr_code, { width: qrSize }, (error) => {
      if (error) {
        console.error("Error al generar el QR:", error); // Depuración
        return;
      }

      console.log("QR renderizado correctamente en el canvas"); // Depuración

      // Convertir el canvas a una imagen
      const qrImage = qrCodeCanvas.toDataURL("image/jpeg", 0.8); // Usar JPEG con calidad del 80%
      console.log("Canvas listo, agregando QR al PDF:", qrImage); // Depuración

      // Agregar el QR al PDF
      doc.addImage(qrImage, "JPEG", qrX, qrY, qrSize, qrSize);
      console.log("QR agregado al PDF"); // Depuración

      // Guardar el PDF con el nombre del comprador
      const fileName = `Entrada_${ticket.name.replace(/ /g, "_")}.pdf`;
      console.log("Guardando PDF:", fileName); // Depuración
      doc.save(fileName);
    });
  };

  template.onerror = (error) => {
    console.error("Error al cargar la plantilla:", error); // Depuración
    alert("Error al cargar la plantilla. Verifica que la imagen esté en la carpeta public y se llame 'plantillaQr.jpg'.");
  };
};

  // Obtener los tickets cuando el componente se monta
  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Lista de Entradas</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowScanner(true)}>
        Escanear QR
      </button>
      {showScanner && <QRScanner onScan={handleScan} />} {/* Mostrar el escáner si showScanner es true */}
      {tickets.length === 0 ? (
        <p>No hay entradas creadas aún.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Evento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.name}</td>
                <td>{ticket.email}</td>
                <td>{ticket.event}</td>
                <td>{ticket.status}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => downloadTicketPDF(ticket)}
                  >
                    Descargar PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TicketsList;
