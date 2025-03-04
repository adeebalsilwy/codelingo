import { Datagrid, List, TextField, SearchInput, TextInput, FilterForm, CreateButton, ExportButton, TopToolbar } from "react-admin";
import { Card, CardContent } from "@mui/material";

const filters = [
  <SearchInput key="search" source="q" alwaysOn />,
  <TextInput key="title" label="Title" source="title" />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterForm filters={filters} />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export const CourseList = () => {
  return (
    <Card>
      <CardContent>
        <List
          actions={<ListActions />}
          filters={filters}
          sort={{ field: "id", order: "DESC" }}
        >
          <Datagrid
            rowClick="edit"
            bulkActionButtons={false}
            hover
          >
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="imageSrc" />
          </Datagrid>
        </List>
      </CardContent>
    </Card>
  );
};
