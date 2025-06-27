import React, { useState, useEffect, useCallback } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { examinationTypesAPI } from "../../services/api";
import { Icon } from "@iconify/react";
import Modal from "../../components/Modal";
import FuturisticButton from "../../components/FuturisticButton";
import FormField from "../../components/forms/FormField";
import { CircularProgress } from "@mui/material";
import { exams } from "../../services/api";
import { useFeedback } from "../../context/FeedbackContext";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
ModuleRegistry.registerModules([AllCommunityModule]);

// En las versiones más recientes, no necesitas registrar módulos para funcionalidades básicas
// La versión Community ya incluye el ClientSideRowModel por defecto

// Función reutilizable para crear operadores de filtro para columnas de texto
const ActionCellRenderer = (props) => {
  const handleEdit = () => {
    console.log("Edit clicked", props.data);
    // implement your logic here
  };

  const handleDelete = () => {
    console.log("Delete clicked", props.data);
    // implement your logic here
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "5px",
        justifyContent: "center",
        gap: "10px",
      }}
      className="flex  h-full justify-center items-center"
    >
      <button onClick={handleEdit}>
        <Icon icon="hugeicons:edit-02" width={20} height={20} />
      </button>
      <button onClick={handleDelete}>
        {" "}
        <Icon icon="hugeicons:delete-02" width={20} height={20} />
      </button>
    </div>
  );
};
export default function Page() {
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useFeedback();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examinationTypes, setExaminationTypes] = useState([]);
  const [typeExaminationSelected, setTypeExaminationSelected] = useState("");

  // Form configuration for ReusableForm
  const patientFormFields = [
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
        { value: "male", label: "Masculino" },
        { value: "female", label: "Femenino" },
      ],
      required: true,
      className: "col-span-1",
    },
  ];
  const [formData, setFormData] = useState({
    patient: {
      ci: "",
      first_name: "",
      last_name: "",
      date_birth: "",
      email: "",
      phone_number: "",
      address: "",
      gender: "",
    },
    validated: false,
    testTypeId: "",
    testTypeName: "",
    testsValues: {},
  });
  const [typeExaminationFields, setTypeExaminationFields] = useState([
    {
      name: "email",
      label: "Correo Electrónico",
      type: "email",
      required: true,
      placeholder: "usuario@hospital.com",
      className: "col-span-2",
    },
    {
      name: "firstName",
      label: "Nombre",
      type: "text",
      required: true,
      className: "col-span-1",
    },
  ]);

  const validationRules = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    firstName: {
      minLength: 2,
      maxLength: 50,
    },
    lastName: {
      minLength: 2,
      maxLength: 50,
    },
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await exams.createExam(formData);
      showSuccess("Operación completada con éxito");

      // Reset form if no onCancel (meaning it's not a modal)
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (submittedFormData) => {
    const userData = {
      name: submittedFormData.firstName,
      last_name: submittedFormData.lastName,
      email: submittedFormData.email,
      allow_validate_exam: submittedFormData.allow_validate_exam || false,
      allow_handle_users: submittedFormData.allow_handle_users || false,
    };

    await usersAPI.createUser(userData);

    // Reset form data after successful submission
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      allow_validate_exam: false,
      allow_handle_users: false,
    });

    setIsModalOpen(false);
    fetchData();
  };
  console.log(formData);
  const [colDefs] = useState([
    { field: "id", headerName: "ID", width: 75 },
    {
      field: "firstName",
      headerName: "Nombre",
      width: 110,
    },
    {
      field: "lastName",
      headerName: "Apellido",
      width: 120,
    },
    {
      field: "age",
      headerName: "Edad",
      type: "number",
      width: 70,
    },
    {
      field: "ci",
      headerName: "C.I",
      width: 100,
    },
    {
      field: "testType",
      headerName: "Tipo de Examen",
      width: 175,
    },

    {
      field: "date",
      headerName: "Fecha",
      type: "date",
      width: 110,
    },
    {
      field: "time",
      headerName: "Hora",
      width: 100,
    },
    {
      field: "validated",
      headerName: "Validado",
      type: "boolean",
      width: 110,
    },
    // {
    //   field: "originService",
    //   headerName: "Servicio de Procedencia",
    //   width: 180,
    // },
    {
      field: "actions",
      headerName: "",
      // width: "auto",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Link
          href={`/dashboard/examenes/${params.row.id}`}
          title="Ver Detalles"
          className="hover:bg-color1 hover:bg-opacity-5  text-blue-600 hover:text-blue-800 w-full inline-block h-full  items-center text-xl"
        >
          →
        </Link>
      ),
    },
  ]);

  const [rowData, setRowData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await usersAPI.getAllUsers();
      console.log(res.data);
      setRowData(res.data.users);
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

  function handleTestInputChange(event) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      testsValues: {
        ...formData.testsValues,
        [name]: {
          ...formData.testsValues[name],
          value,
        },
      },
    });
  }

  function handlePatientInputChange(event) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      patient: {
        ...formData.patient,
        [name]: value,
      },
    });
  }
  return (
    <div style={{ height: 580, width: "100%" }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Exámenes médicos</h1>
        <FuturisticButton onClick={() => setIsModalOpen(true)}>
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
        <form
          className={`grid grid-cols-2 gap-10 w-full `}
          onSubmit={onSubmit}
        >
          <div className="space-y-3">
            <h2 className="text-xl font-bold mb-2">Información del Paciente</h2>
            <div className="grid grid-cols-2 gap-4">
              {patientFormFields.map((field) => (
                <FormField
                  key={field.name}
                  {...field}
                  value={formData.patient?.[field.name]}
                  onChange={handlePatientInputChange}
                />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Resultados del Exámen</h2>
            {typeExaminationSelected && (
              <div className="flex gap-2 pb-2 items-center">
                <button
                  onClick={() => setTypeExaminationSelected("")}
                  className="hover:bg-gray-200 p-2 rounded-full"
                >
                  <Icon icon="ep:back" width={20} height={20} />
                </button>
                <p>{typeExaminationSelected}</p>
              </div>
            )}
            {typeExaminationSelected == "" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {examinationTypes.map((examType) => {
                    return (
                      <button
                        key={examType.id}
                        className="hover bg-gray-200 py-5 hover:bg-gray-300 rounded "
                        onClick={() => {
                          console.log(examType.tests);
                          setTypeExaminationFields(examType.tests);
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
              >
                {loading ? "Procesando..." : "Registrar"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
      <div
        className="ag-theme-alpine ag-grid-no-border"
        style={{ height: 500 }}
      >
        <AgGridReact
          columnDefs={colDefs}
          rowData={[
            {
              id: 1000000,
              ci: "12345678",
              lastName: "Villasmil Tovar",
              firstName: "Juan Francisco",
              age: 14,
              testType: "Hematología Completa",
              originService: "Trabajador",
              date: new Date("2024-01-15"),
              time: "08:30 am",
              validated: true,
            },
            {
              id: 2,
              ci: "23456789",
              lastName: "Lannister",
              firstName: "Cersei",
              age: 31,
              testType: "Examen de Heces",
              originService: "UBCH",
              date: new Date("2024-10-16"),
              time: "10:15 am",
              validated: false,
            },
            {
              id: 3,
              ci: "34567890",
              lastName: "Lannister",
              firstName: "Jaime",
              age: 31,
              testType: "Examen de Orina",
              originService: "Hospitalization",
              date: new Date("2024-01-17"),
              time: "14:45 pm",
              validated: true,
            },
            {
              id: 4,
              ci: "45678901",
              lastName: "Stark",
              firstName: "Arya",
              age: 11,
              testType: "Química Sanguínea",
              originService: "1x10",
              date: new Date("2024-01-18"),
              time: "09:00 pm",
              validated: false,
            },
            {
              id: 5,
              ci: "56789012",
              lastName: "Targaryen",
              firstName: "Daenerys",
              age: null,
              testType: "Perfil Lipídico",
              originService: "UBCH",
              date: new Date("2024-01-19"),
              time: "11:30 am",
              validated: true,
            },
            {
              id: 6,
              ci: "67890123",
              lastName: "Melisandre",
              firstName: null,
              age: 150,
              testType: "Perfil Tiroideo",
              originService: "Plan quirúrgico",
              date: new Date("2024-01-20"),
              time: "13:15 pm",
              validated: false,
            },
            {
              id: 7,
              ci: "78901234",
              lastName: "Clifford",
              firstName: "Ferrara",
              age: 44,
              testType: "Electrocardiograma",
              originService: "Oncología",
              date: new Date("2024-11-22"),
              time: "07:45 am",
              validated: true,
            },
            {
              id: 8,
              ci: "89012345",
              lastName: "Frances",
              firstName: "Rossini",
              age: 36,
              testType: "Radiografía de Tórax",
              originService: "Trabajador",
              date: new Date("2024-01-23"),
              time: "16:20 am",
              validated: false,
            },
            {
              id: 9,
              ci: "90123456",
              lastName: "Roxie",
              firstName: "Harvey",
              age: 65,
              testType: "Ecografía Abdominal",
              originService: "Hospitalization",
              date: new Date("2024-12-24"),
              time: "12:00 pm",
              validated: true,
            },
          ]}
          theme="legacy"
        />
      </div>
    </div>
  );
}
