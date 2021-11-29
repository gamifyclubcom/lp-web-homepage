import React from 'react';

interface Props {
  title?: string;
  description?: string;
  style?: string;
}

const CardText: React.FC<Props> = ({ title, description, style, children }) => {
  return (
    <div className={style}>
      {title ? <div className="mb-5 text-2xl text-white md:text-4xl">{title}</div> : null}
      {description ? <div className="text-base text-gray-500 md:text-lg">{description}</div> : null}
      {children}
    </div>
  );
};
export default CardText;
