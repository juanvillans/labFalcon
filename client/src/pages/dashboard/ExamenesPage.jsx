import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  examinationTypesAPI,
  examsAPI,
  examResultsAPI,
} from "../../services/api";
import externalApi from "../../services/saludfalcon.api";
import { Icon } from "@iconify/react";
import Modal from "../../components/Modal";
import FuturisticButton from "../../components/FuturisticButton";
import FormField from "../../components/forms/FormField";
import { CircularProgress } from "@mui/material";
import { useFeedback } from "../../context/FeedbackContext";
import PrintPage from "../../components/PrintableExamResult";
import { MaterialReactTable } from "material-react-table";

import debounce from "lodash.debounce";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

let isThereLocalStorageFormData = localStorage.getItem("formData") ? true : false;
// Memoized component for test fields to prevent unnecessary re-renders
const MemoizedTestField = React.memo(
  ({ field, value, onChange, testKey, fieldName }) => {
    const handleChange = useCallback(
      (e) => {
        onChange(testKey, e);
      },
      [onChange, testKey]
    );
    console.log(field, testKey)

    return (
      <FormField
        key={fieldName+"_"+testKey}
        {...field}
        examination_type_id={testKey}
        value={value || ""}
        onChange={handleChange}
      />
    );
  }
);

export default function ExamenesPage() {
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isMessageSentModalOpen, setIsMessageSentModalOpen] = useState(false);
  const [messageData, setMessageData] = useState({});
  const [resultsToken, setResultsToken] = useState(null);
  const [examinationTypes, setExaminationTypes] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [printButtonId, setPrintButtonId] = useState(null);
  const { user } = useAuth();

  // Form configuration for ReusableForm
  const patientFormFields = useMemo(() => [
    {
      name: "ci",
      label: "Cédula de Identidad",
      type: "text",
      required: true,
      className: "col-span-1",
    },
    {
      name: "first_name",
      label: "Nombre",
      type: "text",
      required: true,
      className: "col-span-1",
    },
    {
      name: "last_name",
      label: "Apellido",
      type: "text",
      required: true,
      className: "col-span-1",
    },
    {
      name: "date_birth",
      label: "Fecha de Nacimiento",
      type: "date",
      required: true,
      className: "col-span-1",
    },
    {
      name: "email",
      label: "Correo Electrónico",
      type: "email",
      required: true,
      className: "col-span-1",
    },
    {
      name: "phone_number",
      label: "Teléfono",
      type: "text",
      required: true,
      className: "col-span-1",
    },
    {
      name: "address",
      label: "Dirección",
      type: "text",
      required: false,
      className: "col-span-1",
    },
    {
      name: "sex",
      label: "Sexo *",
      type: "select",
      options: [
        { value: "Masculino", label: "Masculino" },
        { value: "Femenino", label: "Femenino" },
      ],
      className: "col-span-1",
    },
  ]);
  const defaultFormData = {
    patient: {
      ci: "",
      first_name: "",
      last_name: "",
      date_birth: "",
      email: "",
      phone_number: "",
      address: "",
      sex: "",
      patient_id: null,
    },
    all_validated: false,
    tests: {},
  };

  const [formData, setFormData] = useState(structuredClone(defaultFormData));
  const [submitString, setSubmitString] = useState("Registrar");
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare both requests
      const internalRequest =
        submitString === "Actualizar"
          ? examsAPI.updateExam(formData.id, formData)
          : examsAPI.createExam(formData);

      const externalRequest =
        formData.patient.patient_id === null
          ? externalApi.post("/patients", {
              // Map your formData to the external API's expected format
              id: formData.patient.patient_id,
              ...formData.patient,
              name: formData.patient.first_name,
            })
          : Promise.resolve({ success: true, skipped: true });

      // Execute both requests in parallel
      const [internalResponse, externalResponse] = await Promise.all([
        internalRequest,
        externalRequest.catch((e) => {
          console.error("External API failed (non-critical):", e);
          return { success: false, error: e };
        }),
      ]);

      // Handle success
      if (submitString === "Actualizar") {
        setSubmitString("Registrar");
      }

      showSuccess("Operación completada con éxito");
      setFormData(structuredClone(defaultFormData));
      setIsModalOpen(false);
      setIsFormInitialized(false); // ← Desactivar guardado
      fetchData();
      localStorage.removeItem("formData"); // ← Limpiar
      localStorage.removeItem("submitString");
      // Optional: Log external API result
      if (!externalResponse.success) {
        console.warn("External system update failed (non-critical)");
        // You could show a non-blocking warning here if needed
      }
    } catch (error) {
      // This will only catch errors from the internal API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error en el sistema principal";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  console.log({formData})

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Cód",
        size: 60,
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "patient.first_name",
        header: "Nombre",
        size: 110,
        filterFn: "includesString",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "patient.last_name",
        header: "Apellido",
        size: 120,
        filterFn: "includesString",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "age",
        header: "Edad",
        size: 83,
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        accessorKey: "patient.sex",
        header: "Sexo",
        size: 100,
        filterFn: "includesString",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "patient.ci",
        header: "C.I",
        size: 100,
        filterFn: "includesString",
        enableColumnFilter: true,
        enableSorting: true,
      },

      {
        accessorKey: "created_date",
        header: "Fecha",
        size: 125,
        filterFn: "equals",
        enableColumnFilter: true,
        enableSorting: true,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return new Date(value).toLocaleDateString();
        },
      },
      {
        accessorKey: "created_time",
        header: "Hora",
        size: 100,
        filterFn: "includesString",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "all_validated",
        header: "Validado",
        size: 100,
        filterFn: "equals",
        enableColumnFilter: true,
        enableSorting: true,
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <Icon
              className="relative -left-1.5 text-color2 w-7 h-7"
              icon="bitcoin-icons:verify-filled"
            />
          ) : (
            <Icon
              icon="octicon:unverifed-24"
              className="text-gray-600 w-4 h-4"
            />
          ),
        filterVariant: "select",
        filterSelectOptions: [
          { value: "true", label: "Validado" },
          { value: "false", label: "No Validado" },
        ],
      },
      {
        accessorKey: "message_status",
        header: "Estado de envio",
        size: 100,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          if (value === "ENVIADO") {
            return (
              <div className="flex items-center gap-2">
                <Icon
                  className="text-gray-500"
                  icon="iconamoon:check-fill"
                  width={20}
                  height={20}
                />
                <p>Enviado</p>
              </div>
            );
          } else if (value === "LEIDO") {
            return (
              <div className="flex items-center gap-2">
                <Icon
                  className="text-color3"
                  icon={"line-md:check-all"}
                  width={20}
                  height={20}
                />
                <p>Leído</p>
              </div>
            );
          } else {
            return (
              <div className="flex items-center gap-2 opacity-50">
                <Icon
                  className="text-red-500"
                  icon={"line-md:close"}
                  width={20}
                  height={20}
                />
                <p>No Enviado</p>
              </div>
            );
          }
        },
        enableColumnFilter: true,
        filterVariant: "select",
        filterSelectOptions: [
          { value: "ENVIADO", label: "Enviado" },
          { value: "LEIDO", label: "Leído" },
          { value: "NO_ENVIADO", label: "No Enviado" },
        ],
        enableSorting: false,
      },
      {
        header: "Acciones",
        id: "actions",
        size: 220,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex gap-2 justify-center items-center">
              <button
                className="mx-1 p-1 hover:p-2 duration-75 text-gray-500 hover:bg-blue-100 hover:text-color3 rounded-full"
                onClick={() => {
                  setIsModalOpen(true);
                  setFormData({
                    patient: data.patient,
                    id: data.id,
                    all_validated: data.validated,
                    tests: data.tests,
                  });
                  setSubmitString("Actualizar");
                }}
                title="Editar"
              >
                <Icon
                  icon="material-symbols:edit"
                  className=""
                  width={20}
                  height={20}
                />
              </button>
              
              <span onClick={() => setPrintButtonId(data.id)} className=" hover:p-0.5 hover:pr-2 duration-75 text-gray-600  hover:bg-yellow-100 hover:text-yellow-700 rounded-full">
                
                <PrintPage data={data} active={printButtonId === data.id}  isHidden={true} />
                

              </span>

              {data.all_validated && (
                <button
                  title="Enviar mensaje"
                  className="mx-1 p-1 hover:p-2 duration-75 text-gray-600  hover:bg-green-100 hover:text-green-600 rounded-full"
                  onClick={async () => {
                    setMessageData(data);
                    setIsMessageModalOpen(true);
                    // Generate token for WhatsApp link
                    const token = await generateResultsToken(data.id);
                    setResultsToken(token);
                  }}
                >
                  <Icon
                    icon="carbon:send-alt"
                    className=""
                    width={20}
                    height={20}
                  />
                </button>
              )}

              <button
                onClick={() => handleDelete(data.id)}
                title="Eliminar"
                className="ml-auto hover:p-2 duration-75 text-gray-500 hover:bg-red-100 rounded-full p-1 hover:text-red-600"
              >
                <Icon icon="heroicons:trash" className="w-5 h-5" />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const handleMessage = async () => {
    setLoadingMessage(true);
    try {
      await examResultsAPI.sendExamResults(messageData);
      showSuccess("Mensaje enviado con éxito");
      setIsMessageModalOpen(false);
      setMessageData(null);
      fetchData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      showError(errorMessage);
    }
    setLoadingMessage(false);
  };
  const handleWhatsAppMessageSent = async () => {
    try {
      await examResultsAPI.updateMessageStatus(messageData.id, "ENVIADO");
      showSuccess("Mensaje marcado como enviado con éxito");
      setIsMessageSentModalOpen(false);
      setMessageData(null);
      fetchData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      showError(errorMessage);
    }
  };

  const generateResultsToken = async (analysisId) => {
    try {
      const response = await examResultsAPI.generateToken({ analysisId });
      return response.data.token;
    } catch (error) {
      console.error("Error generating token:", error);
      return null;
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("¿Está seguro de eliminar este examen?")) {
        return;
      }
      await examsAPI.deleteExam(id);
      showSuccess("Examen eliminado con éxito");
      fetchData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      showError(errorMessage);
    }

    console.log("Delete exam:", exam.id);
    // Call your delete API or show a confirmation dialog
  };

  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Server-side state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [sorting, setSorting] = useState([
    { id: "id", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await examsAPI.getExams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortField: sorting[0]?.id || "id",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
        search: globalFilter, // Global search
        filters: JSON.stringify(
          columnFilters.reduce((acc, curr) => {
            acc[curr.id] = curr.value;
            return acc;
          }, {})
        ),
      });
      setData(res.data.exams);
      setRowCount(res.data.totalCount);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
    setIsLoading(false);
  }, [pagination, sorting, columnFilters, globalFilter]);

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
    fetchData();
  }, [fetchData]);

  // Create debounced function once
  const debouncedSaveFormData = useMemo(
    () =>
      debounce((data, submitStr) => {
        console.log("saving to localStorage");
        localStorage.setItem("formData", JSON.stringify(data));
        localStorage.setItem("submitString", JSON.stringify(submitStr));
      }, 300),
    []
  );

  useEffect(() => {
    // Solo guardar si el formulario ya fue inicializado por el usuario
    if (isFormInitialized) {
      debouncedSaveFormData(formData, submitString);
    }
  }, [formData, debouncedSaveFormData, isFormInitialized]);

  // Debounced global filter handler
  const debouncedGlobalFilter = useMemo(
    () =>
      debounce((value) => {
        setGlobalFilter(value);
        setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
      }, 300),
    []
  );


  const handleTestInputChange = useCallback((examination_type_id, event) => {
    const { name, value } = event.target;

    // Use immediate update for better UX, but debounce heavy operations
    setFormData((prev) => {
      // Early return if value hasn't changed
      if (
        prev.tests?.[examination_type_id]?.testValues?.[name]?.value === value
      ) {
        return prev;
      }

      return {
        ...prev,
        tests: {
          ...prev.tests,
          [examination_type_id]: {
            ...prev.tests[examination_type_id],
            testValues: {
              ...prev.tests[examination_type_id].testValues,
              [name]: {
                ...prev.tests[examination_type_id].testValues[name],
                value,
              },
            },
          },
        },
      };
    });

    setIsFormInitialized(true); // ← Activar guardado automático

  }, []);

  const handlePatientInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      patient: {
        ...prev.patient,
        [name]: value,
      },
    }));

    setIsFormInitialized(true); // ← Activar guardado automático

  }, []);

  const handleValidatedChange = useCallback((examTypeId, e) => {
    const checked = e.target.checked;
    setFormData((prev) => {
      const newTests = {
        ...prev.tests,
        [examTypeId]: {
          ...prev.tests[examTypeId],
          validated: checked,
        },
      };

      // Check if all exam types are validated
      const all_validated = Object.values(newTests).every(
        (test) => test.validated === true
      );
    setIsFormInitialized(true); // ← Activar guardado automático

      return {
        ...prev,
        tests: newTests,
        all_validated: all_validated,
      };
    });


    
  }, []);


  const [prosecingSearchPatient, setProsecingSearchPatient] = useState(false);
  const searchPatient = debounce(async (ci) => {
    console.log("Searching patient...", ci);
    setProsecingSearchPatient(true); // Cambiar a verdadero antes de la búsqueda

    try {
      const res = await externalApi.get(`/patients?ci=${ci}`);
      if (res.data.data.data.length === 0) {
        console.log("No se encontró el paciente");
        setFormData((prev) => ({
          ...prev,
          patient: {
            ...prev.patient,
            patient_id: null,
          },
        }));
        return;
      } else {
        console.log(res.data.data.data[0], "Se encontró el paciente");
        setFormData((prev) => ({
          ...prev,
          patient: {
            ...prev.patient,
            first_name: res.data.data.data[0]?.name,
            ...res.data.data.data[0],
            patient_id: res.data.data.data[0]?.id,
          },
        }));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setProsecingSearchPatient(false); // Cambiar a falso después de la búsqueda
    }
  }, 280);

  return (
    <>
      <title>Exámenes Médicos - LabFalcón</title>
      <div style={{ height: 580, width: "100%" }}>
        <div className="md:flex justify-between items-center mb-4">
          <h1 className="text-lg md:text-2xl font-bold mb-2 md:mb-0">
            Exámenes médicos
          </h1>

          <div className="flex gap-3">
            {isThereLocalStorageFormData && (
              <button
              title="Restaurar formulario sin guardar"
                className="hover:shadow-lg hover:bg-gray-100 flex gap-1 items-center text-gray-600 bg-gray-200 rounded-xl font-bold px-3"
                onClick={() => {
                  
                  setFormData(JSON.parse(localStorage.getItem("formData")));
                  setSubmitString(JSON.parse(localStorage.getItem("submitString")));
                  setIsModalOpen(true);
                }}
              >
                <small className="text-gray-500">
                  Recuperar 
                </small>
                <Icon icon="line-md:backup-restore" className="w-6 h-6 text-gray-500  " />
              </button>
            )}
           
            <FuturisticButton
              onClick={() => {
                setIsModalOpen(true);
                if (submitString === "Actualizar") {
                  setSubmitString("Registrar");
                  setFormData(structuredClone(defaultFormData));
                }
              }}
            >
              Registrar exámen
            </FuturisticButton>
          </div>
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            // Opcional: también limpiar localStorage aquí si quieres
          }}
          title="Registrar exámen"
          size="xl"
        >
          <form
            className={`md:grid grid-cols-2 space-y-5 md:space-y-0 gap-7 w-full relative`}
            onSubmit={onSubmit}
          >
            <div className="space-y-3 z-10">
              <h2 className="text-xl font-bold mb-2">
                Información del Paciente
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {formData?.patient?.ci.length >= 6 && (
                  <div className="w-full col-span-2 h-6 overflow-hidden text-center">
                    {prosecingSearchPatient ? (
                      <Icon
                        icon="eos-icons:three-dots-loading"
                        className="text-3xl inline-block mx-auto"
                      />
                    ) : formData?.patient.patient_id !== null ? (
                      <span className="flex items-center gap-2 text-center mx-auto justify-center">
                        <Icon
                          icon="iconoir:settings-profiles"
                          className="text-2xl text-color3"
                        />
                        <small>Paciente Registrado con historia</small>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-center mx-auto justify-center">
                        <Icon icon="clarity:new-line" className="text-3xl" />
                        <small>Nuevo paciente sin historia</small>
                      </span>
                    )}
                  </div>
                )}
                {patientFormFields.map((field) => {
                  if (field.name === "ci") {
                    return (
                      <div key={field.name}>
                        <FormField
                          {...field}
                          value={formData.patient?.[field.name]}
                     
                          onInput={(e) => {
                            formData.patient.patient_id = null;
                            handlePatientInputChange(e);
                            if (e.target.value.length >= 6) {
                              setProsecingSearchPatient(true);
                              searchPatient(e.target.value);
                            }
                          }}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <FormField
                        key={field.name}
                        {...field}
                        value={formData.patient?.[field.name]}
                        onChange={handlePatientInputChange}
                      />
                    );
                  }
                })}
              </div>
            </div>
            <div className="space-y-3 z-10 ">
              <h2 className="text-xl font-bold">Resultados del Exámen</h2>

                
              {Object.entries(formData.tests || {}).length === 0 ? (
                <p>Seleccione al menos un tipo de exámen</p>
              ) : (

                <>
                {Object.keys(formData?.tests || {})?.map((key,i) => (
                  <div
                    key={key}
                    className="bg-color4 p-3 rounded-xl shadow-md mb-1 bg-opacity-5"
                  >
                   
                    <div className="flex justify-between items-center ">
                      <h3 className="text-lg font-bold text-color1 mb-4">
                        {formData.tests[key]?.testTypeName}
                      </h3>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        aria-label="Close"
                        onClick={() => {
                          setFormData((prev) => {
                            const { [key]: value, ...rest } = prev.tests;

                            return {
                              ...prev,
                              tests: rest,
                            };
                          });
                        }}
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-col md:grid  md:grid-cols-2 gap-4">
                      {Object.entries(
                        formData.tests[key]?.testValues || {}
                      )?.map(([name, field, type, labels], i) => (
                        <React.Fragment key={name}>
                          {i === 0 && key == 7 && (
                            <div className="flex justify-between items-center col-span-2">
                              <h3 className="text-md font-bold text-gray-600 ml-2">
                                Examen Físico
                              </h3>
                            </div>
                          )}
                          {i === 5 && key == 7 && (
                            <div className="flex justify-between items-center mt-4 col-span-2">
                              <h3 className="text-md font-bold text-gray-600 ml-2">
                                Examen Microscópico
                              </h3>
                            </div>
                          )}
                          {i === 13 && key == 7 && (
                            <div className="flex justify-between items-center mt-4 col-span-2">
                              <h3 className="text-md font-bold text-gray-600 ml-2">
                                Examen Químico
                              </h3>
                            </div>
                          )}
                          <MemoizedTestField
                            field={field}
                            value={formData.tests[key]?.testValues?.[name]?.value}
                            onChange={handleTestInputChange}
                            testKey={key}
                            fieldName={name}
                          />

                        </React.Fragment>
                      ))}
                      <div className="cursor-pointer   ml-auto col-span-2 flex items-center gap-3">
                        <input
                          type="checkbox"
                          name={`validated-${key}`}
                          readOnly={user?.allow_validate_exam === false}
                          onChange={(e) => {
                            if (user?.allow_validate_exam === false) return;
                            handleValidatedChange(key, e);
                          }}
                          className="invisible"
                          // onChange={(e) => handleValidatedChange(key, e)}
                          checked={formData.tests[key]?.validated || false}
                          id={`validated-${key}`}
                        />

                        <label
                          className="cursor-pointer hover:bg-green-100 rounded-xl p-2"
                          htmlFor={`validated-${key}`}
                        >
                          {formData.tests[key]?.validated ? (
                            <span className="flex gap-2 items-center">
                              <small className="text-gray-400">Validado</small>
                              <Icon
                                className="text-color2 w-9 h-9 "
                                icon="bitcoin-icons:verify-filled"
                              />
                            </span>
                          ) : (
                            <span className="flex gap-2 items-center">
                              <small className="text-gray-400">
                                No Validado
                              </small>
                              <Icon
                                icon="octicon:unverifed-24"
                                className="text-gray-600 w-6 h-6"
                              />
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                </>
              )}
              <div className="flex flex-col md:grid  md:grid-cols-2 gap-3 md:gap-6">
                {examinationTypes.map((examType) => {
                  if (formData.tests[examType.id]) {
                    return null;
                  }
                  return (
                    <button
                      type="button"
                      key={examType.id}
                      className="hover bg-gray-200 py-2 md:py-5 hover:bg-gray-300 rounded "
                      onClick={() => {
                        const newtestValues = examType.tests.reduce(
                          (acc, test) => {
                            acc[test.name] = {
                              ...test,
                              value: "", // Add empty value field
                            };
                            return acc;
                          },
                          {}
                        );
                        setFormData((prev) => ({
                          ...prev,
                          all_validated: false,
                          tests: {
                            [examType.id]: {
                              testValues: newtestValues,
                              testTypeName: examType.name,
                              testTypeId: examType.id,
                              validated: false,
                            },
                            ...prev.tests,
                          },
                        }));
                        setTimeout(() => {
                          document
                            .querySelector(
                              `input[name=${examType.tests[0].name}]`
                            )
                            .focus();
                        }, 120);
                      }}
                    >
                      {examType.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="col-span-2">
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  className={`px-16 py-3 rounded-md font-semibold ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    submitString == "Actualizar"
                      ? "bg-color4 text-color1"
                      : "bg-color1 text-color4"
                  }`}
                >
                  {loading ? "Procesando..." : submitString}
                </button>
              </div>
            </div>
          </form>
        </Modal>
        {!isModalOpen && (
          <div
            className="ag-theme-alpine ag-grid-no-border"
            style={{ height: 500 }}
          >
            {
              <MaterialReactTable
                columns={columns}
                data={data}
                rowCount={rowCount}
                manualPagination
                manualSorting
                manualFiltering
                manualGlobalFilter
                initialState={{
                  density: "compact",
                }}
                state={{
                  pagination,
                  sorting,
                  columnFilters,
                  globalFilter,
                  isLoading,
                }}
                onPaginationChange={setPagination}
                onSortingChange={setSorting}
                onColumnFiltersChange={setColumnFilters}
                onGlobalFilterChange={(value) => debouncedGlobalFilter(value)}
                enableGlobalFilter={true}
                enableColumnFilters={true}
                enableSorting={true}
                enableFilters={true}
                muiTablePaginationProps={{
                  rowsPerPageOptions: [25, 50, 100],
                  showFirstButton: true,
                  showLastButton: true,
                }}
                muiSearchTextFieldProps={{
                  placeholder: "Buscar",
                  sx: { minWidth: "300px" },
                  variant: "outlined",
                }}
              />
            }
          </div>
        )}

        <Modal
          title="Enviar mensaje"
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
        >
          <div className="flex gap-4">
            <button
              title="Enviar por correo"
              onClick={() => loadingMessage || handleMessage()}
              className="hover:bg-color1 hover:text-white duration-100 bg-gray-200 rounded-xl  p-3 px-4  flex items-center gap-2 "
            >
              {loadingMessage ? (
                <CircularProgress size={20} />
              ) : (
                <Icon icon="line-md:email-twotone" className="w-10 h-10"></Icon>
              )}
              <span className="text-sm">
                {loadingMessage ? "Enviando..." : "Enviar por correo"}{" "}
              </span>
            </button>

            <a
              title="Enviar por WhatsApp"
              onClick={() => {
                setIsMessageModalOpen(false);
                setIsMessageSentModalOpen(true);
              }}
              href={`https://wa.me/${
                messageData?.patient?.phone_number.replace(/[ -]/g, '')
              }?text=Hola ${
                messageData?.patient?.first_name
              }, le escribimos desde el laboratorio de Secretaria de Salud Falcón, para informarle que sus resultados están listos y puede acceder a ellos en el siguiente enlace:%0A${
                window.location.origin
              }/results/${resultsToken || "cargando..."}`}
              target="_blank"
              className="hover:bg-color1 hover:text-white duration-100 bg-gray-200 rounded-xl p-3 px-5  flex items-center gap-2 "
            >
              <Icon icon="logos:whatsapp-icon" className="w-10 h-10"></Icon>
              <span className="text-sm">Enviar por WhatsApp</span>
            </a>
          </div>
        </Modal>

        <Modal
          title="¿El mensaje de WhatsApp fue enviado?"
          isOpen={isMessageSentModalOpen}
          onClose={() => setIsMessageSentModalOpen(false)}
        >
          <p>
            A diferencia de enviar el mensaje por correo, con WhatsApp no
            sabemos si fue enviado o no, por lo tanto, necesitamos su
            confirmación.
          </p>
          <div className="flex gap-4 justify-between mt-4">
            <button
              onClick={() => setIsMessageSentModalOpen(false)}
              className="bg-gray-300 hover:shadow-xl hover:brightness-110 rounded-xl p-3 px-5"
            >
              No
            </button>
            <button
              onClick={() => handleWhatsAppMessageSent()}
              className="bg-color2 hover:shadow-xl hover:brightness-110 text-white rounded-xl p-3 px-5"
            >
              Sí, se envió
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
