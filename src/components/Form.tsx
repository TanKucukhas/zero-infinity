'use client';

import { forwardRef } from 'react';
import type { FormHTMLAttributes, ReactNode } from 'react';

type CustomFormProps = FormHTMLAttributes<HTMLFormElement> & {
  className?: string;
  children?: ReactNode;
};

const CustomForm = forwardRef<HTMLFormElement, CustomFormProps>((props, ref) => {
  const { className, children, ...other } = props;

  return (
    <form ref={ref} className={className} {...other}>
      {children}
    </form>
  );
});

CustomForm.displayName = 'CustomForm';

export default CustomForm;