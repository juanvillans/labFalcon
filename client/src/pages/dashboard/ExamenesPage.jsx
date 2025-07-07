import React, { useState, useEffect, useCallback, useMemo } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { examinationTypesAPI, examsAPI } from "../../services/api";
import externalApi from "../../services/saludfalcon.api";
import { Icon } from "@iconify/react";
import Modal from "../../components/Modal";
import FuturisticButton from "../../components/FuturisticButton";
import FormField from "../../components/forms/FormField";
import { CircularProgress } from "@mui/material";
import { useFeedback } from "../../context/FeedbackContext";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useAuth } from "../../context/AuthContext";
import PrintPage from "../../components/PrintableExamResult";
import debounce from "lodash.debounce";
import axios from "axios";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Page() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useFeedback();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examinationTypes, setExaminationTypes] = useState([]);
  const [typeExaminationSelected, setTypeExaminationSelected] = useState("");

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
      required: true,
      className: "col-span-1",
    },
    {
      name: "sex",
      label: "Género",
      type: "select",
      options: [
        { value: "Masculino", label: "Masculino" },
        { value: "Femenino", label: "Femenino" },
      ],
      required: true,
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
    validated: false,
    testTypeId: null,
    testTypeName: "",
    testsValues: {},
  };
  const [formData, setFormData] = useState(structuredClone(defaultFormData));

  const [submitString, setSubmitString] = useState("Registrar");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log({ formData });

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
      fetchData();

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

  const [colDefs] = useState([
    { field: "id", headerName: "Cód", width: 60 },
    {
      field: "first_name",
      headerName: "Nombre",
      width: 110,
      filter: "agTextColumnFilter",
    },
    {
      field: "last_name",
      headerName: "Apellido",
      width: 120,
      filter: "agTextColumnFilter",
    },
    {
      field: "age",
      headerName: "Edad",
      type: "number",
      width: 83,
      filter: "agNumberColumnFilter",
    },
    {
      field: "ci",
      headerName: "C.I",
      width: 100,
      filter: "agTextColumnFilter",
    },
    {
      field: "examination_type_name",
      headerName: "Tipo de Examen",
      width: 175,
    },

    {
      field: "created_date",
      headerName: "Fecha",
      filter: "agDateColumnFilter",
      filterParams: {
        comparator: (filterLocalDate, cellValue) => {
          // Custom date comparison logic
          return new Date(cellValue) - filterLocalDate;
        },
      },
      width: 125,
    },
    {
      field: "created_time",
      filter: "agTextColumnFilter",
      headerName: "Hora",
      width: 100,
    },
    {
      field: "validated",
      headerName: "Validado",
      type: "boolean",
      width: 100,
      filter: "agSetColumnFilter",
    },
    {
      field: "validated",
      headerName: "Recibido",
      width: 90,
      cellRenderer: (params) => {
        if (params.value) {
          return <Icon icon="bitcoin-icons:check-outline" width={20} height={20} />;
        }
      }
    },
    {
      headerName: "Acciones",
      field: "actions",
      cellRenderer: (params) => (
        <div className="flex relative -top-1.5  h-full gap-2 justify-center items-center">
          <button
            onClick={(e) => {
              setIsModalOpen(true);
              console.log(params.data);
              setFormData({
                patient: {
                  ci: params.data.ci,
                  first_name: params.data.first_name,
                  last_name: params.data.last_name,
                  date_birth: params.data.date_birth,
                  email: params.data.email,
                  phone_number: params.data.phone_number,
                  address: params.data.address,
                  sex: params.data.sex,
                },
                id: params.data.id,
                validated: params.data.validated,
                testTypeId: params.data.examination_type_id,
                testTypeName: params.data.examination_type_name,
                testsValues: params.data.test_values,
              });
              setSubmitString("Actualizar");
            }}
            title="Editar"
          >
            <Icon icon="hugeicons:edit-02" width={20} height={20} />
          </button>

          <PrintPage data={params.data} />
          <button
            title="Enviar mensaje"
            className="mx-1 p-1 hover:bg-blue-100 rounded-full"
          >
            <Icon icon="carbon:send-alt" className="w-6 h-6 text-gray-500" />
          </button>
          <button
            onClick={() => handleDelete(params.data.id)}
            title="Eliminar"
            className="ml-auto"
          >
            <Icon icon="heroicons:trash" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      ),
      flex: 1,
      sortable: false,
      filterable: false,
    },
  ]);

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

  console.log(formData)

  const [rowData, setRowData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await examsAPI.getExams();
      console.log(res.data);
      setRowData(res.data.exams);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  }, []);

  const getExaminationTypes = useCallback(async () => {
    try {
      const res = await examinationTypesAPI.getExaminationTypes();
      console.log(res.data);
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

  const handleTestInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      testsValues: {
        ...prev.testsValues,
        [name]: {
          ...prev.testsValues[name],
          value,
        },
      },
    }));
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
  }, []);

  const [prosecingSearchPatient, setProsecingSearchPatient] = useState(false);
  const searchPatient = debounce(async (ci) => {
    setProsecingSearchPatient(true); // Cambiar a verdadero antes de la búsqueda

    try {
      const res = await externalApi.get(`/patients?ci=${ci}`);
      if (res.data.data.data.length === 0 ) {
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
    <div style={{ height: 580, width: "100%" }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Exámenes médicos</h1>
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title="Registrar exámen"
        size="xl"
      >
        <form className={`grid grid-cols-2 gap-10 w-full relative`} onSubmit={onSubmit}>
          <div className="space-y-3 z-10">
            <h2 className="text-xl font-bold mb-2">Información del Paciente</h2>
            <div className="grid grid-cols-2 gap-4">
              {patientFormFields.map((field) => {
                if (field.name === "ci") {
                  return (
                    <>
                      {formData?.patient.ci.length >= 6 && (
                        <div
                          key={field.name}
                          className="w-full col-span-2 h-6 overflow-hidden text-center"
                        >
                          {prosecingSearchPatient ? (
                            <Icon
                              icon="eos-icons:three-dots-loading"
                              className="text-3xl"
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
                              <Icon
                                icon="clarity:new-line"
                                className="text-3xl"
                              />
                              <small>Nuevo paciente sin historia</small>
                            </span>
                          )}
                        </div>
                      )}
                      <FormField
                        {...field}
                        value={formData.patient?.[field.name]}
                        onPaste={(e) => {
                          // Manejar pegado específicamente
                          const pastedValue = e.clipboardData.getData('text');
                          formData.patient.patient_id = null;
                          
                          // Actualizar el valor del campo
                          const syntheticEvent = {
                            target: {
                              name: field.name,
                              value: pastedValue
                            }
                          };
                          
                          handlePatientInputChange(syntheticEvent);
                          
                          if (pastedValue.length >= 6) {
                            setProsecingSearchPatient(true);
                            searchPatient(pastedValue);
                          }
                        }}
                        onInput={(e) => {
                          formData.patient.patient_id = null;
                          handlePatientInputChange(e);
                          if (formData.patient.ci.length >= 6) {
                            setProsecingSearchPatient(true);
                            searchPatient(e.target.value);
                          }
                        }}
                      />
                    </>
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
          <div className="space-y-3 z-10">
            <h2 className="text-xl font-bold">Resultados del Exámen</h2>
            {formData.testTypeId !== null && (
              <div className="flex gap-2 pb-2 items-center">
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      testTypeId: null,
                      testTypeName: "",
                      testsValues: {},
                    }))
                  }
                  className="hover:bg-gray-200 p-2 rounded-full"
                >
                  <Icon icon="ep:back" width={20} height={20} />
                </button>
                <p>{formData.testTypeName}</p>
              </div>
            )}
            {formData.testTypeId == null ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {examinationTypes.map((examType) => {
                    return (
                      <button
                        type="button"
                        key={examType.id}
                        className="hover bg-gray-200 py-5 hover:bg-gray-300 rounded "
                        onClick={() => {
                          const formFieldsStructure = examType.tests.reduce(
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
                            testsValues: formFieldsStructure,
                            testTypeName: examType.name,
                            testTypeId: examType.id,
                          }));
                          setTypeExaminationSelected(examType.name);
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
              </>
            ) : (
              <>
                {Object.entries(formData.testsValues).map(([name, field]) => (
                  <FormField
                    key={name}
                    {...field}
                    value={formData.testsValues[name].value}
                    onChange={handleTestInputChange}
                  />
                ))}
                <div className="ml-auto w-fit flex gap-3">
                  <input
                    type="checkbox"
                    name="validated"
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        validated: e.target.checked,
                      }));
                    }}
                    checked={formData.validated}
                    id=""
                  />
                  <label htmlFor="validated">Validado</label>
                </div>
              </>
            )}
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
      <div
        className="ag-theme-alpine ag-grid-no-border"
        style={{ height: 500 }}
      >
        <AgGridReact enableCellTextSelection={true} columnDefs={colDefs} rowData={rowData} theme="legacy" />
      </div>
    </div>
  );
}
