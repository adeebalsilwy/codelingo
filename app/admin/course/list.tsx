import { 
  Datagrid, 
  List, 
  TextField, 
  SearchInput, 
  TextInput, 
  FilterForm, 
  CreateButton, 
  ExportButton, 
  TopToolbar, 
  ImageField,
  Pagination,
  EditButton,
  DeleteButton
} from "react-admin";
import { Card, CardContent } from "@mui/material";
import RefreshButton from "../utils/RefreshButton";

const filters = [
  <SearchInput key="search" source="q" alwaysOn />,
  <TextInput key="title" label="Title" source="title" />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterForm filters={filters} />
    <CreateButton />
    <ExportButton />
    <RefreshButton resource="courses" />
  </TopToolbar>
);

// Custom pagination component with selectable page sizes
const CustomPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />;

export const CourseList = () => {
  return (
    <Card>
      <CardContent>
        <List
          actions={<ListActions />}
          filters={filters}
          sort={{ field: "id", order: "DESC" }}
          pagination={false}  
          perPage={-1}  // Signal to fetch all data
          // Add debounce to avoid excessive requests
          debounce={300}
        >
          <Datagrid
            rowClick={false}
            bulkActionButtons={false}
            hover
          >
            <TextField source="id" />
            <TextField source="title" sortable={true} />
            <ImageField source="imageSrc" title="Image" />
            <EditButton />
            <DeleteButton />
          </Datagrid>
        </List>
      </CardContent>
    </Card>
  );
};
