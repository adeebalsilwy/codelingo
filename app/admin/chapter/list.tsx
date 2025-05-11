import {
    List,
    Datagrid,
    TextField,
    EditButton,
    DeleteButton,
    ReferenceField,
    NumberField,
    FilterForm,
    TextInput,
    ReferenceInput,
    SelectInput,
    BooleanField,
    FunctionField,
    Pagination,
    TopToolbar,
    CreateButton,
    ExportButton
} from "react-admin";
import RefreshButton from "../utils/RefreshButton";

interface ChapterRecord {
  id: number;
    title: string;
    description: string;
  content: string;
  video_youtube: string;
    unitId: number;
    order: number;
}

interface ChapterListProps {
    unitId?: number;
}

const ChapterFilters = [
    <TextInput key="title" source="title" label="Search by Title" alwaysOn />,
    <ReferenceInput key="unitId" source="unitId" reference="units" label="Filter by Unit" alwaysOn>
        <SelectInput
            optionText={(record) => {
                if (!record) return "";
                const unit = record as { title: string; course: { title: string } };
                return unit.course ? `${unit.title} - ${unit.course.title}` : unit.title;
            }}
        />
    </ReferenceInput>,
];

// Custom pagination component with selectable page sizes
const CustomPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />;

// Custom actions toolbar with refresh button
const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
    <RefreshButton resource="chapters" label="Refresh" />
  </TopToolbar>
);

export const ChapterList = ({ unitId }: ChapterListProps) => {
    const filterDefaultValues = unitId ? { unitId } : undefined;
    const filter = unitId ? { unitId } : undefined;

    return (
        <List 
            filters={ChapterFilters} 
            filter={filter}
            pagination={false}
            perPage={-1}
            sort={{ field: "id", order: "DESC" }}
            actions={<ListActions />}
            disableAuthentication
            storeKey={`chapters-${Date.now()}`}
            queryOptions={{
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                refetchOnMount: true,
                retry: 1
            }}
        >
            <Datagrid>
                <TextField source="id" />
                <TextField source="title" />
                <ReferenceField
                    source="unitId"
                    reference="units"
                    label="Unit"
                    link={false}
                >
                    <FunctionField
                        render={(record: any) => {
                            if (!record) return "";
                            const unit = record as { title: string; course: { title: string } };
                            return unit.course ? `${unit.title} - ${unit.course.title}` : unit.title;
                        }}
                    />
                </ReferenceField>
                <NumberField source="order" />
                <TextField
                    source="description"
                    sortable={false}
                    cellClassName="truncate max-w-xs"
                />
                <FunctionField
                    label="Has Video"
                    render={(record: ChapterRecord) => record.video_youtube ? "Yes" : "No"}
                    sortable={false}
                />
                <EditButton />
                <DeleteButton />
            </Datagrid>
        </List>
    );
};

export default ChapterList;