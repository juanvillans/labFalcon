import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { examResultsAPI } from "../services/api";
import PrintPage from "../components/PrintableExamResult";
import { examinationTypesAPI } from "../services/api";
import { useFeedback } from "../context/FeedbackContext";

import SecretrariaLogo from "../assets/secretaria_logo.png";
import logoBlue from "../assets/logoBlue.webp";

export default function ExamResultsPage() {
  const { token } = useParams();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [examinationTypes, setExaminationTypes] = useState(null);

  // Header component to reuse
  const headerJSX = (
    <div className="text-center mb-5">
      <div className="flex justify-center gap-4 items-center pt-4 py-4 mb-1">
        <img src={SecretrariaLogo} alt="" className="w-16" />
        <img src={logoBlue} alt="" className="w-16 " />
      </div>
      <h1 className="text-lg md:text-2xl font-bold text-gray-800">Secretaria de Salud Falcón - Laboratorio</h1>
    </div>
  );

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
        console.log(response.data.data);
        setExamData(response.data.data);
        await examResultsAPI.updateMessageStatus(
          response.data.data.id,
          "LEIDO"
        );
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
      <div className="min-h-screen bg-gray-100">
        {headerJSX}
        <div className="flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        {headerJSX}
        <div className="flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-4">
              Error
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500">
              El enlace puede haber expirado o ser inválido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-100">
        {headerJSX}
        <div className="flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">No se encontraron resultados.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>Resultados del Examen - LabFalcón</title>
      <div className="min-h-screen bg-gray-100 py-8 pt-2">
        {headerJSX}
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
