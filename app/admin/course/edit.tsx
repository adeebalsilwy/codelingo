import { SimpleForm, Edit, TextInput, ImageInput, ImageField, useNotify, useRedirect, SaveButton, Toolbar, useRefresh, useRecordContext, useGetRecordId } from "react-admin";
import { useState, useEffect } from "react";
import { Box, Typography, Paper, Card, CardMedia, Grid, Divider, CircularProgress } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

// Custom toolbar with better styling
const CustomToolbar = ({ loading, ...props }: { loading: boolean, [key: string]: any }) => (
  <Toolbar {...props} sx={{ 
    display: 'flex', 
    justifyContent: 'flex-end',
    marginTop: 2,
    backgroundColor: 'transparent',
    borderTop: '1px solid #eee',
    paddingTop: 2,
  }}>
    <SaveButton
      label={loading ? "جارِ الحفظ..." : "حفظ التغييرات"}
      disabled={loading}
      color="primary"
      variant="contained"
      icon={loading ? <CircularProgress size={18} thickness={2} /> : <EditIcon />}
      sx={{
        fontWeight: 'bold',
        padding: '10px 20px',
      }}
      alwaysEnable
    />
  </Toolbar>
);

// Image upload preview component
const ImagePreview = ({ imageSrc }: { imageSrc?: string }) => {
  const defaultImage = '/courses.svg';
  const imageUrl = imageSrc || defaultImage;
  
  return (
    <Card elevation={3} sx={{ marginBottom: 3, maxWidth: 400 }}>
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt="صورة الكورس"
        sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
      />
      <Box sx={{ p: 2, bgcolor: '#f9f9f9' }}>
        <Typography variant="body2" color="text.secondary">
          الصورة الحالية للكورس
        </Typography>
      </Box>
    </Card>
  );
};

export const CourseEdit = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);
  const recordId = useGetRecordId();
  const record = useRecordContext();
  
  // Form validation
  const validateTitle: Function[] = [(value: any) => 
    !value || !value.trim() ? 'يجب إدخال عنوان للكورس' : undefined
  ];
  
  // Track the original image for comparison
  const [originalImage, setOriginalImage] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  
  useEffect(() => {
    if (record?.imageSrc) {
      setOriginalImage(typeof record.imageSrc === 'string' ? 
        record.imageSrc : 
        record.imageSrc?.src || '/courses.svg');
    }
  }, [record]);

  const onSuccess = (data: any) => {
    console.log("[CourseEdit] Update successful:", data);
    setLoading(false);
    setFormError(null);
    notify('تم تحديث الكورس بنجاح', { type: 'success' });
    
    // Force refresh data 
    refresh();
  };

  const onError = (error: any) => {
    console.error("[CourseEdit] Update error:", error || "Unknown error occurred");
    setLoading(false);
    
    const errorMessage = error?.message || 
                         (typeof error === 'string' ? error : 'فشل تحديث الكورس');
    
    setFormError(errorMessage);
    notify(`خطأ: ${errorMessage}`, { type: 'error' });
  };

  // Transform data before submission
  const transform = (data: any) => {
    try {
      console.log("[CourseEdit] Transforming data for submission:", data);

      // Build transformed data
      const transformedData: Record<string, any> = { ...data };
      
      // Ensure description is at least an empty string
      transformedData.description = transformedData.description || '';
      
      // Make sure we preserve the ID
      if (record?.id) {
        transformedData.id = record.id;
      }

      // Handle image formats to ensure it's stored as a string URL
      if (transformedData.imageSrc && typeof transformedData.imageSrc === 'object') {
        if (transformedData.imageSrc.rawFile) {
          // For new file uploads, the file will be handled by dataProvider
        } else if (transformedData.imageSrc.src) {
          // Extract the URL string if it's an object with src property
          transformedData.imageSrc = transformedData.imageSrc.src;
        } else {
          // If it's an object with no useful properties, use original image
          transformedData.imageSrc = originalImage || '/courses.svg';
        }
      } else if (typeof transformedData.imageSrc !== 'string' || !transformedData.imageSrc.trim()) {
        // If no new image provided, use the original one
        transformedData.imageSrc = originalImage || '/courses.svg';
      }

      console.log("[CourseEdit] Transformed data:", transformedData);
      return transformedData;
    } catch (err) {
      console.error("[CourseEdit] Error in transform:", err);
      // Provide a fallback that includes at least id and imageSrc
      return { 
        ...data, 
        id: record?.id,
        description: data.description || '',
        imageSrc: originalImage || '/courses.svg'
      };
    }
  };

  return (
    <Edit 
      mutationOptions={{ 
        onSuccess, 
        onError,
        meta: { timestamp: new Date().getTime() }
      }}
      component="div"
      transform={transform}
      mutationMode="pessimistic"
      id={recordId}
    >
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#3f51b5', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <EditIcon sx={{ mr: 1 }} /> تعديل الكورس
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <SimpleForm 
          toolbar={<CustomToolbar loading={loading} />}
          sanitizeEmptyValues
          noValidate
          warnWhenUnsavedChanges={false}
        >
          {formError && (
            <Box 
              sx={{ 
                backgroundColor: '#fdeded', 
                color: '#5f2120', 
                padding: 2, 
                borderRadius: 1, 
                marginBottom: 3,
                border: '1px solid #ef5350'
              }}
            >
              <Typography variant="body2">
                <strong>خطأ:</strong> {formError}
              </Typography>
            </Box>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextInput 
                source="id" 
                disabled
                label="المعرّف"
                fullWidth
                sx={{ mb: 2 }}
              />
              
              <TextInput 
                source="title" 
                label="عنوان الكورس"
                fullWidth
                helperText="أدخل عنوانًا وصفيًا للكورس"
                sx={{ mb: 2 }}
                required
              />
              
              <TextInput 
                source="description" 
                label="وصف الكورس (اختياري)"
                multiline
                rows={4}
                fullWidth
                helperText="أدخل وصفًا تفصيليًا عن محتوى الكورس (يمكن تركه فارغاً)"
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <PhotoCameraIcon sx={{ mr: 1 }} /> صورة الكورس الحالية
                </Typography>
                <ImagePreview imageSrc={originalImage} />
              </Box>
              
              <Box sx={{ mb: 3, p: 3, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#f9f9f9' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  رفع صورة جديدة:
                </Typography>
                
                <ImageInput 
                  source="imageSrc" 
                  label="اختر صورة"
                  accept={{ 'image/*': [] }}
                  placeholder={<Typography>اسحب صورة أو انقر للاختيار</Typography>}
                >
                  <ImageField source="src" title="معاينة الصورة" />
                </ImageInput>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {loading ? "جارِ رفع الصورة..." : "سيتم رفع الصورة عند حفظ الكورس"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </SimpleForm>
      </Paper>
    </Edit>
  );
};
