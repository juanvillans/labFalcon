import React, { useState, useEffect,  useCallback } from "react";
import { useParams } from "react-router-dom";
import { examResultsAPI } from "../services/api";
import PrintPage from "../components/PrintableExamResult";
import { examinationTypesAPI } from "../services/api";

export default function ExamResultsPage() {
  const { token } = useParams();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examinationTypes, setExaminationTypes] = useState(null);
   const getExaminationTypes = useCallback(async () => {
      try {
        const res = await examinationTypesAPI.getExaminationTypes();
        setExaminationTypes(res.data.examinationTypes);
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    }, []);
  
    useEffect(() => {
      getExaminationTypes();
    }, [getExaminationTypes]);
  useEffect(() => {
    const fetchExamResults = async () => {
      try {
        setLoading(true);
        const response = await examResultsAPI.getByToken(token);
        setExamData(response.data.data);
        await examResultsAPI.updateMessageStatus(response.data.data.id, "LEIDO");
        
      } catch (err) {
        setError("Error al cargar los resultados");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchExamResults();
    }
  }, [token]);

 
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
        <PrintPage
          isHidden={false}
          data={examData}
          token={token}
          examinationTypes={examinationTypes}
        />
      </div>
    </>
  );
}
