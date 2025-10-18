import React from "react";

const OrDivider = ({ text = "OR" }) => (
    <div className="flex items-center my-2">
      <div className="flex-grow border-t border-gray-300" />
      <span className="px-3 text-gray-500 text-sm">{text}</span>
      <div className="flex-grow border-t border-gray-300" />
    </div>
);

export default OrDivider;