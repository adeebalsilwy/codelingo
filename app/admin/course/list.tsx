import { Datagrid, List, TextField, ReferenceField, NumberField, SelectField, TopToolbar, CreateButton, ExportButton } from "react-admin";
import RefreshButton from "../utils/RefreshButton";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
    <RefreshButton resource="courses" />
  </TopToolbar>
);

export const CourseList = () => {
  return (
    <List
      perPage={25}
      actions={<ListActions />}
      disableAuthentication
      queryOptions={{
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: false,
       
        retry: 1
      }}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="title" />
        <SelectField
          source="type"
          choices={[
            { id: "LECTURE", name: "Lecture" },
            { id: "WORKSHOP", name: "Workshop" }
          ]}
        />
        <ReferenceField source="lessonId" reference="lessons" />
        <NumberField source="order" />
      </Datagrid>
    </List>
  );
};
