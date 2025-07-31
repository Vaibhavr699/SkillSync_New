import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box } from '@mui/material';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'image'
];

const RichTextEditor = ({ value, onChange, placeholder = 'Write something...' }) => {
  return (
    <Box sx={{ 
      '& .ql-container': {
        minHeight: '150px',
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        fontSize: '1rem',
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
      },
      '& .ql-toolbar': {
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
      },
    }}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </Box>
  );
};

export default RichTextEditor;