import React, { useRef, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface AccordionProps {
  title: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [active, setActive] = useState(false);
  const [height, setHeight] = useState('0px');

  const contentSpace = useRef(null);

  function toggleAccordion() {
    setActive(active === false ? true : false);
    // @ts-ignore
    setHeight(active ? '0px' : `${contentSpace.current.scrollHeight}px`);
  }

  return (
    <div className="flex flex-col w-full">
      <span
        className="box-border flex items-center justify-between py-6 appearance-none cursor-pointer focus:outline-none"
        onClick={toggleAccordion}
      >
        <span className="inline-block text-footnote light">{title}</span>
        {active ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
      </span>
      <div
        ref={contentSpace}
        style={{ maxHeight: `${height}` }}
        className="overflow-auto duration-200 ease-in-out transition-max-height"
      >
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
