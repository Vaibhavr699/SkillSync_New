import React, { useRef } from 'react';
import PropTypes from 'prop-types';

const FileUploader = ({ onUpload, multiple = false, accept }) => {
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    onUpload(files);
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
      />
      <button onClick={() => fileInputRef.current.click()}>
        {multiple ? 'Upload Files' : 'Upload File'}
      </button>
    </div>
  );
};

FileUploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  accept: PropTypes.string,
};

export default FileUploader; 