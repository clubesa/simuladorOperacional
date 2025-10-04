import React from "react";

export const Slider = ({ value, onChange, min, max, step = 1, suffix = "" }) => {
  // Calcula a posição percentual do polegar do controle deslizante
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  
  // Objeto de estilo para posicionar dinamicamente a etiqueta de saída
  const labelStyle = {
    left: `${percent}%`,
    transform: `translateX(-50%)`, // Centraliza a etiqueta
  };

  return (
    // Aumenta o preenchimento esquerdo e diminui o direito para mover a linha para a direita
    <div className="relative pt-2 pb-8 pl-20 pr-2">
      {/* Wrapper para alinhar a etiqueta com a trilha e conter o polegar */}
      <div className="relative mx-[6px]">
        <output 
          style={labelStyle}
          // Etiqueta posicionada abaixo, menor e sem borda
          className="absolute top-full mt-2 font-bold text-base text-[#5c3a21] text-center pointer-events-none"
        >
          {value}{suffix}
        </output>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-[#e0cbb2] rounded-lg appearance-none cursor-pointer slider-thumb"
        />
      </div>
    </div>
  );
};