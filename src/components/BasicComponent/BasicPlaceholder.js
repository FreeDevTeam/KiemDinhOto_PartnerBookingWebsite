import React from "react";

const BasicPlaceholder = (props) => {
  return (
    <div
      className={`skeleton ${props.className}`}
      style={{
        maxWidth:props.maxWidth || '600px',
        height: props.height ||'100%',
        width: props.width || "100%",
        borderRadius: props.radius || '8px',
      }}
    ></div>
  );
};

export default BasicPlaceholder;
