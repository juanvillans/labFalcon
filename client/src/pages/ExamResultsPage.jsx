import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { examResultsAPI } from "../services/api";
import PrintPage from "../components/PrintableExamResult";

export default function ExamResultsPage() {
  const { token } = useParams();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamResults = async () => {
      try {
        setLoading(true);
        const response = await examResultsAPI.getByToken(token);
        console.log(response.data.data);
        setExamData(response.data.data);
        await examResultsAPI.updateMessageStatus(response.data.data.id, "LEIDO");
        
      } catch (err) {
        setError(err.message || "Error al cargar los resultados");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchExamResults();
    }
  }, [token]);

  const downloadPDF = async () => {
    try {
      const response = await examResultsAPI.downloadPDF(token);
      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resultados-${examData.patient.ci}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            El enlace puede haber expirado o ser inválido.
          </p>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No se encontraron resultados.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>Resultados del Examen - LabFalcón</title>
      <div className="min-h-screen bg-gray-100 py-8">
        <PrintPage isHidden={false} data={examData} />
      </div>
    </>
  );
}
