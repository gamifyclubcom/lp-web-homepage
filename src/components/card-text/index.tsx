import React from 'react';

interface Props {
  title?: string;
  description?: string;
  style?: string;
}

const CardText: React.FC<Props> = ({ title, description, style, children }) => {
  return (
    <div className={style}>
      {title ? <div className="text-white text-2xl md:text-4xl mb-5">{title}</div> : null}
      {description ? (
        <div className="text-white text-base md:text-lg text-gray-500">{description}</div>
      ) : null}
      {children}
    </div>
  );
};
export default CardText;
