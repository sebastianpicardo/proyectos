"use client";

import { useState } from "react";

export const TestComp = () => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      <h3>Test Component</h3>
      <p>Hola mundo</p>
      <button onClick={() => setShowModal(true)}>Abrir</button>
    </div>
  );
};