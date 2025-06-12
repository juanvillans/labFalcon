import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";

const rows = [
  {
    id: 1,
    role: "Administrador del Sistema",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@hospital.com",
    canValidate: true,
    canManageUsers: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 34,
    role: "Médico Cardiólogo",
    firstName: "María",
    lastName: "Martínez",
    email: "maria.martinez@hospital.com",
    canValidate: true,
    canManageUsers: false,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 3,
    role: "Enfermera de UCI",
    firstName: "Ana",
    lastName: "López",
    email: "ana.lopez@hospital.com",
    canValidate: false,
    canManageUsers: false,
    createdAt: new Date("2024-01-25"),
  },
  {
    id: 4,
    role: "Técnico en Laboratorio",
    firstName: "Carlos",
    lastName: "García",
    email: "carlos.garcia@hospital.com",
    canValidate: false,
    canManageUsers: false,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: 5,
    role: "Médico Internista",
    firstName: "Luis",
    lastName: "Rodríguez",
    email: "luis.rodriguez@hospital.com",
    canValidate: true,
    canManageUsers: false,
    createdAt: new Date("2024-02-05"),
  },
  {
    id: 6,
    role: "Coordinador de Recursos Humanos",
    firstName: "Carmen",
    lastName: "Fernández",
    email: "carmen.fernandez@hospital.com",
    canValidate: false,
    canManageUsers: true,
    createdAt: new Date("2024-02-10"),
  },
];

const columns = [
  { field: "id", headerName: "ID", width: 60 },
  // {
  //   field: "role",
  //   headerName: "Rol ó Cargo",
  //   width: 150,
  //   filterable: false,
  // },
  {
    field: "firstName",
    headerName: "Nombre",
    width: 150,
  },
  {
    field: "lastName",
    headerName: "Apellido",
    width: 150,
  },
  {
    field: "email",
    headerName: "Correo Electrónico",
    width: 200,
  },
  {
    field: "canValidate",
    headerName: "Puede Validar",
    type: "boolean",
    width: 130,
  },
  {
    field: "canManageUsers",
    headerName: "Gestión de Usuarios",
    type: "boolean",
    width: 180,
  },

  {
    field: "actions",
    headerName: "",
    flex: 1,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Link
        href={`/dashboard/usuarios/${params.row.id}`}
        title="Ver Detalles"
        className="hover:bg-color1 hover:bg-opacity-5  text-blue-600 hover:text-blue-800 w-full inline-block h-full  items-center text-xl"
      >
        →
      </Link>
    ),
  },
];

export default function Page() {
  return (
    <div style={{ height: 580, width: "100%" }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Link href="/dashboard/usuarios/crear" className="button-29">
          <button className="" role="button">
            Crear Usuario
          </button>
        </Link>
      </div>

      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
        sx={{
          "& .MuiDataGrid-root": {
            borderRadius: "26px !important",
            overflow: "hidden !important",
          },
          "& .MuiDataGrid-columnHeaders": {
            borderTopLeftRadius: "26px !important",
            borderTopRightRadius: "26px !important",
            backgroundColor: "#f5f5f5", // Optional: Header background
          },
          "& .MuiDataGrid-footerContainer": {
            borderBottomLeftRadius: "26px !important",
            borderBottomRightRadius: "26px !important",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            color: "#011140",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-row": {
            borderBottom: "1px solid #f0f0f0",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #f0f0f0",
          },
        }}
      />
    </div>
  );
}
