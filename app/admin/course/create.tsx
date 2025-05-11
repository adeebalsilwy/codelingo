import { SimpleForm, Create, TextInput, ImageInput, ImageField, useNotify, useRedirect, SaveButton, Toolbar } from "react-admin";
import { useState } from "react";
import { Box, Typography, Paper, Card, CardMedia, Grid, Divider, CircularProgress } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
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
      label={loading ? "جارِ الإنشاء..." : "إنشاء كورس جديد"}
      disabled={loading}
      color="primary"
      variant="contained"
      icon={loading ? <CircularProgress size={18} thickness={2} /> : <AddCircleIcon />}
      sx={{
        fontWeight: 'bold',
        padding: '10px 20px',
      }}
      alwaysEnable
    />
  </Toolbar>
);

// Default image preview component
const DefaultImagePreview = () => {
  const defaultImage = '/courses.svg';
  
  return (
    <Card elevation={3} sx={{ marginBottom: 3, maxWidth: 400 }}>
      <CardMedia
        component="img"
        height="200"
        image={defaultImage}
        alt="صورة الكورس الافتراضية"
        sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
      />
      <Box sx={{ p: 2, bgcolor: '#f9f9f9' }}>
        <Typography variant="body2" color="text.secondary">
          الصورة الافتراضية التي ستستخدم إذا لم يتم تحديد صورة
        </Typography>
      </Box>
    </Card>
  );
};

export const CourseCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form validation 
  const validateTitle: Function[] = [(value: any) => 
    !value || !value.trim() ? 'يجب إدخال عنوان للكورس' : undefined
  ];
  
  const onSuccess = (data: any) => {
    console.log("[CourseCreate] Course created successfully:", data);
    setLoading(false);
    setFormError(null);
    notify('تم إنشاء الكورس بنجاح', { type: 'success' });
    redirect('edit', 'courses', data.id);
  };
  
  const onError = (error: any) => {
    console.error("[CourseCreate] Creation error:", error);
    setLoading(false);
    
    const errorMessage = error?.message || 
                         (typeof error === 'string' ? error : 'فشل إنشاء الكورس');
    
    setFormError(errorMessage);
    notify(`خطأ: ${errorMessage}`, { type: 'error' });
  };
  
  // Transform data before submission
  const transform = (data: any) => {
    try {
      console.log("[CourseCreate] Transforming data for submission:", data);
      
      // Make a copy of the data
      const transformedData = { ...data };
      
      // Ensure description is at least an empty string
      transformedData.description = transformedData.description || '';
      
      // Handle image formats to ensure it's stored as a string URL
      if (transformedData.imageSrc && typeof transformedData.imageSrc === 'object') {
        if (transformedData.imageSrc.src) {
          // Extract the URL string if it's an object with src property
          transformedData.imageSrc = transformedData.imageSrc.src;
        }
        // If it has rawFile, it will be handled by dataProvider
      } else if (!transformedData.imageSrc) {
        // No image provided or invalid format, use default
        transformedData.imageSrc = '/courses.svg';
      }
      
      console.log("[CourseCreate] Transformed data:", transformedData);
      return transformedData;
    } catch (err) {
      console.error("[CourseCreate] Error in transform:", err);
      return { 
        ...data, 
        description: data.description || '',
        imageSrc: data.imageSrc || '/courses.svg' 
      };
    }
  };

  return (
    <Create 
      mutationOptions={{ 
        onSuccess, 
        onError,
        meta: { timestamp: new Date().getTime() }
      }}
      transform={transform}
      component="div"
    >
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#3f51b5', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <AddCircleIcon sx={{ mr: 1 }} /> إنشاء كورس جديد
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
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <PhotoCameraIcon sx={{ mr: 1 }} /> الصورة الافتراضية
                </Typography>
                <DefaultImagePreview />
              </Box>
              
              <Box sx={{ mb: 3, p: 3, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#f9f9f9' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  رفع صورة للكورس:
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
                  {loading ? "جارِ رفع الصورة..." : "سيتم رفع الصورة عند إنشاء الكورس"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </SimpleForm>
      </Paper>
    </Create>
  );
};
