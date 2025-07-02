import React, { useState, useEffect, useCallback } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { usersAPI } from "../../services/api";
import { Icon } from "@iconify/react";
import Modal from "../../components/Modal";
import FuturisticButton from "../../components/FuturisticButton";

import { ReusableForm } from "../../components/forms";

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
ModuleRegistry.registerModules([AllCommunityModule]);

// En las versiones más recientes, no necesitas registrar módulos para funcionalidades básicas
// La versión Community ya incluye el ClientSideRowModel por defecto

// Función reutilizable para crear operadores de filtro para columnas de texto

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const defaultFormData = {
    email: '',
    first_name: '',
    last_name: '',
    allow_validate_exam: false,
    allow_handle_users: false,
  };
  const [formData, setFormData] = useState(structuredClone(defaultFormData));
  const [submitString, setSubmitString] = useState("Crear");

  // Form configuration for ReusableForm
  const userFormFields = [
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      placeholder: 'usuario@hospital.com',
      className: 'col-span-2'
    },
    {
      name: 'first_name',
      label: 'Nombre',
      type: 'text',
      required: true,
      className: 'col-span-1'
    },
    {
      name: 'last_name',
      label: 'Apellido',
      type: 'text',
      required: true,
      className: 'col-span-1'
    },
    {
      name: 'allow_validate_exam',
      label: 'Puede Validar Exámenes',
      type: 'checkbox',
      helperText: 'Permite al usuario validar y aprobar resultados de exámenes médicos'
    },
    {
      name: 'allow_handle_users',
      label: 'Puede Gestionar Usuarios',
      type: 'checkbox',
      helperText: 'Permite crear, editar y eliminar usuarios del sistema'
    }
    
  ];

  const validationRules = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    first_name: {
      minLength: 2,
      maxLength: 50
    },
    last_name: {
      minLength: 2,
      maxLength: 50
    }
  };

  const onSubmit = async (submittedFormData) => {
    console.log(submittedFormData);
    try {
      
      if (submitString === "Actualizar") {
        await usersAPI.updateUser(formData.id, submittedFormData);
        setSubmitString("Crear");
      } else {
        await usersAPI.createUser(submittedFormData);
      }
  
      // Reset form data after successful submission
      setFormData(structuredClone(defaultFormData));
  
  
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      throw new Error(error?.response?.data?.message || `Error al ${submitString.toLowerCase()} el usuario.`);
    }
  };

  const [colDefs] = useState([
    {
      field: "id",
      headerName: "ID",
      width: 75,
      filter: "agNumberColumnFilter",
    },
    {
      field: "first_name",
      headerName: "Nombre",
      width: 150,
      type: "string",
      filter: "agTextColumnFilter",
    },
    {
      field: "last_name",
      headerName: "Apellido",
      width: 150,
      type: "string",
      filter: "agTextColumnFilter",
    },
    {
      field: "email",
      headerName: "Correo Electrónico",
      width: 200,
      type: "string",
      filter: "agTextColumnFilter",
    },
    {
      field: "allow_validate_exam",
      headerName: "Puede Validar",
      type: "boolean",
      width: 130,
      filter: "agSetColumnFilter",
    },
    {
      field: "allow_handle_users",
      headerName: "Gestión de Usuarios",
      type: "boolean",
      width: 180,
      filter: "agSetColumnFilter",
    },
    {
      field: "status",
      headerName: "Estado",
      type: "string",
      width: 180,
      filter: 'agSetColumnFilter', // 👈 dropdown checkbox filter
   
    },
    {
      headerName: "Acciones",
      field: "actions",
      flex: 1,
      cellRenderer: (params) => (
        <div className="flex h-full gap-2 justify-center items-center">
          <button
            onClick={(e) => {
              setIsModalOpen(true);
              console.log(params.data);
              setFormData({...params.data});
              setSubmitString("Actualizar");
            }}
            title="Editar"
          >
            <Icon icon="hugeicons:edit-02" width={20} height={20} />
          </button>
        </div>
      ),
      filter: false,
      sortable: false,
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div style={{ height: 580, width: "100%" }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <FuturisticButton onClick={() => {
            if (submitString === "Actualizar") {
              setSubmitString("Crear");
            }
            setIsModalOpen(true)}
          }>
          Crear usuario
        </FuturisticButton>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
         
          setIsModalOpen(false);
        }}
        title="Crear Nuevo Usuario"
        size="md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReusableForm
            fields={userFormFields}
            onSubmit={onSubmit}
            onCancel={() => {
              setFormData({
                email: '',
                first_name: '',
                last_name: '',
                allow_validate_exam: false,
                allow_handle_users: false,
              });
              setIsModalOpen(false);
            }}
            submitText={submitString}
            cancelText="Cancelar"
            validationRules={validationRules}
            className="col-span-2"
            formData={formData}
            onFormDataChange={setFormData}
          />
        </div>

        {/* Activation Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            Información de activación
          </h3>
          <p className="text-sm text-blue-700">
            Se enviará un enlace de activación al correo electrónico del
            usuario. A través de este enlace, el usuario podrá establecer su
            contraseña y activar su cuenta.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            El enlace de activación caducará en 48 horas. Si el usuario no
            activa su cuenta en este tiempo, el usuario será eliminado.
          </p>
        </div>
      </Modal>
      <div className="ag-theme-alpine ag-grid-no-border" style={{ height: 500 }}>
        <AgGridReact
          columnDefs={colDefs}
          rowData={rowData}
          theme="legacy"
        />
      </div>
    </div>
  );
}
